# Internationalization (i18n) Setup for Adlaan

This document describes the internationalization setup for the Adlaan application, supporting both English and Arabic for the MENA region.

## Overview

Adlaan is configured to support:
- **English (en)** - Default language
- **Arabic (ar)** - Right-to-left (RTL) support included

## Features

✅ Automatic language detection from browser preferences
✅ Language switcher in navigation (both desktop and mobile)
✅ URL-based language selection (e.g., `/en/`, `/ar/`)
✅ RTL (Right-to-Left) support for Arabic
✅ Session-based language persistence
✅ Fully translated templates

## Directory Structure

```
adlaan/
├── locale/
│   ├── ar/
│   │   └── LC_MESSAGES/
│   │       ├── django.po    # Arabic translations (editable)
│   │       └── django.mo    # Compiled translations (binary)
│   └── en/
│       └── LC_MESSAGES/
│           ├── django.po    # English translations
│           └── django.mo    # Compiled translations
├── templates/
│   ├── base.html            # Base template with i18n tags
│   ├── home.html            # Translated home page
│   └── auth/
│       ├── login.html       # Translated login page
│       └── signup.html      # Translated signup page
└── compile_translations.py  # Custom translation compiler
```

## Configuration

### Settings (`settings.py`)

```python
# Default language
LANGUAGE_CODE = 'en'

# Supported languages
LANGUAGES = [
    ('en', 'English'),
    ('ar', 'العربية'),  # Arabic
]

# Translation files location
LOCALE_PATHS = [
    BASE_DIR / 'locale',
]

# Enable internationalization
USE_I18N = True
```

### Middleware

The `LocaleMiddleware` is configured to detect and set the user's language:

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',  # Language detection
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]
```

### URLs (`urls.py`)

URLs are prefixed with language codes using `i18n_patterns`:

```python
from django.conf.urls.i18n import i18n_patterns

# URLs without language prefix
urlpatterns = [
    path('admin/', admin.site.urls),
    path('i18n/setlang/', set_language, name='set_language'),
]

# URLs with language prefix (/en/, /ar/)
urlpatterns += i18n_patterns(
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    # ... other URLs
)
```

## Usage

### In Templates

1. **Load the i18n template tags:**
   ```django
   {% load i18n %}
   ```

2. **Translate strings:**
   ```django
   <h1>{% trans "Welcome to Adlaan" %}</h1>
   ```

3. **Translate with variables (blocktrans):**
   ```django
   {% blocktrans with name=user.username %}
   Welcome, {{ name }}!
   {% endblocktrans %}
   ```

4. **Language switcher:**
   ```django
   <form action="{% url 'set_language' %}" method="post">
       {% csrf_token %}
       <input name="next" type="hidden" value="{{ request.path }}">
       <select name="language" onchange="this.form.submit()">
           {% get_current_language as LANGUAGE_CODE %}
           {% get_available_languages as LANGUAGES %}
           {% for lang_code, lang_name in LANGUAGES %}
               <option value="{{ lang_code }}" 
                       {% if lang_code == LANGUAGE_CODE %}selected{% endif %}>
                   {{ lang_name }}
               </option>
           {% endfor %}
       </select>
   </form>
   ```

### RTL Support

The base template automatically detects Arabic and applies RTL styling:

```django
{% get_current_language_bidi as LANGUAGE_BIDI %}
<html dir="{% if LANGUAGE_BIDI %}rtl{% else %}ltr{% endif %}">
```

Custom CSS is included for RTL layout adjustments.

## Adding New Translations

### Method 1: Using GNU Gettext (Recommended)

If you have GNU Gettext installed:

```bash
# Extract translatable strings from templates
python manage.py makemessages -l ar

# Edit the .po file
# locale/ar/LC_MESSAGES/django.po

# Compile translations
python manage.py compilemessages
```

### Method 2: Manual Editing (Current Setup)

Since gettext tools are not installed on Windows, use the custom compiler:

1. **Edit translation files:**
   ```bash
   # Edit: locale/ar/LC_MESSAGES/django.po
   msgid "Welcome"
   msgstr "مرحباً"
   ```

2. **Compile translations:**
   ```bash
   python compile_translations.py
   ```

## Translation File Format (.po)

Example from `locale/ar/LC_MESSAGES/django.po`:

```po
msgid "Home"
msgstr "الرئيسية"

msgid "About"
msgstr "عن التطبيق"

msgid "AI-Powered Legal Solutions"
msgstr "حلول قانونية مدعومة بالذكاء الاصطناعي"
```

## URL Examples

- English home: `http://localhost:8000/en/`
- Arabic home: `http://localhost:8000/ar/`
- English login: `http://localhost:8000/en/login/`
- Arabic login: `http://localhost:8000/ar/login/`

## Browser Language Detection

Django automatically detects the user's preferred language from:
1. Language selected via the language switcher (stored in session)
2. `Accept-Language` HTTP header
3. Default language (`LANGUAGE_CODE`)

## Best Practices

### DO ✅

- Always use `{% trans %}` for static strings
- Use `{% blocktrans %}` for strings with variables
- Keep translation keys consistent across languages
- Test RTL layout with Arabic content
- Run `compile_translations.py` after editing `.po` files
- Use semantic, descriptive translation strings

### DON'T ❌

- Don't hardcode strings in templates
- Don't mix translated and non-translated content
- Don't forget to compile after editing `.po` files
- Don't modify `.mo` files directly (they're binary)
- Don't use complex HTML in translation strings

## Troubleshooting

### Problem: Translations not showing

**Solution:**
1. Ensure `.mo` files exist: `locale/ar/LC_MESSAGES/django.mo`
2. Run: `python compile_translations.py`
3. Restart Django development server
4. Clear browser cache

### Problem: UnicodeDecodeError

**Solution:**
- Ensure all `.po` files are saved with UTF-8 encoding
- Recompile using: `python compile_translations.py`
- Check that `.mo` files use proper byte order (little-endian)

### Problem: RTL layout issues

**Solution:**
- Check HTML `dir` attribute: `<html dir="rtl">`
- Review custom RTL CSS in `base.html`
- Test with Arabic content, not English

### Problem: Language not persisting

**Solution:**
- Ensure `SessionMiddleware` is before `LocaleMiddleware`
- Check that cookies are enabled in browser
- Verify `set_language` view is working

## Installing GNU Gettext (Optional)

For full Django i18n support with `makemessages` command:

### Windows
1. Download from: https://mlocati.github.io/articles/gettext-iconv-windows.html
2. Install and add to PATH
3. Restart terminal

### Linux/Mac
```bash
# Ubuntu/Debian
sudo apt-get install gettext

# Mac
brew install gettext
```

## References

- [Django i18n Documentation](https://docs.djangoproject.com/en/5.2/topics/i18n/)
- [Django Translation](https://docs.djangoproject.com/en/5.2/topics/i18n/translation/)
- [RTL Support](https://django-rtl.readthedocs.io/)

## Support

For issues or questions about internationalization in Adlaan, please contact the development team.

---

**Last Updated:** October 8, 2025
**Django Version:** 5.2.7
**Python Version:** 3.12.10
