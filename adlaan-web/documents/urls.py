from django.urls import path
from . import views

urlpatterns = [
    path("generate/", views.generate_legal_pdf, name="generate_pdf"),
]
