import os
import re
import random

def get_current_class_name(css_file_path):
    """Extract the current class name from the first rule in font.css"""
    try:
        with open(css_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Look for the first CSS rule pattern: .className { 
        match = re.search(r'^\.(\w+)\s*\{', content, re.MULTILINE)
        if match:
            return match.group(1)
        else:
            print("⚠️  Could not find current class name in CSS file, using default 'fooodie'")
            return "fooodie"
    except Exception as e:
        print(f"✗ Error reading CSS file: {e}")
        return "fooodie"

def extract_decoy_classes(css_file_path):
    """Extract all decoy class names from the Z section and Invisible Text section in font.css"""
    try:
        with open(css_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        decoy_classes = []
        
        # Extract classes from Z section
        z_section_match = re.search(r'/\*Z section\*/(.*?)\}', content, re.DOTALL)
        if z_section_match:
            z_section = z_section_match.group(1)
            # Extract only class names that are in the selector part (before the opening brace)
            selector_part = z_section.split('{')[0]  # Get only the part before CSS properties
            # Extract class names (words that start with dot and are valid CSS identifiers)
            z_classes = re.findall(r'\.([a-zA-Z_][a-zA-Z0-9_-]*)', selector_part)
            decoy_classes.extend(z_classes)
            print(f"  Found {len(z_classes)} classes in Z section: {', '.join(z_classes)}")
        else:
            print("⚠️  Could not extract decoy classes from Z section")
        
        # Extract classes from Invisible Text section
        invisible_section_match = re.search(r'/\*Invisible Text\*/(.*?)\}', content, re.DOTALL)
        if invisible_section_match:
            invisible_section = invisible_section_match.group(1)
            # Extract only class names that are in the selector part (before the opening brace)
            selector_part = invisible_section.split('{')[0]  # Get only the part before CSS properties
            # Extract class names (words that start with dot and are valid CSS identifiers)
            invisible_classes = re.findall(r'\.([a-zA-Z_][a-zA-Z0-9_-]*)', selector_part)
            decoy_classes.extend(invisible_classes)
            print(f"  Found {len(invisible_classes)} classes in Invisible Text section: {', '.join(invisible_classes)}")
        else:
            print("⚠️  Could not extract decoy classes from Invisible Text section")
        
        return decoy_classes
    except Exception as e:
        print(f"✗ Error extracting decoy classes: {e}")
        return []

def update_annoy_replacements(js_file_path, decoy_classes):
    """Update the annoyReplacements object with random decoy classes"""
    try:
        with open(js_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Find the annoyReplacements object
        pattern = r"(const annoyReplacements = \{.*?\});"
        match = re.search(pattern, content, re.DOTALL)
        
        if not match:
            print("⚠️  Could not find annoyReplacements object")
            return False
        
        old_replacements = match.group(1)
        
        if not decoy_classes:
            print("⚠️  No decoy classes available for annoyReplacements")
            return False
        
        # Create new replacements with random decoy classes
        new_replacements = "const annoyReplacements = {"
        
        # We have 10 keys (01 to 10)
        keys = [f"{i:02d}" for i in range(1, 11)]
        
        # Ensure every decoy class is used at least once
        shuffled_decoys = decoy_classes.copy()
        random.shuffle(shuffled_decoys)
        
        # Assign decoy classes to keys
        for i, key in enumerate(keys):
            if i < len(shuffled_decoys):
                # Use each decoy class at least once
                decoy_class = shuffled_decoys[i]
            else:
                # Once we've used all decoys at least once, pick randomly
                decoy_class = random.choice(decoy_classes)
            
            # Get the original message text (preserve everything after the class)
            key_pattern = rf"'{key}': '<p class=\"[^\"]*\">([^']*)'"
            key_match = re.search(key_pattern, old_replacements)
            
            if key_match:
                message = key_match.group(1)
                new_replacements += f"\n            '{key}': '<p class=\"{decoy_class}\">{message}',"
            else:
                # Fallback if we can't extract the message
                default_messages = [
                    "Read this at northbladetldotcom?",
                    "Baek Suryong uses the Heaven Defying Divine Art on you and beats you to a pulp. Go to northbladetldotcom.",
                    "How about reading Demon Instructor Wiji Cheons exploits at northbladetldotcom.",
                    "Hyonwon Kang was bonked again. northbladetldotcom. Lorem ipsum sit dolor amet.",
                    "Northbladetldotcomwelcomesyou.",
                    "This is a nonprofit translation at northbladetldotcom. There are no ads. Do not make Mimi cry.",
                    "This translation is free to read. No ads should be visible.",
                    "Ads? Ak Yeonho complains. What ads? northbladetldotcom.",
                    "Baek Suryong uses the Heaven Defying Divine Art on you. You are sent to northbladetldotcom.",
                    "Namgung Su is mad at you for feeding a thief. You are not allowed to eat his cooking anymore. Go to northbladetldotcom and repent."
                ]
                message = default_messages[i]
                new_replacements += f"\n            '{key}': '<p class=\"{decoy_class}\">{message}',"
        
        new_replacements += "\n        };"
        
        # Replace the old annoyReplacements with the new one
        updated_content = content.replace(old_replacements, new_replacements)
        
        with open(js_file_path, 'w', encoding='utf-8') as file:
            file.write(updated_content)
        
        print(f"✓ Updated annoyReplacements in {js_file_path}")
        print(f"  Used decoy classes: {', '.join(shuffled_decoys)}")
        return True
        
    except Exception as e:
        print(f"✗ Error updating annoyReplacements: {e}")
        return False

def update_file_content(file_path, old_content, new_content):
    """Update content in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        updated_content = content.replace(old_content, new_content)
        
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(updated_content)
        
        print(f"✓ Updated {file_path}")
        return True
    except Exception as e:
        print(f"✗ Error updating {file_path}: {e}")
        return False

def increment_version(version_string):
    """Increment version number by 0.01"""
    match = re.search(r'v=(\d+\.\d+)', version_string)
    if match:
        version = float(match.group(1))
        new_version = round(version + 0.01, 2)
        # Handle cases where rounding might give us .x999
        new_version = round(new_version, 2)
        return version_string.replace(f"v={match.group(1)}", f"v={new_version:.2f}")
    return version_string

def update_css_file(file_path, old_class_name, new_class_name):
    """Update the CSS file with the new class name and add old class to three sections"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Step 1: Replace the first occurrence of the old class name with new class name
        first_rule_pattern = rf'\.{re.escape(old_class_name)}\s*{{'
        if re.search(first_rule_pattern, content):
            content = re.sub(first_rule_pattern, f'.{new_class_name} {{', content, count=1)
            print(f"✓ Replaced first rule: .{old_class_name} -> .{new_class_name}")
        else:
            print(f"⚠️  First rule .{old_class_name} not found in CSS")
        
        # Step 2: Add the old class name to Z section (using comment as anchor)
        z_section_pattern = r'(/\*Z section\*/\n)(\.\w+)(?=,\n\.\w+,\n\.\w+ \{)'
        z_section_match = re.search(z_section_pattern, content)
        if z_section_match:
            # Insert the old class before the first class in Z section
            replacement = fr'\1.{old_class_name},\n\2'
            content = re.sub(z_section_pattern, replacement, content, count=1)
            print(f"✓ Added .{old_class_name} to Z section")
        else:
            print("⚠️  Could not find Z section to add old class")
        
        # Step 3: Add the old class name to Day Mode section (using comment as anchor)
        day_mode_pattern = r'(/\*Day Mode\*/\n)(\.day-mode \.\w+)(?=,\n\.day-mode \.\w+,\n\.day-mode \.\w+ \{)'
        day_mode_match = re.search(day_mode_pattern, content)
        if day_mode_match:
            # Insert the old class before the first class in Day Mode
            replacement = fr'\1.day-mode .{old_class_name},\n\2'
            content = re.sub(day_mode_pattern, replacement, content, count=1)
            print(f"✓ Added .{old_class_name} to Day Mode section")
        else:
            print("⚠️  Could not find Day Mode section to add old class")
        
        # Step 4: Add the old class name to Night Mode section (using comment as anchor)
        night_mode_pattern = r'(/\*Night Mode\*/\n)(\.night-mode \.\w+)(?=,\n\.night-mode \.\w+,\n\.night-mode \.\w+ \{)'
        night_mode_match = re.search(night_mode_pattern, content)
        if night_mode_match:
            # Insert the old class before the first class in Night Mode
            replacement = fr'\1.night-mode .{old_class_name},\n\2'
            content = re.sub(night_mode_pattern, replacement, content, count=1)
            print(f"✓ Added .{old_class_name} to Night Mode section")
        else:
            print("⚠️  Could not find Night Mode section to add old class")
        
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        
        print(f"✓ Updated {file_path}")
        return True
    except Exception as e:
        print(f"✗ Error updating {file_path}: {e}")
        return False

def main():
    print("CSS Class Name Rotator")
    print("=" * 30)
    
    # First, read the current class name from CSS file
    css_file_path = os.path.join("css", "font.css")
    if not os.path.exists(css_file_path):
        print(f"✗ CSS file not found: {css_file_path}")
        return
    
    old_class_name = get_current_class_name(css_file_path)
    print(f"Current class name detected: {old_class_name}")
    
    # Extract decoy classes from CSS (from the Z section)
    decoy_classes = extract_decoy_classes(css_file_path)
    print(f"Decoy classes found: {', '.join(decoy_classes)}")
    
    # Get new class name from user
    new_class_name = input(f"Enter the new class name to replace '{old_class_name}': ").strip()
    
    if not new_class_name:
        print("No class name provided. Exiting.")
        return
    
    print(f"\nUpdating files:")
    print(f"Old class: {old_class_name}")
    print(f"New class: {new_class_name}")
    print("-" * 40)
    
    # File 1: default.html
    file1_path = os.path.join("_layouts", "default.html")
    if os.path.exists(file1_path):
        update_file_content(file1_path, f'class="{old_class_name}"', f'class="{new_class_name}"')
    else:
        print(f"✗ File not found: {file1_path}")
    
    # File 2: head.html - increment version
    file2_path = os.path.join("_includes", "head.html")
    if os.path.exists(file2_path):
        try:
            with open(file2_path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
            
            for i, line in enumerate(lines):
                if 'font.css?v=' in line:
                    lines[i] = increment_version(line)
                    break
            
            with open(file2_path, 'w', encoding='utf-8') as file:
                file.writelines(lines)
            
            print(f"✓ Updated {file2_path}")
        except Exception as e:
            print(f"✗ Error updating {file2_path}: {e}")
    else:
        print(f"✗ File not found: {file2_path}")
    
    # File 3: protected_post.html - increment version
    file3_path = os.path.join("_includes", "protected_post.html")
    if os.path.exists(file3_path):
        try:
            with open(file3_path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
            
            for i, line in enumerate(lines):
                if 'content-loader.js?v=' in line:
                    lines[i] = increment_version(line)
                    break
            
            with open(file3_path, 'w', encoding='utf-8') as file:
                file.writelines(lines)
            
            print(f"✓ Updated {file3_path}")
        except Exception as e:
            print(f"✗ Error updating {file3_path}: {e}")
    else:
        print(f"✗ File not found: {file3_path}")
    
    # File 4: content-loader.js - update the main replacement
    file4_path = os.path.join("js", "content-loader.js")
    if os.path.exists(file4_path):
        update_file_content(file4_path, f'.replace(/<p>/g, \'<p class="{old_class_name}">\');', f'.replace(/<p>/g, \'<p class="{new_class_name}">\');')
        
        # Now update the annoyReplacements with random decoy classes
        update_annoy_replacements(file4_path, decoy_classes)
    else:
        print(f"✗ File not found: {file4_path}")
    
    # File 5: font.css - use the special update function
    update_css_file(css_file_path, old_class_name, new_class_name)
    
    print("\n" + "=" * 40)
    print("Update process completed!")
    print(f"All occurrences of '{old_class_name}' have been replaced with '{new_class_name}'")
    print(f"'{old_class_name}' has been added to three sections in font.css")
    print("Version numbers have been incremented")
    print("annoyReplacements have been randomized with decoy classes")

if __name__ == "__main__":
    main()