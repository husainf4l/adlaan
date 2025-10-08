"""
Compile .po files to .mo files without requiring gettext tools.
This is a workaround for Windows systems without gettext installed.
"""
import os
import struct
from pathlib import Path

def parse_po_file(po_path):
    """Parse a .po file and return a dictionary of translations."""
    translations = {}
    current_msgid = []
    current_msgstr = []
    in_msgid = False
    in_msgstr = False
    
    with open(po_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.rstrip('\n\r')
            
            # Skip comments and empty lines
            if not line or line.startswith('#'):
                # Save previous entry if we hit a comment or empty line
                if in_msgstr and current_msgid:
                    msgid = ''.join(current_msgid)
                    msgstr = ''.join(current_msgstr)
                    if msgid:  # Don't store empty msgid
                        translations[msgid] = msgstr
                    current_msgid = []
                    current_msgstr = []
                    in_msgid = False
                    in_msgstr = False
                continue
            
            # Start of msgid
            if line.startswith('msgid '):
                # Save previous entry
                if in_msgstr and current_msgid:
                    msgid = ''.join(current_msgid)
                    msgstr = ''.join(current_msgstr)
                    if msgid:
                        translations[msgid] = msgstr
                
                # Start new entry
                current_msgid = [line[6:].strip().strip('"')]
                current_msgstr = []
                in_msgid = True
                in_msgstr = False
                
            # Start of msgstr
            elif line.startswith('msgstr '):
                current_msgstr = [line[7:].strip().strip('"')]
                in_msgid = False
                in_msgstr = True
                
            # Continuation line (quoted string)
            elif line.strip().startswith('"') and line.strip().endswith('"'):
                text = line.strip()[1:-1]  # Remove quotes
                if in_msgid:
                    current_msgid.append(text)
                elif in_msgstr:
                    current_msgstr.append(text)
        
        # Don't forget the last translation
        if in_msgstr and current_msgid:
            msgid = ''.join(current_msgid)
            msgstr = ''.join(current_msgstr)
            if msgid:
                translations[msgid] = msgstr
    
    return translations

def create_mo_file(translations, mo_path):
    """Create a .mo file from translations dictionary using proper encoding."""
    # Filter out empty msgids (header) and encode to UTF-8
    messages = []
    for k, v in translations.items():
        if k:  # Skip empty msgid (header)
            try:
                msgid_bytes = k.encode('utf-8')
                msgstr_bytes = v.encode('utf-8')
                messages.append((msgid_bytes, msgstr_bytes))
            except Exception as e:
                print(f"Warning: Could not encode '{k}': {e}")
                continue
    
    # Sort by msgid for binary search
    messages.sort()
    
    # Calculate string tables
    keys = b''.join([msgid + b'\0' for msgid, _ in messages])
    values = b''.join([msgstr + b'\0' for _, msgstr in messages])
    
    # Build offset tables
    offsets = []
    key_offset = 0
    value_offset = 0
    
    for msgid, msgstr in messages:
        offsets.append((len(msgid), key_offset, len(msgstr), value_offset))
        key_offset += len(msgid) + 1
        value_offset += len(msgstr) + 1
    
    # Calculate header positions
    keystart = 7 * 4 + 16 * len(messages)
    valuestart = keystart + len(keys)
    
    # Build the .mo file in memory
    output = []
    
    # Header: magic number (little-endian)
    output.append(struct.pack('<I', 0x950412de))
    # File format revision
    output.append(struct.pack('<I', 0))
    # Number of strings
    output.append(struct.pack('<I', len(messages)))
    # Offset of table with original strings
    output.append(struct.pack('<I', 7 * 4))
    # Offset of table with translation strings
    output.append(struct.pack('<I', 7 * 4 + 8 * len(messages)))
    # Size of hashing table (0 = no hashing)
    output.append(struct.pack('<I', 0))
    # Offset of hashing table
    output.append(struct.pack('<I', 0))
    
    # Table of original strings (length + offset pairs)
    for length, offset, _, _ in offsets:
        output.append(struct.pack('<I', length))
        output.append(struct.pack('<I', keystart + offset))
    
    # Table of translation strings (length + offset pairs)
    for _, _, length, offset in offsets:
        output.append(struct.pack('<I', length))
        output.append(struct.pack('<I', valuestart + offset))
    
    # Original strings
    output.append(keys)
    # Translation strings
    output.append(values)
    
    # Write to file atomically
    mo_path_tmp = mo_path.with_suffix('.mo.tmp')
    try:
        with open(mo_path_tmp, 'wb') as f:
            f.write(b''.join(output))
        # Atomic rename
        mo_path_tmp.replace(mo_path)
    except Exception as e:
        if mo_path_tmp.exists():
            mo_path_tmp.unlink()
        raise e

def compile_translations():
    """Compile all .po files to .mo files."""
    locale_dir = Path(__file__).parent / 'locale'
    
    if not locale_dir.exists():
        print(f"Locale directory not found: {locale_dir}")
        return
    
    for po_file in locale_dir.glob('**/LC_MESSAGES/django.po'):
        mo_file = po_file.with_suffix('.mo')
        
        print(f"Compiling {po_file} -> {mo_file}")
        
        try:
            translations = parse_po_file(po_file)
            create_mo_file(translations, mo_file)
            print(f"  ✓ Successfully compiled {mo_file.parent.parent.name} translations")
        except Exception as e:
            print(f"  ✗ Error compiling {po_file}: {e}")

if __name__ == '__main__':
    compile_translations()
