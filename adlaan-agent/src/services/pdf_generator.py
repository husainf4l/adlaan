"""
PDF Generation Service with Markdown Support.
Converts markdown to HTML and generates PDFs using WeasyPrint.
"""
from typing import Optional, Dict, Any
import markdown2
from jinja2 import Template
from weasyprint import HTML, CSS
from io import BytesIO
import logging

logger = logging.getLogger(__name__)


class PDFGeneratorService:
    """Service for generating PDFs from markdown content."""
    
    def __init__(self):
        """Initialize PDF generator service."""
        self.default_css = """
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
                margin-top: 0;
                margin-bottom: 12pt;
                border-bottom: 2px solid #333;
                padding-bottom: 6pt;
            }
            h2 {
                font-size: 18pt;
                color: #1a1a1a;
                margin-top: 16pt;
                margin-bottom: 8pt;
            }
            h3 {
                font-size: 14pt;
                color: #1a1a1a;
                margin-top: 12pt;
                margin-bottom: 6pt;
            }
            p {
                margin-top: 0;
                margin-bottom: 8pt;
                text-align: justify;
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
            ul, ol {
                margin: 8pt 0;
                padding-left: 24pt;
            }
            li {
                margin-bottom: 4pt;
            }
            code {
                background-color: #f5f5f5;
                padding: 2pt 4pt;
                border-radius: 2pt;
                font-family: monospace;
                font-size: 10pt;
            }
            pre {
                background-color: #f5f5f5;
                padding: 8pt;
                border-radius: 4pt;
                overflow-x: auto;
                margin: 8pt 0;
            }
            pre code {
                padding: 0;
                background-color: transparent;
            }
        """
    
    def render_to_html(
        self, 
        md_text: str,
        template_vars: Optional[Dict[str, Any]] = None
    ) -> str:
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
            logger.error(f"Error rendering markdown to HTML: {e}")
            raise
    
    def generate_pdf(
        self,
        md_text: str,
        template_vars: Optional[Dict[str, Any]] = None,
        custom_css: Optional[str] = None,
        output_path: Optional[str] = None
    ) -> bytes:
        """
        Generate PDF from markdown text.
        
        Args:
            md_text: Markdown text to convert to PDF
            template_vars: Optional variables to inject into template
            custom_css: Optional custom CSS to apply
            output_path: Optional file path to save PDF (if None, returns bytes)
            
        Returns:
            PDF content as bytes (if output_path is None)
        """
        try:
            # Convert markdown to HTML
            html_content = self.render_to_html(md_text, template_vars)
            
            # Wrap in basic HTML structure
            full_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
                {html_content}
            </body>
            </html>
            """
            
            # Create HTML object
            html_obj = HTML(string=full_html)
            
            # Apply CSS
            css_to_use = custom_css if custom_css else self.default_css
            stylesheets = [CSS(string=css_to_use)] if css_to_use else None
            
            # Generate PDF
            if output_path:
                # Save to file
                html_obj.write_pdf(output_path, stylesheets=stylesheets)
                logger.info(f"PDF generated successfully: {output_path}")
                
                # Also return the bytes
                with open(output_path, 'rb') as f:
                    return f.read()
            else:
                # Return bytes
                pdf_bytes = html_obj.write_pdf(stylesheets=stylesheets)
                logger.info("PDF generated successfully (in-memory)")
                return pdf_bytes
                
        except Exception as e:
            logger.error(f"Error generating PDF: {e}")
            raise
    
    def generate_pdf_from_html(
        self,
        html_content: str,
        custom_css: Optional[str] = None,
        output_path: Optional[str] = None
    ) -> bytes:
        """
        Generate PDF directly from HTML content.
        
        Args:
            html_content: HTML content to convert to PDF
            custom_css: Optional custom CSS to apply
            output_path: Optional file path to save PDF
            
        Returns:
            PDF content as bytes
        """
        try:
            # Create HTML object
            html_obj = HTML(string=html_content)
            
            # Apply CSS
            css_to_use = custom_css if custom_css else self.default_css
            stylesheets = [CSS(string=css_to_use)] if css_to_use else None
            
            # Generate PDF
            if output_path:
                html_obj.write_pdf(output_path, stylesheets=stylesheets)
                logger.info(f"PDF generated successfully: {output_path}")
                
                with open(output_path, 'rb') as f:
                    return f.read()
            else:
                pdf_bytes = html_obj.write_pdf(stylesheets=stylesheets)
                logger.info("PDF generated successfully (in-memory)")
                return pdf_bytes
                
        except Exception as e:
            logger.error(f"Error generating PDF from HTML: {e}")
            raise


# Singleton instance
_pdf_generator_instance = None


def get_pdf_generator() -> PDFGeneratorService:
    """Get or create PDF generator service instance."""
    global _pdf_generator_instance
    if _pdf_generator_instance is None:
        _pdf_generator_instance = PDFGeneratorService()
    return _pdf_generator_instance
