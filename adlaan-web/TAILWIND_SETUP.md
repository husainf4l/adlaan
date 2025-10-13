# Tailwind CSS Setup Guide

## Overview
This project uses Tailwind CSS v4.1.14 installed via npm for proper production setup instead of CDN.

## Installation
Tailwind CSS is already installed. If you need to reinstall:

```bash
cd adlaan-web
npm install
```

## Building CSS

### Development (with watch mode)
```bash
cd adlaan-web
npm run watch-css
```
This will automatically rebuild CSS when you make changes to `static/css/tailwind.css`.

### Production build
```bash
cd adlaan-web
npm run build-css
```

## File Structure
```
adlaan-web/
├── static/css/
│   ├── tailwind.css    # Source file with Tailwind imports
│   └── output.css      # Compiled CSS (auto-generated)
├── package.json        # npm scripts and dependencies
└── templates/
    └── base.html       # Loads output.css via Django static files
```

## Django Integration
- CSS is loaded via `{% static 'css/output.css' %}` in `base.html`
- Static files are collected with `python manage.py collectstatic`
- No CDN dependencies for production

## Custom Styles
Add custom styles to `static/css/tailwind.css` in the utilities layer:

```css
@layer utilities {
  .custom-class {
    /* Your styles here */
  }
}
```

## Development Workflow
1. Make changes to `static/css/tailwind.css`
2. Run `npm run watch-css` to auto-build
3. Django will serve the updated CSS automatically
4. For production, run `npm run build-css` and collect static files