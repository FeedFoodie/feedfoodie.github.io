import os
import re
import random

def get_current_class_name(css_file_path):
    """Extract the current visible class name from the first rule in font.css"""
    try:
        with open(css_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Look for the first CSS rule pattern: .className { 
        # Exclude .f0odie since that's for regular paragraphs
        match = re.search(r'^\.(?!f0odie)(\w+)\s*\{', content, re.MULTILINE)
        if match:
            return match.group(1)
        else:
            print("⚠️  Could not find current visible class name in CSS file")
            return None
    except Exception as e:
        print(f"✗ Error reading CSS file: {e}")
        return None

def get_invisible_classes(css_file_path):
    """Extract all invisible class names from the Z section and Invisible Text section in font.css"""
    try:
        with open(css_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        invisible_classes = []
        
        # Extract classes from Z section
        z_section_match = re.search(r'/\*Z section\*/(.*?)\}', content, re.DOTALL)
        if z_section_match:
            z_section = z_section_match.group(1)
            # Get just the selector part (before opening brace)
            selector_part = z_section.split('{')[0].strip()
            # Extract individual class names
            class_matches = re.findall(r'\.(\w+)', selector_part)
            invisible_classes.extend(class_matches)
            print(f"  Found {len(class_matches)} classes in Z section: {', '.join(class_matches)}")
        
        # Extract classes from Invisible Text section
        invisible_section_match = re.search(r'/\*Invisible Text\*/(.*?)\}', content, re.DOTALL)
        if invisible_section_match:
            invisible_section = invisible_section_match.group(1)
            # Get just the selector part (before opening brace)
            selector_part = invisible_section.split('{')[0].strip()
            # Extract individual class names
            class_matches = re.findall(r'\.(\w+)', selector_part)
            invisible_classes.extend(class_matches)
            print(f"  Found {len(class_matches)} classes in Invisible Text section: {', '.join(class_matches)}")
        
        return invisible_classes
    except Exception as e:
        print(f"✗ Error extracting invisible classes: {e}")
        return []

def rotate_classes(current_visible, invisible_classes):
    """Rotate classes: make current visible invisible, and make oldest invisible visible"""
    if not invisible_classes:
        print("⚠️  No invisible classes found")
        return None, []
    
    # Find the oldest invisible class (first in the list)
    new_visible = invisible_classes[0]
    
    # Remove the new visible from invisible list
    updated_invisible = invisible_classes[1:]
    
    # Add the current visible to the end of invisible list
    updated_invisible.append(current_visible)
    
    print(f"  Rotation: {current_visible} -> becomes invisible")
    print(f"  Rotation: {new_visible} -> becomes visible")
    print(f"  Updated invisible classes: {', '.join(updated_invisible)}")
    
    return new_visible, updated_invisible

def update_css_file(css_file_path, old_visible, new_visible, updated_invisible):
    """Update the CSS file with rotated classes"""
    try:
        with open(css_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Step 1: Replace the visible class rule
        first_rule_pattern = rf'\.{re.escape(old_visible)}\s*{{'
        if re.search(first_rule_pattern, content, re.MULTILINE):
            content = re.sub(first_rule_pattern, f'.{new_visible} {{', content, count=1)
            print(f"✓ Replaced visible class: .{old_visible} -> .{new_visible}")
        
        # Step 2: Update Z section and Invisible Text section
        # We need to split the invisible classes between the two sections
        # First 5 go to Z section, rest go to Invisible Text section
        z_section_classes = updated_invisible[:5]
        invisible_text_classes = updated_invisible[5:]
        
        # Update Z section
        z_section_rule = f"/*Z section*/\n"
        if z_section_classes:
            z_section_rule += ",\n".join([f".{cls}" for cls in z_section_classes])
        z_section_rule += " {\n    position: absolute;\n    z-index: -1;\n    opacity: 0.1;\n    font-size: 1px;\n    margin-bottom: 0px;\n}\n"
        
        z_section_pattern = r'/\*Z section\*/(.*?)\}'
        content = re.sub(z_section_pattern, z_section_rule, content, flags=re.DOTALL)
        
        # Update Invisible Text section
        invisible_text_rule = f"/*Invisible Text*/\n"
        if invisible_text_classes:
            invisible_text_rule += ",\n".join([f".{cls}" for cls in invisible_text_classes])
        invisible_text_rule += " {\n    font-size: 1px;\n    color: transparent;\n    letter-spacing: -10px;\n    margin-bottom: 0px;\n}\n"
        
        invisible_text_pattern = r'/\*Invisible Text\*/(.*?)\}'
        content = re.sub(invisible_text_pattern, invisible_text_rule, content, flags=re.DOTALL)
        
        # Step 3: Update Day Mode section
        day_mode_rule = f"/*Day Mode*/\n"
        if z_section_classes:
            day_mode_rule += ",\n".join([f".day-mode .{cls}" for cls in z_section_classes])
        day_mode_rule += " {\n    color: white; \n}\n"
        
        day_mode_pattern = r'/\*Day Mode\*/(.*?)\}'
        content = re.sub(day_mode_pattern, day_mode_rule, content, flags=re.DOTALL)
        
        # Step 4: Update Night Mode section
        night_mode_rule = f"/*Night Mode*/\n"
        if z_section_classes:
            night_mode_rule += ",\n".join([f".night-mode .{cls}" for cls in z_section_classes])
        night_mode_rule += " {\n    color: #444444;\n}\n"
        
        night_mode_pattern = r'/\*Night Mode\*/(.*?)\}'
        content = re.sub(night_mode_pattern, night_mode_rule, content, flags=re.DOTALL)
        
        with open(css_file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        
        print(f"✓ Updated CSS file")
        return True
        
    except Exception as e:
        print(f"✗ Error updating CSS file: {e}")
        return False

def update_worker_file(worker_file_path, old_visible, new_visible, all_invisible_classes):
    """Update the Cloudflare worker file with new class rotation"""
    try:
        with open(worker_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Update the poison messages with new classes
        # We need to update both poisonMessages and naturalPoison arrays
        
        # First, create a mapping of old poison messages to new classes
        # We'll rotate through the invisible classes
        
        # Update poisonMessages array
        poison_pattern = r"const poisonMessages = \[(.*?)\]"
        poison_match = re.search(poison_pattern, content, re.DOTALL)
        
        if poison_match:
            poison_text = poison_match.group(1)
            # Count how many poison messages we have
            messages = re.findall(r'\{.*?\}', poison_text, re.DOTALL)
            
            # Assign classes to messages in order
            updated_poison = "const poisonMessages = [\n"
            for i, msg in enumerate(messages):
                # Get the message text
                text_match = re.search(r'text:\s*"([^"]+)"', msg)
                class_match = re.search(r'class:\s*"([^"]+)"', msg)
                
                if text_match and class_match:
                    # Use next invisible class in rotation
                    class_idx = i % len(all_invisible_classes)
                    new_class = all_invisible_classes[class_idx]
                    updated_poison += f'    {{ text: "{text_match.group(1)}", class: "{new_class}" }},\n'
            
            updated_poison += "  ];"
            content = content.replace(poison_match.group(0), updated_poison)
            print(f"✓ Updated poisonMessages with new classes")
        
        # Update naturalPoison array
        natural_pattern = r"const naturalPoison = \[(.*?)\]"
        natural_match = re.search(natural_pattern, content, re.DOTALL)
        
        if natural_match:
            natural_text = natural_match.group(1)
            messages = re.findall(r'\{.*?\}', natural_text, re.DOTALL)
            
            updated_natural = "const naturalPoison = [\n"
            for i, msg in enumerate(messages):
                text_match = re.search(r'text:\s*"([^"]+)"', msg)
                class_match = re.search(r'class:\s*"([^"]+)"', msg)
                
                if text_match and class_match:
                    # Use different classes for natural poison
                    class_idx = (i + 3) % len(all_invisible_classes)  # Offset by 3
                    new_class = all_invisible_classes[class_idx]
                    updated_natural += f'    {{ text: "{text_match.group(1)}", class: "{new_class}" }},\n'
            
            updated_natural += "  ];"
            content = content.replace(natural_match.group(0), updated_natural)
            print(f"✓ Updated naturalPoison with new classes")
        
        with open(worker_file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        
        print(f"✓ Updated worker file")
        return True
        
    except Exception as e:
        print(f"✗ Error updating worker file: {e}")
        return False

def update_noscript_file(js_file_path, old_visible, new_visible):
    """Update the noscript.js file with new visible class"""
    try:
        with open(js_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Update the regex replacement for regular paragraphs
        old_pattern = rf'\.replace\(/<p>/g,\s*[\'"`]<p class="{re.escape(old_visible)}">[\'"`]\)'
        new_replacement = f'.replace(/<p>/g, \'<p class="{new_visible}">\')'
        
        content = re.sub(old_pattern, new_replacement, content)
        print(f"✓ Updated noscript.js: .{old_visible} -> .{new_visible}")
        
        with open(js_file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        
        return True
    except Exception as e:
        print(f"✗ Error updating noscript.js: {e}")
        return False

def increment_version(file_path, pattern):
    """Increment version number in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
        
        for i, line in enumerate(lines):
            if pattern in line:
                # Find and increment version
                version_match = re.search(r'v=(\d+\.\d+)', line)
                if version_match:
                    version = float(version_match.group(1))
                    new_version = round(version + 0.01, 2)
                    lines[i] = line.replace(f"v={version_match.group(1)}", f"v={new_version:.2f}")
                    print(f"✓ Incremented version: {version} -> {new_version}")
                    break
        
        with open(file_path, 'w', encoding='utf-8') as file:
            file.writelines(lines)
        
        return True
    except Exception as e:
        print(f"✗ Error incrementing version: {e}")
        return False

def main():
    print("CSS Class Rotator for Content Stitching System")
    print("=" * 50)
    
    # File paths
    css_file_path = os.path.join("css", "font.css")
    worker_file_path = os.path.join("js", "worker.js")  # Your local worker copy
    noscript_path = os.path.join("js", "noscript.js")
    head_html_path = os.path.join("_includes", "head.html")
    
    # Check if files exist
    if not os.path.exists(css_file_path):
        print(f"✗ CSS file not found: {css_file_path}")
        return
    
    if not os.path.exists(worker_file_path):
        print(f"⚠️ Worker file not found: {worker_file_path}")
        print("  Will update CSS only")
    
    # Get current visible class
    current_visible = get_current_class_name(css_file_path)
    if not current_visible:
        print("✗ Could not determine current visible class")
        return
    
    print(f"Current visible class: {current_visible}")
    
    # Get all invisible classes
    invisible_classes = get_invisible_classes(css_file_path)
    if not invisible_classes:
        print("✗ No invisible classes found")
        return
    
    print(f"Current invisible classes: {', '.join(invisible_classes)}")
    
    # Rotate classes
    new_visible, updated_invisible = rotate_classes(current_visible, invisible_classes)
    if not new_visible:
        return
    
    print("\n" + "=" * 50)
    print("Starting rotation...")
    print(f"New visible class: {new_visible}")
    print(f"All invisible classes after rotation: {', '.join(updated_invisible)}")
    
    # Update CSS file
    if not update_css_file(css_file_path, current_visible, new_visible, updated_invisible):
        print("✗ Failed to update CSS file")
        return
    
    # Update worker file (if exists)
    if os.path.exists(worker_file_path):
        all_classes = [new_visible] + updated_invisible
        if not update_worker_file(worker_file_path, current_visible, new_visible, all_classes):
            print("⚠️ Failed to update worker file")
    else:
        print("⚠️ Skipping worker file update (file not found)")
    
    # Update noscript.js
    if os.path.exists(noscript_path):
        if not update_noscript_file(noscript_path, current_visible, new_visible):
            print("⚠️ Failed to update noscript.js")
    else:
        print("⚠️ noscript.js not found")
    
    # Increment versions to bust cache
    if os.path.exists(head_html_path):
        increment_version(head_html_path, "font.css?v=")
    
    # Also increment noscript version if it has one
    if os.path.exists(noscript_path):
        # Check if noscript has a version in its URL
        with open(noscript_path, 'r', encoding='utf-8') as f:
            if '?ver=' in f.read():
                # This would need to be updated in the HTML file that loads it
                print("Note: noscript.js has version parameter - update manually in HTML")
    
    print("\n" + "=" * 50)
    print("Rotation completed successfully!")
    print("\nNext steps:")
    print(f"1. Copy the updated worker.js content to Cloudflare Workers")
    print(f"2. Clear Cloudflare cache if needed")
    print(f"3. Test a chapter to ensure new class '{new_visible}' is working")
    print(f"4. Old class '{current_visible}' is now invisible")

if __name__ == "__main__":
    main()