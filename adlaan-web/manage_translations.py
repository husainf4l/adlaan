"""
Translation Management Helper for Adlaan
Provides utilities to manage translations without requiring gettext tools.
"""
import os
import sys
from pathlib import Path

def check_translations():
    """Check if all translations are compiled and up to date."""
    locale_dir = Path(__file__).parent / 'locale'
    status = []
    
    for lang_dir in locale_dir.iterdir():
        if lang_dir.is_dir() and (lang_dir / 'LC_MESSAGES').exists():
            lang_code = lang_dir.name
            po_file = lang_dir / 'LC_MESSAGES' / 'django.po'
            mo_file = lang_dir / 'LC_MESSAGES' / 'django.mo'
            
            if po_file.exists():
                if mo_file.exists():
                    po_time = po_file.stat().st_mtime
                    mo_time = mo_file.stat().st_mtime
                    if po_time > mo_time:
                        status.append(f"⚠️  {lang_code}: .po file is newer than .mo file - needs recompilation")
                    else:
                        status.append(f"✅ {lang_code}: translations are up to date")
                else:
                    status.append(f"❌ {lang_code}: .mo file missing - needs compilation")
            else:
                status.append(f"❌ {lang_code}: .po file missing")
    
    return status

def list_translations():
    """List all available translations."""
    locale_dir = Path(__file__).parent / 'locale'
    translations = {}
    
    for lang_dir in locale_dir.iterdir():
        if lang_dir.is_dir():
            po_file = lang_dir / 'LC_MESSAGES' / 'django.po'
            if po_file.exists():
                # Count translations
                count = 0
                with open(po_file, 'r', encoding='utf-8') as f:
                    for line in f:
                        if line.startswith('msgid "') and line.strip() != 'msgid ""':
                            count += 1
                translations[lang_dir.name] = count
    
    return translations

def print_help():
    """Print help information."""
    print("""
Adlaan Translation Manager
==========================

Usage: python manage_translations.py [command]

Commands:
    check       Check translation status
    list        List all translations and their counts
    compile     Compile all translations (same as compile_translations.py)
    help        Show this help message

Examples:
    python manage_translations.py check
    python manage_translations.py list
    python manage_translations.py compile
    """)

def main():
    if len(sys.argv) < 2:
        print_help()
        return
    
    command = sys.argv[1].lower()
    
    if command == 'check':
        print("\n🔍 Checking translation status...\n")
        status = check_translations()
        for s in status:
            print(s)
        print()
        
    elif command == 'list':
        print("\n📋 Available translations:\n")
        translations = list_translations()
        for lang, count in translations.items():
            print(f"  {lang}: {count} strings")
        print()
        
    elif command == 'compile':
        print("\n🔨 Compiling translations...\n")
        # Import and run the compile function
        from compile_translations import compile_translations
        compile_translations()
        
    elif command == 'help':
        print_help()
        
    else:
        print(f"Unknown command: {command}")
        print_help()

if __name__ == '__main__':
    main()
