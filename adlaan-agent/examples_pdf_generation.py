"""
Example usage of PDF generation from markdown.
Demonstrates the render_to_html function and PDF generation.
"""
from src.services.pdf_generator import get_pdf_generator


def example_basic_markdown():
    """Example: Basic markdown to HTML conversion."""
    pdf_gen = get_pdf_generator()
    
    markdown_text = """
# Legal Document Example

## Contract Overview

This is a sample legal document generated from markdown.

### Key Terms

- **Party A**: The first contracting party
- **Party B**: The second contracting party
- **Effective Date**: January 1, 2025

### Terms and Conditions

1. Both parties agree to the terms outlined in this document
2. Payment shall be made within 30 days
3. Contract duration is 12 months

## Financial Details

| Description | Amount | Due Date |
|------------|--------|----------|
| Initial Payment | $10,000 | Feb 1, 2025 |
| Monthly Fee | $2,500 | 1st of month |
| Final Payment | $5,000 | Dec 31, 2025 |

## Legal Notice

This document is legally binding. Please review carefully.

---

*Document generated on: {{ date }}*
"""
    
    # Render to HTML
    html = pdf_gen.render_to_html(markdown_text)
    print("HTML Output:")
    print(html)
    print("\n" + "="*80 + "\n")
    
    return html


def example_with_template_vars():
    """Example: Markdown with Jinja2 template variables."""
    pdf_gen = get_pdf_generator()
    
    markdown_text = """
# Employment Agreement

**Employee Name**: {{ employee_name }}  
**Position**: {{ position }}  
**Start Date**: {{ start_date }}  
**Salary**: ${{ salary }}

## Responsibilities

{{ employee_name }} will be responsible for:

{% for responsibility in responsibilities %}
- {{ responsibility }}
{% endfor %}

## Benefits

- Health Insurance
- 401(k) Matching
- {{ vacation_days }} days vacation per year

---

*Signed on {{ date }}*
"""
    
    template_vars = {
        "employee_name": "John Doe",
        "position": "Senior Developer",
        "start_date": "March 1, 2025",
        "salary": "120,000",
        "responsibilities": [
            "Develop and maintain web applications",
            "Review code from team members",
            "Mentor junior developers"
        ],
        "vacation_days": 20,
        "date": "October 22, 2025"
    }
    
    # Render to HTML with template variables
    html = pdf_gen.render_to_html(markdown_text, template_vars)
    print("HTML Output with Template Variables:")
    print(html)
    print("\n" + "="*80 + "\n")
    
    return html


def example_generate_pdf():
    """Example: Generate PDF file from markdown."""
    pdf_gen = get_pdf_generator()
    
    markdown_text = """
# Professional Services Agreement

## Parties

This agreement is entered into between:

- **Client**: Acme Corporation
- **Consultant**: Jane Smith Consulting LLC

## Scope of Work

The consultant shall provide the following services:

1. Strategic planning and advisory
2. Market research and analysis
3. Implementation support

## Compensation

| Service Type | Rate | Estimated Hours |
|--------------|------|-----------------|
| Consulting | $250/hr | 40 hours |
| Research | $150/hr | 20 hours |
| Support | $100/hr | 10 hours |

**Total Estimated Cost**: $13,500

## Terms

- Payment due within 15 days of invoice
- Services to be completed by end of Q1 2025
- All intellectual property remains with the client

---

**Signatures**

Client: _________________ Date: _______

Consultant: _____________ Date: _______
"""
    
    # Generate PDF
    pdf_bytes = pdf_gen.generate_pdf(markdown_text, output_path="example_contract.pdf")
    
    print(f"✅ PDF generated successfully!")
    print(f"📄 File: example_contract.pdf")
    print(f"📊 Size: {len(pdf_bytes):,} bytes")
    
    return pdf_bytes


def example_custom_css():
    """Example: Generate PDF with custom CSS styling."""
    pdf_gen = get_pdf_generator()
    
    markdown_text = """
# Confidentiality Agreement

## Overview
This agreement establishes the terms of confidentiality between the parties.

## Confidential Information
All technical, business, and financial information disclosed.

## Obligations
- Maintain confidentiality
- Limit access to authorized personnel
- Return or destroy information upon request

## Duration
This agreement remains in effect for 3 years.
"""
    
    custom_css = """
        @page {
            size: A4;
            margin: 3cm;
            @top-center {
                content: "CONFIDENTIAL";
                color: red;
                font-weight: bold;
            }
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.8;
            color: #000;
        }
        h1 {
            color: #900;
            border-bottom: 3px solid #900;
            text-transform: uppercase;
        }
        h2 {
            color: #600;
            margin-top: 20pt;
        }
    """
    
    pdf_bytes = pdf_gen.generate_pdf(
        markdown_text, 
        custom_css=custom_css,
        output_path="confidential_agreement.pdf"
    )
    
    print(f"✅ PDF with custom styling generated!")
    print(f"📄 File: confidential_agreement.pdf")
    print(f"📊 Size: {len(pdf_bytes):,} bytes")
    
    return pdf_bytes


if __name__ == "__main__":
    print("=" * 80)
    print("PDF Generation Examples")
    print("=" * 80)
    print()
    
    # Example 1: Basic HTML rendering
    print("1️⃣  Example 1: Basic Markdown to HTML")
    print("-" * 80)
    example_basic_markdown()
    
    # Example 2: Template variables
    print("2️⃣  Example 2: Markdown with Template Variables")
    print("-" * 80)
    example_with_template_vars()
    
    # Example 3: Generate PDF
    print("3️⃣  Example 3: Generate PDF File")
    print("-" * 80)
    example_generate_pdf()
    print()
    
    # Example 4: Custom CSS
    print("4️⃣  Example 4: Generate PDF with Custom Styling")
    print("-" * 80)
    example_custom_css()
    print()
    
    print("=" * 80)
    print("✨ All examples completed successfully!")
    print("=" * 80)
