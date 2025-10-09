# Adlaan - Django + HTMX Application

A modern Django application built with HTMX for enhanced user experience and real-time interactions.

## 🚀 Features

- **Django 5.2.7** - Latest Django framework
- **HTMX Integration** - Dynamic interactions without JavaScript complexity
- **Modern UI** - Responsive design with CSS Grid and Flexbox
- **Template Inheritance** - DRY principle with base templates
- **Security Best Practices** - CSRF protection, secure headers, and more
- **Production Ready** - Optimized settings and configurations

## 📋 Prerequisites

- Python 3.12+
- pip (Python package manager)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/husainf4l/adlaan.git
   cd adlaan
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Apply migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Run development server:**
   ```bash
   python manage.py runserver
   ```

7. **Open in browser:**
   ```
   http://127.0.0.1:8000/
   ```

## 🏗️ Project Structure

```
adlaan/
├── adlaan_project/          # Django project settings
│   ├── settings.py         # Main settings with security configs
│   ├── urls.py            # URL routing
│   ├── views.py           # View functions
│   └── wsgi.py
├── static/                 # Static files
│   └── css/
│       └── style.css      # Main stylesheet
├── templates/             # HTML templates
│   ├── base.html          # Base template
│   └── home.html          # Home page
├── db.sqlite3             # SQLite database
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
└── README.md
```

## 🎯 Best Practices Implemented

### Security
- CSRF protection enabled
- Secure headers configured
- XSS protection
- Clickjacking protection
- HSTS headers (production ready)

### Performance
- Static files properly configured
- Template inheritance for reusability
- Efficient database queries
- Minimal JavaScript (HTMX only)

### Code Quality
- Clean URL patterns
- Proper view decorators
- Session management
- Error handling

### User Experience
- Responsive design
- Modern CSS with gradients
- Smooth transitions
- Accessibility considerations

## 🔧 Development Commands

```bash
# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Collect static files (production)
python manage.py collectstatic

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

## 🌐 HTMX Features

The application demonstrates HTMX capabilities with:
- **Counter Component**: AJAX-powered increment/decrement
- **No Page Reloads**: Seamless user interactions
- **Session Persistence**: Counter state maintained across requests

## 🚀 Deployment

For production deployment:

1. Set `DEBUG = False`
2. Configure `ALLOWED_HOSTS`
3. Set `SECRET_KEY` securely
4. Enable HTTPS settings
5. Use a production WSGI server (Gunicorn, uWSGI)
6. Configure static file serving

## 📚 Learn More

- [Django Documentation](https://docs.djangoproject.com/)
- [HTMX Documentation](https://htmx.org/docs/)
- [Django-HTMX](https://github.com/adamchainz/django-htmx)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).