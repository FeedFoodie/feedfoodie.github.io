import os
import re
import datetime

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
    """Update worker.js with new class assignments - UPDATED for new worker code"""
    try:
        with open(worker_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # All 8 classes in rotation order (visible + z + invisible)
        # Note: In the new worker code, we need ALL 8 classes for invisibleClasses array
        # The visible class is included in the rotation for worker poison
        # But we need to get the current visible class from elsewhere
        # We'll use all classes from Z + Invisible + assume visible is first of next rotation
        # Actually, we need to get the visible class from the caller
        
        # First, let's find where to insert the visible class
        # The worker code expects all 8 classes in invisibleClasses array
        # We need to reconstruct the full order
        
        # For now, we'll update only what we can without the visible class
        # The worker code has a fixed array, so we need to update it
        
        # Find and update the invisibleClasses array in the worker code
        all_classes_pattern = r'const invisibleClasses = \[(.*?)\]'
        all_classes_match = re.search(all_classes_pattern, content, re.DOTALL)
        
        if all_classes_match:
            # Create new array with all 8 classes
            # We need to know the full order: visible + z_classes + invisible_text_classes
            # But we don't have the visible class in this function
            # We'll need to modify the function signature or get it from the main
            
            # For now, let's update the getStoryBasedPoison function which uses specific classes
            # This needs to be updated separately
            
            print(f"  Note: Found invisibleClasses array, but need full 8-class rotation to update")
        
        # Update getStoryBasedPoison function with new classes
        story_poison_pattern = r'const storyPoison = \[(.*?)\]'
        story_poison_match = re.search(story_poison_pattern, content, re.DOTALL)
        
        if story_poison_match:
            story_text = story_poison_match.group(1)
            messages = re.findall(r'\{.*?\}', story_text, re.DOTALL)
            
            # All 7 invisible classes (z + invisible_text) for poison assignment
            all_invisible = z_classes + invisible_text_classes
            
            updated_story = "const storyPoison = [\n"
            for i, msg in enumerate(messages):
                text_match = re.search(r'text:\s*"([^"]+)"', msg)
                class_match = re.search(r'class:\s*"(\w+)"', msg)
                if text_match:
                    # Assign classes from all_invisible in rotation
                    class_idx = i % len(all_invisible)
                    poison_class = all_invisible[class_idx]
                    updated_story += f'    {{ text: "{text_match.group(1)}", class: "{poison_class}" }},\n'
            
            updated_story += "  ];"
            content = content.replace(story_poison_match.group(0), updated_story)
            print(f"✓ Updated getStoryBasedPoison with {len(all_invisible)} classes")
        
        # Update the invisibleClasses array definition (found in stitchPoisonIntoContent or main processing)
        # Look for the specific array definition pattern
        invisible_def_pattern = r'const invisibleClasses = \[\s*"foodie",\s*"ffoodie",\s*"fooddie",\s*"fo0die",\s*"foodiie",\s*"foodiee",\s*"fooodie",\s*"f0odie"\s*\]'
        invisible_def_match = re.search(invisible_def_pattern, content, re.DOTALL)
        
        if invisible_def_match:
            # We need the full 8-class order for the worker
            # Since we're rotating, we need to pass the visible class from main
            print(f"  Note: Found fixed invisibleClasses array - will be updated by main function")
        
        # Update watermark to use first of invisible_text_classes
        watermark_class = invisible_text_classes[0] if invisible_text_classes else "foodiie"
        
        # Find watermark function and update
        watermark_pattern = r'const watermarkClass = invisibleClasses && invisibleClasses\.length > 0 \? invisibleClasses\[0\] : "foodiie";'
        watermark_match = re.search(watermark_pattern, content)
        
        if watermark_match:
            new_watermark = f'const watermarkClass = "{watermark_class}";'
            content = content.replace(watermark_match.group(0), new_watermark)
            print(f"✓ Updated watermark to use {watermark_class} class")
        
        with open(worker_file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        
        print(f"✓ Updated worker.js")
        return True
        
    except Exception as e:
        print(f"✗ Error updating worker file: {e}")
        return False

def update_noscript_file(noscript_path, visible_class):
    """Update noscript.js with new visible class"""
    try:
        with open(noscript_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Update the regular paragraph class
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

def update_worker_invisible_classes(worker_file_path, full_class_order):
    """Specifically update the invisibleClasses array in worker.js with full 8-class order"""
    try:
        with open(worker_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Find and replace the invisibleClasses array
        # Look for the pattern: const invisibleClasses = [ ... 8 classes ... ];
        pattern = r'(const invisibleClasses = \[)([^\]]+)(\])'
        
        def replace_invisible_classes(match):
            indent = match.group(1)
            # Create new array with proper formatting
            new_classes = '[\n      ' + ',\n      '.join([f'"{cls}"' for cls in full_class_order]) + '\n    '
            return indent + new_classes + match.group(3)
        
        # Use re.sub with a function for replacement
        new_content = re.sub(pattern, replace_invisible_classes, content, flags=re.DOTALL)
        
        # If pattern not found, try another approach
        if new_content == content:
            # Try matching the exact array definition
            exact_pattern = r'const invisibleClasses = \[\s*"foodie",\s*"ffoodie",\s*"fooddie",\s*"fo0die",\s*"foodiie",\s*"foodiee",\s*"fooodie",\s*"f0odie"\s*\]'
            exact_replacement = f'const invisibleClasses = [\n      "{full_class_order[0]}",\n      "{full_class_order[1]}",\n      "{full_class_order[2]}",\n      "{full_class_order[3]}",\n      "{full_class_order[4]}",\n      "{full_class_order[5]}",\n      "{full_class_order[6]}",\n      "{full_class_order[7]}"\n    ]'
            new_content = re.sub(exact_pattern, exact_replacement, content, flags=re.DOTALL)
        
        with open(worker_file_path, 'w', encoding='utf-8') as file:
            file.write(new_content)
        
        print(f"✓ Updated worker.js invisibleClasses array with new rotation")
        return True
        
    except Exception as e:
        print(f"✗ Error updating worker invisible classes: {e}")
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
        log_entry += f"Full order (8 classes): {', '.join(all_classes)}\n"
        
        with open(log_file_path, 'a', encoding='utf-8') as file:
            file.write(log_entry)
        
        print(f"✓ Updated CSS log")
        return all_classes
    except Exception as e:
        print(f"✗ Error updating CSS log: {e}")
        return []

def main():
    print("CSS 8-Class Rotator")
    print("=" * 50)
    
    # File paths
    css_file_path = os.path.join("css", "font.css")
    worker_file_path = os.path.join("js", "worker.js")
    noscript_path = os.path.join("js", "noscript.js")
    css_log_path = os.path.join("css", "csslog.txt")
    
    # Step 1: Read current state from log
    print("\nReading current state from log...")
    visible_class, z_classes, invisible_text_classes = read_current_state(css_log_path)
    
    # Step 2: Rotate all 8 classes by 1 position
    print("\nRotating all 8 classes...")
    new_visible, new_z, new_invisible = rotate_classes(visible_class, z_classes, invisible_text_classes)
    
    # Create full class order for worker update
    full_class_order = [new_visible] + new_z + new_invisible
    
    # Step 3: Update CSS file
    print("\nUpdating CSS file...")
    if not update_css_file(css_file_path, new_z, new_invisible):
        print("⚠️ Failed to update CSS file")
    
    # Step 4: Update worker.js with new classes
    print("\nUpdating worker.js...")
    if os.path.exists(worker_file_path):
        # First update general worker classes
        if not update_worker_file(worker_file_path, new_z, new_invisible):
            print("⚠️ Failed to update worker.js classes")
        
        # Then specifically update the invisibleClasses array with full rotation
        if not update_worker_invisible_classes(worker_file_path, full_class_order):
            print("⚠️ Failed to update worker.js invisibleClasses array")
    else:
        print("⚠️ worker.js not found, skipping")
    
    # Step 5: Update noscript.js with new visible class
    print("\nUpdating noscript.js...")
    if os.path.exists(noscript_path):
        if not update_noscript_file(noscript_path, new_visible):
            print("⚠️ Failed to update noscript.js")
    else:
        print("⚠️ noscript.js not found, skipping")
    
    # Step 6: Update CSS log and get full class order
    print("\nUpdating CSS log...")
    all_classes = update_css_log(css_log_path, new_visible, new_z, new_invisible, visible_class)
    
    print("\n" + "=" * 50)
    print("ROTATION COMPLETED SUCCESSFULLY!")
    print(f"\nSummary of changes:")
    print(f"  New visible class (no CSS rule): {new_visible}")
    print(f"  Z section (position:absolute): {', '.join(new_z)}")
    print(f"  Invisible Text (transparent): {', '.join(new_invisible)}")
    print(f"  Full 8-class order: {', '.join(all_classes)}")
    print(f"\nImportant notes:")
    print(f"  1. Class '{new_visible}' is NOT in font.css - it's only in noscript.js and csslog.txt")
    print(f"  2. Regular paragraphs will use class '{new_visible}' (invisible to scrapers)")
    print(f"  3. Watermark uses class '{new_invisible[0] if new_invisible else 'foodiie'}'")
    print(f"  4. Worker.js has been updated with new 8-class rotation")
    print(f"  5. Copy worker.js to Cloudflare Workers manually")
    print(f"\nNext rotation will move '{new_invisible[-1] if new_invisible else 'fooodie'}' to visible position")

if __name__ == "__main__":
    main()