"""
Standalone test of PDF generation functionality.
Tests the render_to_html function directly without full service infrastructure.
"""
import markdown2
from jinja2 import Template
from weasyprint import HTML, CSS


def render_to_html(md_text, template_vars=None):
    """
    Convert markdown text to HTML.
    
    Args:
        md_text: Markdown text to convert
        template_vars: Optional variables to inject into template
        
    Returns:
        Rendered HTML string
    """
    try:
        # If template_vars provided, render markdown as Jinja2 template first
        if template_vars:
            template = Template(md_text)
            md_text = template.render(**template_vars)
        
        # Convert markdown to HTML with extras
        html = markdown2.markdown(
            md_text, 
            extras=[
                "tables",
                "fenced-code-blocks",
                "header-ids",
                "metadata",
                "code-friendly",
                "break-on-newline"
            ]
        )
        
        return html
        
    except Exception as e:
        print(f"Error rendering markdown to HTML: {e}")
        raise


def generate_pdf(md_text, template_vars=None, output_path="output.pdf"):
    """Generate PDF from markdown."""
    # Convert markdown to HTML
    html_content = render_to_html(md_text, template_vars)
    
    # Wrap in basic HTML structure
    full_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Document</title>
    </head>
    <body>
        {html_content}
    </body>
    </html>
    """
    
    # Default CSS
    css = """
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
        }
        h1 {
            font-size: 24pt;
            color: #1a1a1a;
            border-bottom: 2px solid #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 12pt 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8pt;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
    """
    
    # Generate PDF
    html_obj = HTML(string=full_html)
    pdf_bytes = html_obj.write_pdf(stylesheets=[CSS(string=css)])
    
    # Save to file
    with open(output_path, 'wb') as f:
        f.write(pdf_bytes)
    
    return pdf_bytes


if __name__ == "__main__":
    print("=" * 80)
    print("Testing Markdown to HTML and PDF Generation")
    print("=" * 80)
    print()
    
    # Test 1: Basic markdown to HTML
    print("Test 1: Basic Markdown to HTML")
    print("-" * 80)
    
    markdown_text = """
# Contract Agreement

## Parties Involved

- **Party A**: John Doe
- **Party B**: Jane Smith

## Terms

1. Payment of $10,000
2. Delivery by January 31, 2025
3. 30-day warranty period

## Payment Schedule

| Milestone | Amount | Due Date |
|-----------|--------|----------|
| Initial | $3,000 | Jan 1 |
| Midpoint | $4,000 | Jan 15 |
| Final | $3,000 | Jan 31 |
"""
    
    html = render_to_html(markdown_text)
    print("✅ HTML rendered successfully!")
    print(f"📊 HTML length: {len(html)} characters")
    print()
    print("Sample HTML:")
    print(html[:500])
    print()
    
    # Test 2: Markdown with template variables
    print("\nTest 2: Markdown with Template Variables")
    print("-" * 80)
    
    template_md = """
# {{ doc_type }}

**Client**: {{ client_name }}  
**Date**: {{ date }}

## Services

{{ client_name }} agrees to the following:

{% for service in services %}
- {{ service }}
{% endfor %}

**Total Cost**: ${{ total_cost }}
"""
    
    vars = {
        "doc_type": "Service Agreement",
        "client_name": "Acme Corp",
        "date": "October 22, 2025",
        "services": ["Web Development", "UI/UX Design", "Testing"],
        "total_cost": "25,000"
    }
    
    html = render_to_html(template_md, vars)
    print("✅ HTML with template variables rendered successfully!")
    print(f"📊 HTML length: {len(html)} characters")
    print()
    
    # Test 3: Generate PDF
    print("\nTest 3: Generate PDF File")
    print("-" * 80)
    
    pdf_bytes = generate_pdf(markdown_text, output_path="test_contract.pdf")
    print(f"✅ PDF generated successfully!")
    print(f"📄 File: test_contract.pdf")
    print(f"📊 Size: {len(pdf_bytes):,} bytes")
    print()
    
    # Test 4: Generate PDF with template variables
    print("\nTest 4: Generate PDF with Template Variables")
    print("-" * 80)
    
    pdf_bytes = generate_pdf(template_md, vars, output_path="test_service_agreement.pdf")
    print(f"✅ PDF with template generated successfully!")
    print(f"📄 File: test_service_agreement.pdf")
    print(f"📊 Size: {len(pdf_bytes):,} bytes")
    print()
    
    print("=" * 80)
    print("✨ All tests completed successfully!")
    print("=" * 80)
