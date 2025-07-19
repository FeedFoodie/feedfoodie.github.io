import os
import re
import shutil
import tkinter as tk
from tkinter import filedialog
import random
import yaml
from datetime import datetime, date

# This function is unchanged
def add_agg_annoy_markers(lines):
    text_lines = lines[::2]
    if not text_lines:
        return []
    output_items = []
    index = 0
    while index < len(text_lines):
        interval = random.randint(6, 15)
        output_items.extend(text_lines[index:index + interval])
        index += interval
        if index < len(text_lines):
            random_number = random.randint(1, 10)
            marker = f"aggAnnoy{random_number:02d}"
            output_items.append(marker)
    final_lines = []
    for item in output_items:
        final_lines.append(item.strip() + "\n")
        final_lines.append("\n")
    if final_lines:
        final_lines.pop()
    return final_lines

def generate_index_page(posts_dir, site_root):
    print("\n--- Generating Index Page ---")
    try:
        all_posts = []
        for filename in os.listdir(posts_dir):
            if filename.endswith(".md"):
                filepath = os.path.join(posts_dir, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    try:
                        front_matter_text = re.match(r'---\s*\n(.*?)\n---', content, re.DOTALL).group(1)
                        front_matter = yaml.safe_load(front_matter_text) if front_matter_text else {}
                        
                        # --- FINAL DATE LOGIC ---
                        # Check if the date field exists. If not, skip this file entirely.
                        if 'date' not in front_matter or not front_matter['date']:
                            print(f"  - Warning: No 'date' in front matter for {filename}. Skipping.")
                            continue

                        post_date = None
                        fm_date = front_matter['date']
                        if isinstance(fm_date, datetime):
                            post_date = fm_date
                        elif isinstance(fm_date, date):
                            post_date = datetime.combine(fm_date, datetime.min.time())
                        elif isinstance(fm_date, str):
                            try:
                                post_date = datetime.strptime(fm_date, '%Y-%m-%d %H:%M:%S %z')
                            except ValueError:
                                try:
                                    post_date = datetime.strptime(fm_date, '%Y-%m-%d %H:%M:%S')
                                except ValueError:
                                    try:
                                        post_date = datetime.strptime(fm_date, '%Y-%m-%d')
                                    except ValueError:
                                        print(f"  - Warning: Could not parse date string '{fm_date}' in {filename}. Skipping.")
                                        continue # Skip if date format is unreadable
                        
                        # Make all datetimes "naive" (remove timezone) to allow sorting
                        if post_date and post_date.tzinfo is not None:
                            post_date = post_date.replace(tzinfo=None)
                        # --- END FINAL DATE LOGIC ---

                        slug = filename.split('-', 3)[3].replace('.md', '')
                        url = f"/{front_matter.get('categories', ['uncategorized'])[0]}/{slug}.html"
                        
                        all_posts.append({
                            'title': front_matter.get('title', 'Untitled'),
                            'date': post_date,
                            'tags': front_matter.get('tags', []),
                            'url': url
                        })
                    except Exception as e:
                        print(f"  - Warning: Could not parse {filename}. Skipping. Error: {e}")

        all_posts.sort(key=lambda p: p['date'], reverse=True)
        print(f"  ✓ Found and sorted {len(all_posts)} posts with valid dates.")

        posts_per_page = 20
        latest_posts = all_posts[:posts_per_page]

        post_list_html = '<ul class="post-list">\n'
        for post in latest_posts:
            date_str = f"{post['date'].strftime('%b')} {post['date'].day}, {post['date'].year}"
            tag_html = f"{post['tags'][0].upper()} " if post['tags'] else ""
            post_list_html += f'  <li>\n    <span class="post-meta">{date_str}</span>\n    <h3>\n      {tag_html}<a href="{post["url"]}">{post["title"]}</a>\n    </h3>\n  </li>\n'
        post_list_html += '</ul>'

        disclaimer_html = """
<h2 id="disclaimer">Disclaimer</h2>
<ol>
<li>Copyrights to <a href="/LNB/">Legend of the Northern Blade</a> are held by the author, Woogak. </li>
<li>Copyrights to <a href="/SIMB/">Star Instructor Master Baek</a> are held by the author, Ganjajang. </li>
<li>Copyrights to <a href="/HERO/">Heroes</a> are held by the author, Wen Rui'an. </li>
<li>Copyrights to <a href="/ABSW/">Absolute Warrior</a> are held by the author, Jang Yeonghun. </li>
<li>Do not take credit or make a profit from our work. Our translations can be read for free, with no ads. We do not ask for donations.</li>
<li>The translator is motivated only by comments, but don't bother asking for faster releases.</li>
</ol>
<p><span style="color:#fcd299;"><strong>Chapters for all series only update from Friday to Sunday, UTC+8 timezone.</strong></span></p>
"""

        page_content = f"""---
layout: home
---
{disclaimer_html}
<h2 id="latest-updates">Latest Updates</h2>
{post_list_html}
"""

        output_path = os.path.join(site_root, 'index.html')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(page_content)
        print(f"  ✓ Generated: {output_path}")

    except Exception as e:
        print(f"--- A CRITICAL ERROR occurred in generate_index_page: {e} ---")

def process_markdown_files():
    site_root_dir = r'C:\Users\rebec\Documents\GitHub\feedfoodie.github.io'
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
            front_matter_match = re.match(r'---\s*\n(.*?)\n---', content, re.DOTALL)
            if not front_matter_match:
                print(f"Warning: No YAML front matter found in {filename}. Skipping.")
                continue
            front_matter_text = front_matter_match.group(1)
            main_content = content[front_matter_match.end():].lstrip()
            new_line = f"markdown_source: {filename}"
            updated_front_matter = f"---\n{front_matter_text}\n{new_line}\n---"
            posts_filepath = os.path.join(posts_dest_dir, filename)
            with open(posts_filepath, 'w', encoding='utf-8') as f:
                f.write(updated_front_matter)
            print(f"  ✓ Saved front matter to: {posts_filepath}")
            content_dest_dir = None
            if "ABSW" in filename: content_dest_dir = absw_dest_dir
            elif "SIMB" in filename: content_dest_dir = simb_dest_dir
            elif "LNB" in filename: content_dest_dir = lnb_dest_dir
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
    
    generate_index_page(posts_dest_dir, site_root_dir)
    
    print("--- Script finished ---")

if __name__ == "__main__":
    process_markdown_files()