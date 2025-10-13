import json
import os
import uuid
import asyncio
import threading
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
from functools import partial

from django.template.loader import render_to_string
from weasyprint import HTML, CSS
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import io
from pikepdf import Pdf
import qrcode
from PIL import Image
import base64
import aiofiles
from jinja2 import Environment, FileSystemLoader, select_autoescape

# Global Jinja2 environment with caching - lazy loaded
JINJA_ENV = None

def get_jinja_env():
    global JINJA_ENV
    if JINJA_ENV is None:
        JINJA_ENV = Environment(
            loader=FileSystemLoader(os.path.join(settings.BASE_DIR, 'templates')),
            autoescape=select_autoescape(['html', 'xml']),
            cache_size=50,
            auto_reload=False
        )
    return JINJA_ENV

# Thread pool for background PDF generation
PDF_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="pdf_generator")

# In-memory cache for recent documents (optional)
DOCUMENT_CACHE = {}
CACHE_MAX_SIZE = 10


def get_cache_key(data):
    """Generate cache key from document metadata"""
    doc_data = data['document']
    key_parts = [
        doc_data.get('title', ''),
        doc_data.get('jurisdiction', 'Jordan'),
        doc_data.get('language', 'en'),
        str(data.get('clauses', []))[:100]  # First 100 chars of clauses
    ]
    return '|'.join(key_parts)


async def render_html_cached(data):
    """Render HTML using Django templates (async compatible)"""
    from django.template.loader import render_to_string
    from asgiref.sync import sync_to_async

    # Use sync_to_async to make render_to_string work in async context
    html_content = await sync_to_async(render_to_string)("legal/base.html", data)
    return html_content


async def generate_qr_code_async(qr_data):
    """Generate QR code asynchronously"""
    loop = asyncio.get_event_loop()
    qr_img = await loop.run_in_executor(None, qrcode.make, qr_data)
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode()
    return qr_base64


async def generate_pdf_async(html_content, css_path, base_url):
    """Generate PDF asynchronously using thread pool"""
    loop = asyncio.get_event_loop()

    def _generate_pdf():
        try:
            return HTML(string=html_content, base_url=base_url).write_pdf(
                stylesheets=[CSS(filename=css_path)] if os.path.exists(css_path) else []
            )
        except Exception as e:
            print(f"CSS loading failed: {e}, using basic styling")
            return HTML(string=html_content).write_pdf()

    return await loop.run_in_executor(PDF_EXECUTOR, _generate_pdf)


async def compress_pdf_async(pdf_bytes):
    """Compress PDF asynchronously"""
    loop = asyncio.get_event_loop()

    def _compress_pdf():
        try:
            pdf_buffer = io.BytesIO(pdf_bytes)
            pdf = Pdf.open(pdf_buffer)
            compressed_buffer = io.BytesIO()
            pdf.save(compressed_buffer, optimize_version=True)
            return compressed_buffer.getvalue()
        except Exception as e:
            print(f"PDF compression failed: {e}, using uncompressed PDF")
            return pdf_bytes

    return await loop.run_in_executor(PDF_EXECUTOR, _compress_pdf)


async def save_pdf_async(pdf_bytes, filename):
    """Save PDF to storage asynchronously"""
    loop = asyncio.get_event_loop()

    def _save_pdf():
        file_path = default_storage.save(filename, ContentFile(pdf_bytes))
        return file_path

    return await loop.run_in_executor(None, _save_pdf)


def stream_progress_updates():
    """Generator for streaming progress updates"""
    import time

    messages = [
        "📄 Analyzing document requirements...",
        "📄 Generating document content...",
        "📄 Rendering professional layout...",
        "📄 Finalizing PDF format...",
        "📄 Optimizing file size...",
        "✅ PDF ready for download!"
    ]

    for message in messages:
        yield f"data: {message}\n\n"
        time.sleep(0.5)  # Simulate processing time


@csrf_exempt
@require_http_methods(["POST"])
async def generate_legal_pdf(request):
    """Optimized async PDF generation with background processing"""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)

    # Check cache first
    cache_key = get_cache_key(data)
    if cache_key in DOCUMENT_CACHE:
        cached_data = DOCUMENT_CACHE[cache_key]
        download_url = request.build_absolute_uri(f'/media/{cached_data["file_path"]}')
        return JsonResponse({
            'success': True,
            'download_url': download_url,
            'filename': cached_data['filename'],
            'doc_id': cached_data['doc_id'],
            'cached': True
        })

    # Generate document ID
    doc_id = f"ADL-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

    # Enhance document data
    data['document'].update({
        'doc_id': doc_id,
        'generated_at': datetime.now().isoformat(),
        'version': data['document'].get('version', '1.0')
    })

    # Generate QR code asynchronously
    qr_data = f"Adlaan Legal Document\nID: {doc_id}\nGenerated: {data['document']['generated_at']}\nJurisdiction: {data['document'].get('jurisdiction', 'Jordan')}"
    data['document']['qr_code'] = await generate_qr_code_async(qr_data)

    # Render HTML using cached Jinja2
    html_content = await render_html_cached(data)

    # Path to CSS file
    css_path = os.path.join(settings.BASE_DIR, "adlaan_project", "static", "pdf.css")

    # Start background PDF generation
    asyncio.create_task(process_pdf_background(
        html_content, css_path, request.build_absolute_uri(),
        data, doc_id, cache_key
    ))

    # Return immediately with streaming response
    return StreamingHttpResponse(
        stream_progress_updates(),
        content_type='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    )


async def process_pdf_background(html_content, css_path, base_url, data, doc_id, cache_key):
    """Background PDF processing task"""
    try:
        # Generate PDF asynchronously
        pdf_bytes = await generate_pdf_async(html_content, css_path, base_url)

        # Compress PDF asynchronously
        compressed_pdf = await compress_pdf_async(pdf_bytes)

        # Save to storage asynchronously
        filename = f"generated_docs/{datetime.now().strftime('%Y/%m')}/{doc_id}.pdf"
        file_path = await save_pdf_async(compressed_pdf, filename)

        # Cache the result
        if len(DOCUMENT_CACHE) >= CACHE_MAX_SIZE:
            # Remove oldest entry
            oldest_key = next(iter(DOCUMENT_CACHE))
            del DOCUMENT_CACHE[oldest_key]

        DOCUMENT_CACHE[cache_key] = {
            'file_path': file_path,
            'filename': f"{data['document']['title'].replace(' ', '_')}.pdf",
            'doc_id': doc_id,
            'timestamp': datetime.now()
        }

        # Clean up old files asynchronously
        asyncio.create_task(cleanup_old_files_async())

        print(f"PDF generation completed for {doc_id}")

    except Exception as e:
        print(f"Background PDF generation failed: {e}")
        import traceback
        traceback.print_exc()


async def cleanup_old_files_async():
    """Async cleanup of old files"""
    loop = asyncio.get_event_loop()

    def _cleanup():
        try:
            media_root = settings.MEDIA_ROOT
            generated_docs_dir = os.path.join(media_root, 'generated_docs')

            if not os.path.exists(generated_docs_dir):
                return

            cutoff_date = datetime.now() - timedelta(days=3)
            deleted_count = 0
            deleted_dirs = 0

            for root, dirs, files in os.walk(generated_docs_dir):
                for file in files:
                    if file.endswith('.pdf'):
                        file_path = os.path.join(root, file)
                        file_mtime = datetime.fromtimestamp(os.path.getmtime(file_path))

                        if file_mtime < cutoff_date:
                            try:
                                os.remove(file_path)
                                deleted_count += 1
                            except OSError as e:
                                print(f"Error removing {file_path}: {e}")

            # Remove empty directories
            for root, dirs, files in os.walk(generated_docs_dir, topdown=False):
                for dir_name in dirs:
                    dir_path = os.path.join(root, dir_name)
                    try:
                        if not os.listdir(dir_path):
                            os.rmdir(dir_path)
                            deleted_dirs += 1
                    except OSError:
                        pass

            if deleted_count > 0 or deleted_dirs > 0:
                print(f"Cleaned up {deleted_count} files and {deleted_dirs} directories")

        except Exception as e:
            print(f"Error during cleanup: {e}")

    await loop.run_in_executor(None, _cleanup)


@csrf_exempt
@require_http_methods(["POST"])
async def generate_legal_pdf(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)

    # Generate document ID
    doc_id = f"ADL-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

    # Enhance document data
    data['document'].update({
        'doc_id': doc_id,
        'generated_at': datetime.now().isoformat(),
        'version': data['document'].get('version', '1.0')
    })

    # Generate QR code for verification
    qr_data = f"Adlaan Legal Document\nID: {doc_id}\nGenerated: {data['document']['generated_at']}\nJurisdiction: {data['document'].get('jurisdiction', 'Jordan')}"
    qr_img = qrcode.make(qr_data)
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode()
    data['document']['qr_code'] = qr_base64

    # Render HTML using cached Jinja2 template
    html_content = await render_html_cached(data)

    # Path to CSS file
    css_path = os.path.join(settings.BASE_DIR, "adlaan_project", "static", "pdf.css")

    # Create cache key for this document
    cache_key = f"pdf_{doc_id}"

    # For now, use synchronous PDF generation (async background tasks don't work in test environment)
    print("DEBUG: Using synchronous PDF generation")

    # Generate PDF synchronously
    try:
        pdf_bytes = HTML(string=html_content, base_url=request.build_absolute_uri()).write_pdf(
            stylesheets=[CSS(filename=css_path)] if os.path.exists(css_path) else []
        )
    except Exception as e:
        print(f"PDF generation failed: {e}")
        return JsonResponse({'error': f'PDF generation failed: {str(e)}'}, status=500)

    # Save synchronously
    filename = f"generated_docs/{datetime.now().strftime('%Y/%m')}/{doc_id}.pdf"
    full_path = os.path.join(settings.MEDIA_ROOT, filename)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'wb') as f:
        f.write(pdf_bytes)

    # Return download URL
    download_url = request.build_absolute_uri(f'/media/{filename}')
    return JsonResponse({
        'success': True,
        'download_url': download_url,
        'filename': f"{data['document']['title'].replace(' ', '_')}.pdf",
        'doc_id': doc_id
    })


def cleanup_old_files():
    """Clean up generated documents older than 3 days"""
    try:
        media_root = settings.MEDIA_ROOT
        generated_docs_dir = os.path.join(media_root, 'generated_docs')

        if not os.path.exists(generated_docs_dir):
            return

        cutoff_date = datetime.now() - timedelta(days=3)

        for root, dirs, files in os.walk(generated_docs_dir):
            for file in files:
                if file.endswith('.pdf'):
                    file_path = os.path.join(root, file)
                    file_mtime = datetime.fromtimestamp(os.path.getmtime(file_path))

                    if file_mtime < cutoff_date:
                        try:
                            os.remove(file_path)
                            print(f"Cleaned up old file: {file_path}")
                        except OSError as e:
                            print(f"Error removing {file_path}: {e}")

        # Remove empty directories
        for root, dirs, files in os.walk(generated_docs_dir, topdown=False):
            for dir_name in dirs:
                dir_path = os.path.join(root, dir_name)
                try:
                    if not os.listdir(dir_path):
                        os.rmdir(dir_path)
                        print(f"Removed empty directory: {dir_path}")
                except OSError:
                    pass

    except Exception as e:
        print(f"Error during cleanup: {e}")


# Legacy GET endpoint for testing
@require_http_methods(["GET"])
def generate_legal_pdf_test(request):
    """Test endpoint with mock data"""
    data = {
        "document": {
            "title": "Software License Agreement",
            "subtitle": "Comprehensive Software Licensing Terms",
            "parties": ["Adlaan Technologies LLC", "Client Company Inc."],
            "date": "2025-10-13",
            "jurisdiction": "Jordan",
            "language": "en",
            "version": "1.0",
            "signed_by": "Authorized Representative",
            "signature_date": "2025-10-13",
            "doc_id": f"ADL-{datetime.now().strftime('%Y%m%d')}-TEST",
            "generated_at": datetime.now().isoformat(),
        },
        "clauses": [
            {
                "title": "1. Definitions",
                "content": '<p>In this Agreement, the following terms shall have the meanings set forth below:</p><ul><li>"Software" means the computer program provided by Licensor.</li><li>"Licensee" means the party receiving the license.</li></ul>',
            },
            {
                "title": "2. Grant of License",
                "content": "<p>Licensor hereby grants Licensee a non-exclusive, non-transferable license to use the Software in accordance with the terms of this Agreement.</p>",
            },
            {
                "title": "3. Restrictions",
                "content": "<p>Licensee shall not: (a) copy the Software; (b) modify the Software; (c) distribute the Software.</p>",
            },
            {
                "title": "4. Termination",
                "content": "<p>This Agreement may be terminated by either party upon 30 days written notice.</p>",
            },
        ],
    }

    # Generate QR code
    qr_data = f"Adlaan Legal Document\nID: {data['document']['doc_id']}\nGenerated: {data['document']['generated_at']}\nJurisdiction: {data['document']['jurisdiction']}"
    qr_img = qrcode.make(qr_data)
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode()
    data['document']['qr_code'] = qr_base64

    # Render HTML
    html = render_to_string("legal/base.html", data)

    # Generate PDF
    try:
        pdf_bytes = HTML(string=html).write_pdf()
    except Exception as e:
        print(f"PDF generation failed: {e}")
        return HttpResponse("PDF generation failed", status=500)

    # Compress
    try:
        pdf_buffer = io.BytesIO(pdf_bytes)
        pdf = Pdf.open(pdf_buffer)
        compressed_buffer = io.BytesIO()
        pdf.save(compressed_buffer, optimize_version=True)
        compressed_pdf = compressed_buffer.getvalue()
    except Exception as e:
        print(f"PDF compression failed: {e}, using uncompressed PDF")
        compressed_pdf = pdf_bytes

    # Response
    response = HttpResponse(compressed_pdf, content_type="application/pdf")
    response["Content-Disposition"] = f'inline; filename="{data["document"]["title"].replace(" ", "_")}.pdf"'
    return response
