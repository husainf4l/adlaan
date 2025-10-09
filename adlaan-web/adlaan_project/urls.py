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
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('counter/', views.counter, name='counter'),
    
    # Authentication URLs
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    
    # Password Reset URLs
    path('password_reset/', auth_views.PasswordResetView.as_view(
        template_name='auth/password_reset.html',
        email_template_name='auth/password_reset_email.html',
        subject_template_name='auth/password_reset_subject.txt',
        success_url='/password_reset/done/'
    ), name='password_reset'),
    
    # Alternative URL with hyphen for user convenience
    path('password-reset/', auth_views.PasswordResetView.as_view(
        template_name='auth/password_reset.html',
        email_template_name='auth/password_reset_email.html',
        subject_template_name='auth/password_reset_subject.txt',
        success_url='/password_reset/done/'
    ), name='password_reset_alt'),
    
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(
        template_name='auth/password_reset_done.html'
    ), name='password_reset_done'),
    
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
        template_name='auth/password_reset_confirm.html',
        success_url='/reset/done/'
    ), name='password_reset_confirm'),
    
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(
        template_name='auth/password_reset_complete.html'
    ), name='password_reset_complete'),
    
    # Platform URLs
    path('platform/overview/', views.overview, name='overview'),
    path('platform/features/', views.features, name='features'),
    path('platform/ai-engine/', views.ai_engine, name='ai_engine'),
    
    # Workflow URLs
    path('workflows/draft-review/', views.draft_review, name='draft_review'),
    path('workflows/approve-store/', views.approve_store, name='approve_store'),
    
    # Main Pages
    path('vault/', views.vault, name='vault'),
    path('knowledge/', views.knowledge, name='knowledge'),
    path('legaldoc/', views.legal_doc_creator, name='legal_doc_creator'),
    
    # Integration URLs
    path('integrations/outlook/', views.outlook_integration, name='outlook_integration'),
    path('integrations/word/', views.word_integration, name='word_integration'),
    path('integrations/teams/', views.teams_integration, name='teams_integration'),
]
