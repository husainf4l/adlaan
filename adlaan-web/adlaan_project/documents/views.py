import json
from django.template.loader import render_to_string
from weasyprint import HTML, CSS
from django.http import HttpResponse
from django.conf import settings
import os
from pikepdf import Pdf
import io
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


@csrf_exempt
@require_http_methods(["GET", "POST"])
def generate_legal_pdf(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return HttpResponse("Invalid JSON", status=400)
    else:
        # Mock data for GET testing
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
                "qr_code": None,
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

    # Render HTML using Jinja2 template
    html = render_to_string("legal/base.html", data)

    # Path to CSS file
    css_path = os.path.join(settings.BASE_DIR, "adlaan_project", "static", "pdf.css")

    # Generate PDF
    pdf_bytes = HTML(string=html, base_url=request.build_absolute_uri()).write_pdf(
        stylesheets=[CSS(filename=css_path)]
    )

    # Compress PDF using pikepdf
    pdf_buffer = io.BytesIO(pdf_bytes)
    pdf = Pdf.open(pdf_buffer)
    compressed_buffer = io.BytesIO()
    pdf.save(compressed_buffer, optimize_version=True)
    compressed_pdf = compressed_buffer.getvalue()

    # Create response
    response = HttpResponse(compressed_pdf, content_type="application/pdf")
    response["Content-Disposition"] = (
        f'inline; filename="{data["document"]["title"].replace(" ", "_")}.pdf"'
    )
    return response
