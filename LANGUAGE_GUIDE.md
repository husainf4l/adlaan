# Adlaan - AI-Powered Legal Solutions for MENA Region

A Django-based web application providing AI-powered legal solutions specifically designed for the Middle East and North Africa (MENA) region, inspired by Harvey.ai.

## 🌍 Multi-Language Support

Adlaan supports both **English** and **Arabic** (العربية) with full internationalization (i18n):

- ✅ Bilingual interface (English/Arabic)
- ✅ Right-to-Left (RTL) layout for Arabic
- ✅ Language switcher in navigation
- ✅ URL-based language selection (`/en/`, `/ar/`)
- ✅ Browser language auto-detection

## 🚀 Quick Start

### 1. Access the Application

- **English**: http://127.0.0.1:8000/en/
- **Arabic**: http://127.0.0.1:8000/ar/
- **Auto-detect**: http://127.0.0.1:8000/

### 2. Switch Languages

Use the language dropdown in the navigation bar to switch between English and Arabic instantly.

### 3. Test RTL Support

Navigate to the Arabic version to see:
- Right-to-left text direction
- Mirrored layout
- Proper Arabic font rendering
- Localized content

## 📁 Project Structure

```
adlaan/
├── adlaan_project/         # Django project settings
│   ├── settings.py         # i18n configuration
│   ├── urls.py            # Language-prefixed URLs
│   └── views.py           # View logic
├── templates/             # HTML templates
│   ├── base.html         # Base template with i18n
│   ├── home.html         # Landing page
│   ├── auth/             # Authentication pages
│   └── components/       # Reusable components
├── locale/               # Translation files
│   ├── ar/              # Arabic translations
│   └── en/              # English translations
├── static/              # CSS, JS, images
├── compile_translations.py  # Translation compiler
└── I18N_README.md      # i18n documentation
```

## 🛠️ Technology Stack

- **Backend**: Django 5.2.7
- **Frontend**: HTMX + Tailwind CSS
- **Python**: 3.12.10
- **i18n**: Django's built-in internationalization

## 📝 Adding New Translations

### Method 1: Edit .po files directly

1. Open `locale/ar/LC_MESSAGES/django.po`
2. Add your translations:
   ```po
   msgid "New Feature"
   msgstr "ميزة جديدة"
   ```
3. Compile: `python compile_translations.py`
4. Restart server

### Method 2: Use Django commands (requires gettext)

```bash
# Extract new strings
python manage.py makemessages -l ar

# Edit locale/ar/LC_MESSAGES/django.po

# Compile
python manage.py compilemessages
```

## 🎨 Features

### Home Page
- AI-powered legal solutions messaging
- Interactive HTMX counter demo
- Technology stack showcase
- Responsive design

### Authentication
- Login page
- Signup page
- Session management
- All fully translated

### Navigation
- Sticky header
- Mobile-responsive menu
- Language switcher
- User authentication status

## 🌐 Supported Languages

| Language | Code | Direction | Status |
|----------|------|-----------|--------|
| English  | en   | LTR       | ✅ Complete |
| Arabic   | ar   | RTL       | ✅ Complete |

## 🔧 Development

### Running the Server

```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run development server
python manage.py runserver
```

### Compiling Translations

```bash
# After editing .po files
python compile_translations.py
```

### Adding New Pages

1. Create template with `{% load i18n %}`
2. Wrap text in `{% trans "..." %}`
3. Update `locale/ar/LC_MESSAGES/django.po`
4. Compile translations
5. Test in both languages

## 📖 Documentation

- **Full i18n Guide**: See `I18N_README.md`
- **Django Docs**: https://docs.djangoproject.com/en/5.2/topics/i18n/
- **Project README**: See `README.md`

## 🎯 Roadmap

- [ ] Add more languages (French, Hebrew)
- [ ] Implement AI legal assistant features
- [ ] Add document analysis capabilities
- [ ] Create legal knowledge base
- [ ] Integrate with MENA legal databases

## 🤝 Contributing

When contributing:
1. Always add translations for new text
2. Test both LTR and RTL layouts
3. Update translation files
4. Run `compile_translations.py`
5. Test in all supported languages

## 📞 Support

For questions about internationalization or the Adlaan project:
- Check `I18N_README.md` for detailed i18n documentation
- Review Django i18n documentation
- Contact the development team

## 📜 License

© 2025 Adlaan App. All rights reserved.

---

**Note**: This is a development version. For production deployment, ensure proper security settings and environment configuration.
