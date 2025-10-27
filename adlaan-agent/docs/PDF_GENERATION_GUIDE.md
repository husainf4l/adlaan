# PDF Generation with Markdown Support

This project now includes a complete PDF generation pipeline using **markdown2**, **Jinja2**, and **WeasyPrint**.

## 🎯 Overview

The PDF generation service allows you to:
- Convert markdown text to HTML
- Use Jinja2 template variables in markdown
- Generate professional PDF documents
- Apply custom CSS styling

## 📦 Installation

The required packages are already in `requirements.txt`:

```bash
pip install markdown2==2.5.1 weasyprint==62.3 jinja2==3.1.6
```

## 🚀 Quick Start

### Basic Usage

```python
import markdown2
from jinja2 import Template

def render_to_html(md_text):
    html = markdown2.markdown(md_text, extras=["tables"])
    return html

# Example
markdown_text = """
# Contract Agreement
## Payment Terms
| Item | Amount |
|------|--------|
| Total | $10,000 |
"""

html = render_to_html(markdown_text)
print(html)
```

### Using the Service

```python
from src.services.pdf_generator import get_pdf_generator

pdf_gen = get_pdf_generator()

# Convert markdown to HTML
html = pdf_gen.render_to_html(markdown_text)

# Generate PDF
pdf_bytes = pdf_gen.generate_pdf(markdown_text, output_path="document.pdf")
```

### With Template Variables

```python
markdown_template = """
# {{ document_type }}

**Client**: {{ client_name }}  
**Date**: {{ date }}

## Services
{% for service in services %}
- {{ service }}
{% endfor %}
"""

template_vars = {
    "document_type": "Service Agreement",
    "client_name": "Acme Corp",
    "date": "2025-10-22",
    "services": ["Consulting", "Development", "Support"]
}

pdf_bytes = pdf_gen.generate_pdf(markdown_template, template_vars=template_vars)
```

## 🌐 API Endpoints

### Generate PDF from Markdown

**POST** `/api/v2/pdf/generate`

```json
{
  "markdown_content": "# My Document\n\nContent here...",
  "template_vars": {
    "name": "John",
    "date": "2025-10-22"
  },
  "filename": "output.pdf"
}
```

**Response**: PDF file download

### Preview HTML

**POST** `/api/v2/pdf/preview`

```json
{
  "markdown_content": "# My Document\n\nContent here...",
  "template_vars": {
    "name": "John"
  }
}
```

**Response**: HTML preview

## 🎨 Supported Markdown Features

The service supports the following markdown extras:

- **tables** - Full table support
- **fenced-code-blocks** - Code blocks with syntax highlighting
- **header-ids** - Auto-generated header IDs
- **metadata** - Document metadata
- **code-friendly** - Better code rendering
- **break-on-newline** - Preserve line breaks

### Example

```markdown
# Document Title

## Section 1

This is a paragraph with **bold** and *italic* text.

### Code Example

\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`

### Table

| Name | Role | Department |
|------|------|------------|
| John | Dev  | Engineering |
| Jane | PM   | Product |

### Lists

1. First item
2. Second item
3. Third item

- Bullet point 1
- Bullet point 2
```

## 🎨 Custom CSS Styling

You can apply custom CSS to your PDFs:

```python
custom_css = """
    @page {
        size: A4;
        margin: 3cm;
    }
    body {
        font-family: 'Times New Roman', serif;
        font-size: 12pt;
        color: #000;
    }
    h1 {
        color: #900;
        border-bottom: 3px solid #900;
    }
"""

pdf_bytes = pdf_gen.generate_pdf(
    markdown_text,
    custom_css=custom_css
)
```

## 📋 Default CSS

The service includes professional default styling:

- A4 page size with 2cm margins
- Arial font, 11pt
- Professional table styling
- Code block highlighting
- Proper heading hierarchy
- Print-optimized colors

## 🔧 Service Methods

### `render_to_html(md_text, template_vars=None)`

Converts markdown to HTML.

**Parameters:**
- `md_text` (str): Markdown content
- `template_vars` (dict, optional): Jinja2 variables

**Returns:** HTML string

### `generate_pdf(md_text, template_vars=None, custom_css=None, output_path=None)`

Generates PDF from markdown.

**Parameters:**
- `md_text` (str): Markdown content
- `template_vars` (dict, optional): Jinja2 variables
- `custom_css` (str, optional): Custom CSS styling
- `output_path` (str, optional): File path to save PDF

**Returns:** PDF bytes

### `generate_pdf_from_html(html_content, custom_css=None, output_path=None)`

Generates PDF directly from HTML.

**Parameters:**
- `html_content` (str): HTML content
- `custom_css` (str, optional): Custom CSS styling
- `output_path` (str, optional): File path to save PDF

**Returns:** PDF bytes

## 📝 Testing

### Run Standalone Test

```bash
python test_pdf_generation_standalone.py
```

This will:
1. Test markdown to HTML conversion
2. Test template variables
3. Generate sample PDFs
4. Create `test_contract.pdf` and `test_service_agreement.pdf`

### Run API Tests

```bash
# Start the server
python src/main.py

# Test PDF generation endpoint
curl -X POST "http://localhost:8005/api/v2/pdf/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "markdown_content": "# Test Document\n\nThis is a test.",
    "filename": "test.pdf"
  }' \
  --output test.pdf
```

## 🏗️ Architecture

```
src/
├── services/
│   ├── pdf_generator.py    # PDF generation service
│   └── __init__.py          # Exports PDFGeneratorService
├── api/
│   └── v2/
│       └── routes.py        # PDF endpoints
└── ...
```

## 📚 Use Cases

1. **Legal Documents** - Generate contracts, agreements, NDAs
2. **Reports** - Create formatted business reports
3. **Invoices** - Generate professional invoices
4. **Documentation** - Convert technical docs to PDF
5. **Certificates** - Create custom certificates

## 🔒 Production Considerations

1. **File Size Limits** - Consider limiting markdown/PDF size
2. **Rate Limiting** - Implement rate limits for PDF generation
3. **Async Processing** - For large documents, use background tasks
4. **Caching** - Cache generated PDFs when possible
5. **Error Handling** - Validate markdown before processing

## 🐛 Troubleshooting

### WeasyPrint Installation Issues

If WeasyPrint fails to install, you may need system dependencies:

```bash
# Ubuntu/Debian
sudo apt-get install python3-dev python3-pip python3-setuptools python3-wheel \
  python3-cffi libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 \
  libffi-dev shared-mime-info

# macOS
brew install cairo pango gdk-pixbuf libffi
```

### Font Issues

If fonts don't render correctly, install common fonts:

```bash
sudo apt-get install fonts-liberation fonts-dejavu
```

## 📖 Additional Resources

- [markdown2 Documentation](https://github.com/trentm/python-markdown2)
- [WeasyPrint Documentation](https://weasyprint.readthedocs.io/)
- [Jinja2 Documentation](https://jinja.palletsprojects.com/)

## ✨ Features Summary

✅ Markdown to HTML conversion  
✅ Jinja2 template variables  
✅ Table support  
✅ Custom CSS styling  
✅ FastAPI endpoints  
✅ Professional default styling  
✅ Code block support  
✅ Async-ready  
✅ Production-ready service  

---

**Created**: October 22, 2025  
**Version**: 1.0.0
