import os
import re
import datetime
import random

# --- Version Increment Functions ---
def increment_version(version_string):
    """Increment version number by 0.01"""
    match = re.search(r'v=(\d+\.\d+)', version_string)
    if match:
        version = float(match.group(1))
        new_version = round(version + 0.01, 2)
        new_version = round(new_version, 2)
        return version_string.replace(f"v={match.group(1)}", f"v={new_version:.2f}")
    return version_string

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

def extract_decoy_classes(css_file_path):
    """Extract all decoy class names from the Z section and Invisible Text section in header.css"""
    try:
        with open(css_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        decoy_classes = []
        
        # Extract classes from Z section
        z_section_match = re.search(r'/\*Z section\*/(.*?)\}', content, re.DOTALL)
        if z_section_match:
            z_section = z_section_match.group(1)
            selector_part = z_section.split('{')[0]
            z_classes = re.findall(r'\.([a-zA-Z_][a-zA-Z0-9_-]*)', selector_part)
            decoy_classes.extend(z_classes)
            print(f"  Found {len(z_classes)} classes in Z section: {', '.join(z_classes)}")
        else:
            print("⚠️  Could not extract decoy classes from Z section")
        
        # Extract classes from Invisible Text section
        invisible_section_match = re.search(r'/\*Invisible Text\*/(.*?)\}', content, re.DOTALL)
        if invisible_section_match:
            invisible_section = invisible_section_match.group(1)
            selector_part = invisible_section.split('{')[0]
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
                decoy_class = shuffled_decoys[i]
            else:
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

def create_initial_log(log_file_path):
    """Create initial log file with current state"""
    try:
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        initial_state = f"""CSS Class Rotation Log
========================
{timestamp} - Initial State
Visible class: f0odie (no CSS rule)
Z section (5 classes): foodie, ffoodie, fooddie, fo0die, foodiie
Invisible Text section (2 classes): foodiee, fooodie

Full rotation order (8 classes):
1. f0odie (current visible)
2. foodie
3. ffoodie
4. fooddie
5. fo0die
6. foodiie
7. foodiee
8. fooodie

Worker invisibleClasses (7 classes): foodie, ffoodie, fooddie, fo0die, foodiie, foodiee, fooodie

Rotation logic:
- Each rotation moves EVERY class forward by 1 position
- Last class becomes new visible
- Previous visible goes to Z section position 1
- All others shift down
- Classes rotate through: Visible → Z section → Invisible Text → Visible
"""
        
        with open(log_file_path, 'w', encoding='utf-8') as file:
            file.write(initial_state)
        
        print(f"✓ Created initial log at {log_file_path}")
        return True
    except Exception as e:
        print(f"✗ Error creating initial log: {e}")
        return False

def read_current_state(log_file_path):
    """Read current state from log file"""
    try:
        if not os.path.exists(log_file_path):
            print("⚠️  Log file not found, creating initial log...")
            create_initial_log(log_file_path)
        
        with open(log_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        lines = content.strip().split('\n')
        
        visible_class = None
        z_classes = []
        invisible_text_classes = []
        
        for line in reversed(lines):
            if "Visible class:" in line:
                visible_match = re.search(r'Visible class:\s*(\w+)', line)
                if visible_match:
                    visible_class = visible_match.group(1)
            
            elif "Z section" in line and "classes" in line:
                z_match = re.search(r'Z section.*?:\s*([\w\s,]+)', line)
                if z_match:
                    z_str = z_match.group(1)
                    z_classes = [c.strip() for c in z_str.split(',')]
            
            elif "Invisible Text section" in line:
                invisible_match = re.search(r'Invisible Text section.*?:\s*([\w\s,]+)', line)
                if invisible_match:
                    invisible_str = invisible_match.group(1)
                    invisible_text_classes = [c.strip() for c in invisible_str.split(',')]
            
            if visible_class and z_classes and invisible_text_classes:
                break
        
        if not visible_class:
            visible_class = "f0odie"
            z_classes = ["foodie", "ffoodie", "fooddie", "fo0die", "foodiie"]
            invisible_text_classes = ["foodiee", "fooodie"]
            print("⚠️  Could not parse log, using default state")
        
        print(f"  Current visible: {visible_class}")
        print(f"  Z section: {', '.join(z_classes)}")
        print(f"  Invisible Text: {', '.join(invisible_text_classes)}")
        
        return visible_class, z_classes, invisible_text_classes
        
    except Exception as e:
        print(f"✗ Error reading log: {e}")
        return "f0odie", ["foodie", "ffoodie", "fooddie", "fo0die", "foodiie"], ["foodiee", "fooodie"]

def rotate_classes(visible_class, z_classes, invisible_text_classes):
    """Rotate all 8 classes by 1 position"""
    all_classes = [visible_class] + z_classes + invisible_text_classes
    new_all_classes = [all_classes[-1]] + all_classes[:-1]
    
    new_visible = new_all_classes[0]
    new_z = new_all_classes[1:6]
    new_invisible = new_all_classes[6:]
    
    print(f"  Rotation:")
    print(f"    Old visible: {visible_class} → New visible: {new_visible}")
    print(f"    Old Z: {', '.join(z_classes)}")
    print(f"    New Z: {', '.join(new_z)}")
    print(f"    Old Invisible: {', '.join(invisible_text_classes)}")
    print(f"    New Invisible: {', '.join(new_invisible)}")
    
    return new_visible, new_z, new_invisible

def update_css_file(css_file_path, z_classes, invisible_text_classes):
    """Update CSS file with new class assignments"""
    try:
        with open(css_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Remove any visible class rule (empty {})
        content = re.sub(r'^\.\w+\s*\{\s*\}\s*\n?', '', content, flags=re.MULTILINE)
        
        # Update Z section
        z_section_rule = "/*Z section*/\n"
        if z_classes:
            z_section_rule += ",\n".join([f".{cls}" for cls in z_classes])
        z_section_rule += " {\n    position: absolute;\n    z-index: -1;\n    opacity: 0.1;\n    font-size: 1px;\n    margin-bottom: 0px;\n}\n"
        
        z_section_pattern = r'/\*Z section\*/(.*?)\}'
        content = re.sub(z_section_pattern, z_section_rule, content, flags=re.DOTALL)
        
        # Update Invisible Text section
        invisible_text_rule = "/*Invisible Text*/\n"
        if invisible_text_classes:
            invisible_text_rule += ",\n".join([f".{cls}" for cls in invisible_text_classes])
        invisible_text_rule += " {\n    font-size: 1px;\n    color: transparent;\n    letter-spacing: -10px;\n    margin-bottom: 0px;\n}\n"
        
        invisible_text_pattern = r'/\*Invisible Text\*/(.*?)\}'
        content = re.sub(invisible_text_pattern, invisible_text_rule, content, flags=re.DOTALL)
        
        # Update Day Mode section
        day_mode_rule = "/*Day Mode*/\n"
        if z_classes:
            day_mode_rule += ",\n".join([f".day-mode .{cls}" for cls in z_classes])
        day_mode_rule += " {\n    color: white; \n}\n"
        
        day_mode_pattern = r'/\*Day Mode\*/(.*?)\}'
        content = re.sub(day_mode_pattern, day_mode_rule, content, flags=re.DOTALL)
        
        # Update Night Mode section
        night_mode_rule = "/*Night Mode*/\n"
        if z_classes:
            night_mode_rule += ",\n".join([f".night-mode .{cls}" for cls in z_classes])
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

def update_worker_file(worker_file_path, z_classes, invisible_text_classes):
    """Update worker.js with new class assignments"""
    try:
        with open(worker_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # All 7 invisible classes (z + invisible_text) for poison assignment
        all_invisible = z_classes + invisible_text_classes
        
        # Update getStoryBasedPoison function with new classes
        story_poison_pattern = r'const storyPoison = \[(.*?)\]'
        story_poison_match = re.search(story_poison_pattern, content, re.DOTALL)
        
        if story_poison_match:
            story_text = story_poison_match.group(1)
            messages = re.findall(r'\{.*?\}', story_text, re.DOTALL)
            
            updated_story = "const storyPoison = [\n"
            for i, msg in enumerate(messages):
                text_match = re.search(r'text:\s*"([^"]+)"', msg)
                if text_match:
                    # Assign classes from all_invisible in rotation
                    class_idx = i % len(all_invisible)
                    poison_class = all_invisible[class_idx]
                    updated_story += f'    {{ text: "{text_match.group(1)}", class: "{poison_class}" }},\n'
            
            updated_story += "  ];"
            content = content.replace(story_poison_match.group(0), updated_story)
            print(f"✓ Updated getStoryBasedPoison with {len(all_invisible)} classes")
        
        # Update the poisonMessages array
        poison_messages_pattern = r"const poisonMessages = \[(.*?)\]"
        poison_messages_match = re.search(poison_messages_pattern, content, re.DOTALL)
        
        if poison_messages_match:
            poison_text = poison_messages_match.group(1)
            messages = re.findall(r'\{.*?\}', poison_text, re.DOTALL)
            
            updated_poison = "const poisonMessages = [\n"
            for i, msg in enumerate(messages):
                text_match = re.search(r'text:\s*"([^"]+)"', msg)
                if text_match:
                    # Assign classes from all_invisible in rotation, offset by 1 for variety
                    class_idx = (i + 1) % len(all_invisible)
                    poison_class = all_invisible[class_idx]
                    updated_poison += f'    {{ text: "{text_match.group(1)}", class: "{poison_class}" }},\n'
            
            updated_poison += "  ];"
            content = content.replace(poison_messages_match.group(0), updated_poison)
            print(f"✓ Updated poisonMessages with {len(all_invisible)} classes")
        
        with open(worker_file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        
        print(f"✓ Updated worker.js poison assignments")
        return True
        
    except Exception as e:
        print(f"✗ Error updating worker file: {e}")
        return False

def update_worker_invisible_classes(worker_file_path, z_classes, invisible_text_classes):
    """Specifically update the invisibleClasses array in worker.js with only 7 invisible classes"""
    try:
        with open(worker_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Combine Z and Invisible Text classes (7 total)
        all_invisible = z_classes + invisible_text_classes
        
        # Find and replace the invisibleClasses array (7 classes only, no visible class)
        pattern = r'(const invisibleClasses = \[)([^\]]+)(\])'
        
        def replace_invisible_classes(match):
            indent = match.group(1)
            # Create new array with proper formatting (7 classes)
            new_classes = '[\n      ' + ',\n      '.join([f'"{cls}"' for cls in all_invisible]) + '\n    '
            return indent + new_classes + match.group(3)
        
        # Use re.sub with a function for replacement
        new_content = re.sub(pattern, replace_invisible_classes, content, flags=re.DOTALL)
        
        # If pattern not found, try another approach
        if new_content == content:
            # Try matching the exact array definition from your new worker code
            exact_pattern = r'const invisibleClasses = \[\s*"foodie",\s*"ffoodie",\s*"fooddie",\s*"fo0die",\s*"foodiie",\s*"foodiee",\s*"fooodie"\s*\]'
            exact_replacement = f'const invisibleClasses = [\n      "{all_invisible[0]}",\n      "{all_invisible[1]}",\n      "{all_invisible[2]}",\n      "{all_invisible[3]}",\n      "{all_invisible[4]}",\n      "{all_invisible[5]}",\n      "{all_invisible[6]}"\n    ]'
            new_content = re.sub(exact_pattern, exact_replacement, content, flags=re.DOTALL)
        
        with open(worker_file_path, 'w', encoding='utf-8') as file:
            file.write(new_content)
        
        print(f"✓ Updated worker.js invisibleClasses array with 7 classes")
        print(f"  New invisibleClasses: {', '.join(all_invisible)}")
        return True
        
    except Exception as e:
        print(f"✗ Error updating worker invisible classes: {e}")
        return False

def update_noscript_file(noscript_path, visible_class):
    """Update noscript.js with new visible class"""
    try:
        with open(noscript_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Update the regular paragraph class replacement
        old_pattern = r'\.replace\(/<p>/g,\s*[\'"`]<p class="\w+">[\'"`]\)'
        new_replacement = f'.replace(/<p>/g, \'<p class="{visible_class}">\')'
        
        content = re.sub(old_pattern, new_replacement, content)
        
        with open(noscript_path, 'w', encoding='utf-8') as file:
            file.write(content)
        
        print(f"✓ Updated noscript.js with visible class: {visible_class}")
        return True
    except Exception as e:
        print(f"✗ Error updating noscript.js: {e}")
        return False

def update_css_log(log_file_path, new_visible, new_z, new_invisible, old_visible):
    """Update CSS log with new rotation"""
    try:
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        log_entry = f"\n{timestamp} - Rotation: {old_visible} → {new_visible}\n"
        log_entry += f"Visible class: {new_visible} (no CSS rule)\n"
        log_entry += f"Z section (5 classes): {', '.join(new_z)}\n"
        log_entry += f"Invisible Text section (2 classes): {', '.join(new_invisible)}\n"
        
        all_classes = [new_visible] + new_z + new_invisible
        worker_invisible = new_z + new_invisible  # 7 classes for worker
        log_entry += f"Full rotation order (8 classes): {', '.join(all_classes)}\n"
        log_entry += f"Worker invisibleClasses (7 classes): {', '.join(worker_invisible)}\n"
        
        with open(log_file_path, 'a', encoding='utf-8') as file:
            file.write(log_entry)
        
        print(f"✓ Updated CSS log")
        return all_classes, worker_invisible
    except Exception as e:
        print(f"✗ Error updating CSS log: {e}")
        return [], []

def update_html_files(visible_class, new_visible_class):
    """Update HTML files with new class and increment versions"""
    # File 1: default.html
    default_path = os.path.join("_layouts", "default.html")
    if os.path.exists(default_path):
        try:
            with open(default_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Replace class in body tag or specific location
            pattern = rf'class="\s*{visible_class}\s*"'
            new_content = re.sub(pattern, f'class="{new_visible_class}"', content)
            
            with open(default_path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            
            print(f"✓ Updated default.html with new class: {new_visible_class}")
        except Exception as e:
            print(f"✗ Error updating default.html: {e}")
    else:
        print(f"⚠️ default.html not found, skipping")
    
    # File 2: head.html - increment version for header.css
    head_path = os.path.join("_includes", "head.html")
    if os.path.exists(head_path):
        try:
            with open(head_path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
            
            for i, line in enumerate(lines):
                if 'header.css?v=' in line:
                    lines[i] = increment_version(line)
                    break
            
            with open(head_path, 'w', encoding='utf-8') as file:
                file.writelines(lines)
            
            print(f"✓ Updated head.html (header.css version incremented)")
        except Exception as e:
            print(f"✗ Error updating head.html: {e}")
    else:
        print(f"⚠️ head.html not found, skipping")
    
    # File 3: protected_post.html - increment version for noscript.js
    protected_post_path = os.path.join("_includes", "protected_post.html")
    if os.path.exists(protected_post_path):
        try:
            with open(protected_post_path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
            
            for i, line in enumerate(lines):
                if 'noscript.js?v=' in line:
                    lines[i] = increment_version(line)
                    break
            
            with open(protected_post_path, 'w', encoding='utf-8') as file:
                file.writelines(lines)
            
            print(f"✓ Updated protected_post.html (noscript.js version incremented)")
        except Exception as e:
            print(f"✗ Error updating protected_post.html: {e}")
    else:
        print(f"⚠️ protected_post.html not found, skipping")

def main():
    print("CSS 8-Class Rotator with Version Incrementing")
    print("=" * 50)
    
    # File paths
    css_file_path = os.path.join("css", "header.css")
    worker_file_path = os.path.join("js", "worker.js")
    noscript_path = os.path.join("js", "noscript.js")
    css_log_path = os.path.join("css", "csslog.txt")
    
    # Step 1: Read current state from log
    print("\nReading current state from log...")
    visible_class, z_classes, invisible_text_classes = read_current_state(css_log_path)
    
    # Step 2: Rotate all 8 classes by 1 position
    print("\nRotating all 8 classes...")
    new_visible, new_z, new_invisible = rotate_classes(visible_class, z_classes, invisible_text_classes)
    
    # Create invisible classes list for worker (7 classes: Z + Invisible Text)
    worker_invisible_classes = new_z + new_invisible
    
    # Step 3: Update CSS file
    print("\nUpdating CSS file...")
    if not update_css_file(css_file_path, new_z, new_invisible):
        print("⚠️ Failed to update CSS file")
    
    # Step 4: Extract decoy classes for annoyReplacements
    print("\nExtracting decoy classes for annoyReplacements...")
    decoy_classes = extract_decoy_classes(css_file_path)
    
    # Step 5: Update worker.js with new classes
    print("\nUpdating worker.js...")
    if os.path.exists(worker_file_path):
        # Update poison message class assignments
        if not update_worker_file(worker_file_path, new_z, new_invisible):
            print("⚠️ Failed to update worker.js poison assignments")
        
        # Update the invisibleClasses array with 7 classes only (no visible class)
        if not update_worker_invisible_classes(worker_file_path, new_z, new_invisible):
            print("⚠️ Failed to update worker.js invisibleClasses array")
    else:
        print("⚠️ worker.js not found, skipping")
    
    # Step 6: Update noscript.js with new visible class
    print("\nUpdating noscript.js...")
    if os.path.exists(noscript_path):
        if not update_noscript_file(noscript_path, new_visible):
            print("⚠️ Failed to update noscript.js")
        
        # Update annoyReplacements in noscript.js if it exists
        if decoy_classes:
            if not update_annoy_replacements(noscript_path, decoy_classes):
                print("⚠️ Failed to update annoyReplacements in noscript.js")
    else:
        print("⚠️ noscript.js not found, skipping")
    
    # Step 7: Update HTML files and increment versions
    print("\nUpdating HTML files and incrementing versions...")
    update_html_files(visible_class, new_visible)
    
    # Step 8: Update CSS log and get full class order
    print("\nUpdating CSS log...")
    all_classes, worker_invisible = update_css_log(css_log_path, new_visible, new_z, new_invisible, visible_class)
    
    print("\n" + "=" * 50)
    print("ROTATION COMPLETED SUCCESSFULLY!")
    print(f"\nSummary of changes:")
    print(f"  New visible class (no CSS rule): {new_visible}")
    print(f"  Z section (5 classes, position:absolute): {', '.join(new_z)}")
    print(f"  Invisible Text (2 classes, transparent): {', '.join(new_invisible)}")
    print(f"  Worker invisibleClasses (7 classes): {', '.join(worker_invisible)}")
    print(f"\nImportant notes:")
    print(f"  1. Class '{new_visible}' is NOT in header.css - it's only in noscript.js and csslog.txt")
    print(f"  2. Regular paragraphs will use class '{new_visible}' (invisible to scrapers)")
    print(f"  3. Worker uses only 7 invisible classes (Z + Invisible Text)")
    print(f"  4. Watermark uses first class from invisibleClasses: '{worker_invisible[0] if worker_invisible else 'foodie'}'")
    print(f"  5. Versions incremented in head.html and protected_post.html for cache busting")
    print(f"  6. Default.html updated with new class (if found)")
    print(f"  7. Copy worker.js to Cloudflare Workers manually")
    print(f"\nNext rotation will move '{new_invisible[-1] if new_invisible else 'fooodie'}' to visible position")

if __name__ == "__main__":
    main()