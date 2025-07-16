import os
import re
import shutil
import tkinter as tk
from tkinter import filedialog
import random

def add_agg_annoy_markers(lines):
    if not lines:
        return []

    output_lines = []
    index = 0
    while index < len(lines):
        interval = random.choice(range(10, 31, 2))
        output_lines.extend(lines[index:index + interval])
        index += interval
        
        if index < len(lines):
            random_number = random.randint(1, 10)
            random_string = f"\naggAnnoy{random_number:02d}\n\n"
            output_lines.append(random_string)
            
    return output_lines

def process_markdown_files():
    # Destination paths
    posts_dest_dir = r'C:\Users\rebec\Documents\GitHub\feedfoodie.github.io\_posts'
    absw_dest_dir = r'C:\Users\rebec\Documents\GitHub\feedfoodie.github.io\ABSW\chapters'
    simb_dest_dir = r'C:\Users\rebec\Documents\GitHub\feedfoodie.github.io\SIMB\chapters'
    lnb_dest_dir = r'C:\Users\rebec\Documents\GitHub\feedfoodie.github.io\LNB\chapters'
    backup_dest_dir = r'C:\Users\rebec\Documents\GitHub\post_backup'

    root = tk.Tk()
    root.withdraw()

    os.makedirs(posts_dest_dir, exist_ok=True)
    os.makedirs(absw_dest_dir, exist_ok=True)
    os.makedirs(simb_dest_dir, exist_ok=True)
    os.makedirs(lnb_dest_dir, exist_ok=True)
    os.makedirs(backup_dest_dir, exist_ok=True)

    print("Opening file dialog to select Markdown files...")
    file_paths = filedialog.askopenfilenames(
        title="Select Markdown file(s) to process",
        filetypes=(("Markdown files", "*.md"), ("All files", "*.*"))
    )

    if not file_paths:
        print("No files selected. Exiting script.")
        return

    print(f"\nProcessing {len(file_paths)} selected file(s)...\n")

    for file_path in file_paths:
        filename = os.path.basename(file_path)
        print(f"--- Processing: {filename} ---")

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            front_matter_match = re.match(r'---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)

            if not front_matter_match:
                print(f"Warning: No YAML front matter found in {filename}. Skipping.")
                continue

            front_matter_text = front_matter_match.group(1)
            main_content = content[front_matter_match.end():]
            new_line = f"markdown_source: {filename}"
            updated_front_matter = f"---\n{front_matter_text}\n{new_line}\n---"

            posts_filepath = os.path.join(posts_dest_dir, filename)
            with open(posts_filepath, 'w', encoding='utf-8') as f:
                f.write(updated_front_matter)
            print(f"  ✓ Saved front matter to: {posts_filepath}")

            content_dest_dir = None
            if "ABSW" in filename:
                content_dest_dir = absw_dest_dir
            elif "SIMB" in filename:
                content_dest_dir = simb_dest_dir
            elif "LNB" in filename:
                content_dest_dir = lnb_dest_dir
            else:
                print(f"  ✗ Warning: No matching category found in '{filename}'. Content not saved.")
                continue
            
            content_lines = main_content.splitlines(keepends=True)
            modified_content_lines = add_agg_annoy_markers(content_lines)
            modified_main_content = "".join(modified_content_lines)

            content_filepath = os.path.join(content_dest_dir, filename)
            with open(content_filepath, 'w', encoding='utf-8') as f:
                f.write(modified_main_content)
            print(f"  ✓ Saved content to: {content_filepath}")

            backup_filepath = os.path.join(backup_dest_dir, filename)
            shutil.move(file_path, backup_filepath)
            print(f"  ✓ Moved original file to: {backup_filepath}\n")

        except Exception as e:
            print(f"  ✗ Error processing file {filename}: {e}\n")

    print("--- Script finished ---")

if __name__ == "__main__":
    process_markdown_files()