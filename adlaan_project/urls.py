"""
URL configuration for adlaan_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('counter/', views.counter, name='counter'),
    
    # Platform Pages
    path('platform/overview/', views.overview, name='overview'),
    path('platform/features/', views.features, name='features'),
    path('platform/ai-engine/', views.ai_engine, name='ai_engine'),
    
    # Workflow Pages
    path('workflows/draft-review/', views.draft_review, name='draft_review'),
    path('workflows/approve-store/', views.approve_store, name='approve_store'),
    
    # Vault Page
    path('vault/', views.vault, name='vault'),
    
    # Knowledge Page
    path('knowledge/', views.knowledge, name='knowledge'),
    
    # Integration Pages
    path('integrations/outlook/', views.outlook_integration, name='outlook_integration'),
    path('integrations/word/', views.word_integration, name='word_integration'),
    path('integrations/teams/', views.teams_integration, name='teams_integration'),
    
    # Authentication URLs
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
