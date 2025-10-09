from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.decorators.http import require_GET
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib import messages

def home(request):
    return render(request, 'home.html')

@require_GET
def counter(request):
    """HTMX counter view - demonstrates AJAX functionality"""
    action = request.GET.get('action', '')
    current_value = int(request.session.get('counter', 0))

    if action == 'increment':
        current_value += 1
    elif action == 'decrement':
        current_value -= 1

    request.session['counter'] = current_value
    return HttpResponse(str(current_value))

def login_view(request):
    """Handle user login"""
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Welcome back, {username}!')
                return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password.')
    else:
        form = AuthenticationForm()
    
    return render(request, 'auth/login.html', {'form': form})

def signup_view(request):
    """Handle user registration"""
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created successfully! Welcome, {username}!')
            login(request, user)
            return redirect('dashboard')
        else:
            for error in form.errors.values():
                messages.error(request, error)
    else:
        form = UserCreationForm()
    
    return render(request, 'auth/signup.html', {'form': form})

def logout_view(request):
    """Handle user logout"""
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('home')

def overview(request):
    """Platform Overview page"""
    return render(request, 'platform/overview.html')

def features(request):
    """Platform Features page"""
    return render(request, 'platform/features.html')

def ai_engine(request):
    """AI Engine page"""
    return render(request, 'platform/ai_engine.html')

def draft_review(request):
    """Draft and Review Workflow page"""
    return render(request, 'workflows/draft_review.html')

def approve_store(request):
    """Approve and Store Workflow page"""
    return render(request, 'workflows/approve_store.html')

def vault(request):
    """Vault - Document Management page"""
    return render(request, 'vault.html')

def knowledge(request):
    """Knowledge - Legal Research & Resources page"""
    return render(request, 'knowledge.html')

def outlook_integration(request):
    """Outlook Integration page"""
    return render(request, 'integrations/outlook.html')

def word_integration(request):
    """Word Integration page"""
    return render(request, 'integrations/word.html')

def teams_integration(request):
    """Teams Integration page"""
    return render(request, 'integrations/teams.html')

def dashboard(request):
    """User Dashboard - Main landing page after login"""
    return render(request, 'dashboard.html')

def legal_doc_creator(request):
    """Legal Document Creator - AI Chat with Document Creation - Split view with streaming chat and document editor"""
    return render(request, 'legal_doc_creator.html')