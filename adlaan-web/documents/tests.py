# Tests for documents
from django.test import TestCase
from django.urls import reverse
from django.template.loader import render_to_string


class DocumentGenerationTest(TestCase):
    def test_template_rendering(self):
        """Test that legal templates render without errors."""
        data = {
            "document": {"title": "Test", "version": "1.0"},
            "clauses": [{"title": "Test Clause", "content": "<p>Test</p>"}],
        }
        html = render_to_string("legal/base.html", data)
        self.assertIn("Test", html)

    def test_pdf_generation_view(self):
        """Test PDF generation view returns PDF."""
        response = self.client.get(reverse("generate_pdf"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/pdf")
