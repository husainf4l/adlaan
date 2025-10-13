# Adlaan Document Generator

This module provides a Jinja2 + WeasyPrint pipeline for generating professional legal PDFs integrated with LangGraph/LangChain.

## Architecture

- **Templates**: Modular Jinja2 templates in `templates/legal/`
  - `base.html`: Main template with includes
  - `cover.html`: Document cover page
  - `toc.html`: Table of contents
  - `clauses.html`: Dynamic clauses rendering
  - `signature.html`: Signature section with QR code

- **Styling**: Single `static/pdf.css` with professional typography, colors, and @page rules for headers/footers.

- **Pipeline**:
  1. LangGraph Agent → Structured JSON (clauses, metadata)
  2. Jinja2 Template Rendering
  3. WeasyPrint HTML → PDF conversion
  4. pikepdf compression
  5. Optional: ReportLab for signatures/QR, upload to Azure/S3

## Usage

### Generate PDF

POST to `/documents/generate/` with JSON data:

```json
{
  "document": {
    "title": "Agreement Title",
    "parties": ["Party A", "Party B"],
    "date": "2025-10-13",
    "jurisdiction": "Jordan",
    "language": "en",
    "version": "1.0"
  },
  "clauses": [
    {"title": "Clause 1", "content": "<p>Content</p>"}
  ]
}
```

Response: PDF file download.

### Template Structure

- Variables: `{{ document.title }}`, `{{ clause.content | safe }}`
- Loops: `{% for clause in clauses %}`
- Includes: `{% include 'legal/cover.html' %}`

### Styling Guidelines

- Fonts: Lato/Montserrat
- Sizes: Title 22pt, Headings 14pt, Body 11pt
- Line height: 1.4
- Margins: 2.5cm
- Colors: #333 text, #003366 headings

### Optimization

- Templates reduced by consolidating partials
- Single CSS file, minified
- PDF compression with pikepdf (< 2 MB)
- Preload fonts for faster rendering

## Dependencies

- WeasyPrint: HTML to PDF
- pikepdf: PDF compression
- Django: Template rendering

## Deployment

1. Install dependencies: `pip install -r requirements.txt`
2. Collect static: `python manage.py collectstatic`
3. Run server: `python manage.py runserver`

## Testing

Generate sample PDF: Visit `/documents/generate/` (GET for mock data)
