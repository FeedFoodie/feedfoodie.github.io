import os
import re
import shutil
import tkinter as tk
from tkinter import filedialog
import yaml
from datetime import datetime, date
# import random

'''
def insert_suand_friends(lines):
    if not lines:
        return lines
    
    processed_lines = []
    line_count = len(lines)
    current_line = 0
    
    # Set initial gap between 20-40 lines
    next_insertion = random.randint(10, 30)
    
    while current_line < line_count:
        # Add current line
        processed_lines.append(lines[current_line])
        
        # Check if we should insert SuandFriends on this odd-numbered line
        # and if we've reached the insertion point
        if (current_line + 1) % 2 == 1 and (current_line + 1) >= next_insertion:
            # Generate random SuandFriends number (01-10)
            friend_num = random.randint(1, 10)
            friend_text = f"\nSuandFriends{friend_num:02d}\n"
            
            # Insert after current line
            processed_lines.append(friend_text)
            
            # Set next insertion point (20-40 lines from current position)
            next_insertion = (current_line + 1) + random.randint(20, 40)
        
        current_line += 1
    
    return processed_lines
'''

def replace_text(lines):
    replacements = {
        "“": "\"",
        "”": "\"",
        "’": "'",
        "‘": "'",
        "…": "...",
    }

    return [replace_in_line(line, replacements) for line in lines]

def replace_in_line(line, replacements):
    for old, new in replacements.items():
        line = line.replace(old, new)
    return line

def generate_index_page(posts_dir, site_root):
    try:
        all_posts = []
        
        # Use list comprehension to filter and process markdown files
        md_files = [f for f in os.listdir(posts_dir) if f.endswith(".md")]
        
        for filename in md_files:
            filepath = os.path.join(posts_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            front_matter_match = re.match(r'---\s*\n(.*?)\n---', content, re.DOTALL)
            if not front_matter_match:
                continue
            
            front_matter_text = front_matter_match.group(1)
            front_matter = yaml.safe_load(front_matter_text) if front_matter_text else {}
            
            if 'date' not in front_matter or not front_matter['date']:
                continue

            post_date = parse_date(front_matter['date'])
            if not post_date:
                continue

            slug = filename.split('-', 3)[3].replace('.md', '')
            url = f"/{front_matter.get('categories', ['uncategorized'])[0]}/{slug}.html"
            
            all_posts.append({
                'title': front_matter.get('title', 'Untitled'),
                'date': post_date,
                'tags': front_matter.get('tags', []),
                'url': url
            })

        all_posts.sort(key=lambda p: p['date'], reverse=True)
        latest_posts = all_posts[:20]  # posts_per_page = 20

        # Generate post list HTML more efficiently
        post_list_items = []
        for post in latest_posts:
            date_str = f"{post['date'].strftime('%b')} {post['date'].day}, {post['date'].year}"
            tag_html = f"{post['tags'][0].upper()} " if post['tags'] else ""
            post_list_items.append(
                f'  <li>\n    <span class="post-meta">{date_str}</span>\n    '
                f'<h3>\n      {tag_html}<a href="{post["url"]}">{post["title"]}</a>\n    </h3>\n  </li>'
            )
        
        post_list_html = '<ul class="post-list">\n' + '\n'.join(post_list_items) + '\n</ul>'

        disclaimer_html = """
<h2 id="disclaimer">Disclaimer</h2>
<ol>
<li>Copyrights to <a href="/LNB/">Legend of the Northern Blade</a> are held by the author, Woogak. </li>
<li>Copyrights to <a href="/SIMB/">Star Instructor Master Baek</a> are held by the author, Ganjajang. </li>
<li>Copyrights to <a href="/HERO/">Heroes</a> are held by the author, Wen Rui'an. </li>
<li>Copyrights to <a href="/ABSW/">Absolute Warrior</a> are held by the author, Jang Yeonghun. </li>
<li>Copyrights to <a href="/RUH/">Reincarnated as an Unruly Heir</a> are held by the author, Dae Eunho. </li>
<li>Copyrights to <a href="/LCS/">Chronicles of the Demon Faction</a> are held by the author, Codezero. </li>
<li>Do not take credit or make a profit from our work. Our translations can be read for free, with no ads. We do not ask for donations. Please purchase the novel or manhwa raws/official translation if you can afford to.</li>
<li>The translator is motivated only by comments, but don't bother asking for faster releases.</li>
</ol>
<p><span style="color:#fcd299;"><strong>Chapters for all series only update from Friday to Sunday, UTC+8 timezone.</strong></span></p>
"""

        page_content = f"""---
layout: home
description: "Read free English fan translations of novels like Legend of the Northern Blade, Star Instructor Master Baek & more. No ads, no paywalls. Updated regularly."
---
{disclaimer_html}
<h2 id="latest-updates">Latest Updates</h2>
{post_list_html}
"""

        output_path = os.path.join(site_root, 'index.html')
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(page_content)

    except Exception as e:
        print(f"Error generating index page: {e}")

def parse_date(date_value):
    """Helper function to parse date from various formats"""
    if isinstance(date_value, datetime):
        return date_value.replace(tzinfo=None) if date_value.tzinfo else date_value
    elif isinstance(date_value, date):
        return datetime.combine(date_value, datetime.min.time())
    elif isinstance(date_value, str):
        for fmt in ('%Y-%m-%d %H:%M:%S %z', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d'):
            try:
                parsed_date = datetime.strptime(date_value, fmt)
                return parsed_date.replace(tzinfo=None) if parsed_date.tzinfo else parsed_date
            except ValueError:
                continue
    return None

def process_markdown_files():
    # Base directories
    base_dir = r'C:\Users\rebec\Documents\GitHub\feedfoodie.github.io'
    backup_dir = r'C:\Users\rebec\Documents\GitHub\post_backup'
    
    posts_dest_dir = os.path.join(base_dir, '_posts')
    
    # Setup file dialog
    root = tk.Tk()
    root.withdraw()
    
    file_paths = filedialog.askopenfilenames(
        title="Select Markdown file(s) to process",
        filetypes=(("Markdown files", "*.md"), ("All files", "*.*"))
    )
    
    if not file_paths:
        return
        
    processed_count = 0
    for file_path in file_paths:
        filename = os.path.basename(file_path)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            front_matter_match = re.match(r'---\s*\n(.*?)\n---', content, re.DOTALL)
            if not front_matter_match:
                continue
                
            front_matter_text = front_matter_match.group(1)
            front_matter = yaml.safe_load(front_matter_text) if front_matter_text else {}
            main_content = content[front_matter_match.end():].lstrip()
            
            # Update front matter with source filename
            updated_front_matter = f"---\n{front_matter_text}\nmarkdown_source: {filename}\n---"
            
            # Write to posts directory
            posts_filepath = os.path.join(posts_dest_dir, filename)
            with open(posts_filepath, 'w', encoding='utf-8') as f:
                f.write(updated_front_matter)
            
            # Determine content destination using tags from YAML front matter
            tags = front_matter.get('tags', [])
            if not tags:
                print(f"Skipping {filename}: no tags in front matter")
                continue
                
            series_tag = tags[0].upper()
            content_dest_dir = os.path.join(base_dir, series_tag, "chapters")
                
            content_lines = main_content.splitlines(keepends=True)
            
            # If SuandFriends insertion is needed, uncomment these lines:
            # content_lines_with_friends = insert_suand_friends(content_lines)
            # modified_content_lines = replace_text(content_lines_with_friends)
            
            modified_content_lines = replace_text(content_lines)
            modified_main_content = "".join(modified_content_lines)
            
            content_filepath = os.path.join(content_dest_dir, filename)
            with open(content_filepath, 'w', encoding='utf-8') as f:
                f.write(modified_main_content)
            
            # Move original to backup
            backup_filepath = os.path.join(backup_dir, filename)
            shutil.move(file_path, backup_filepath)
            
            processed_count += 1
            
        except Exception as e:
            print(f"Error processing {filename}: {e}")
    
    if processed_count > 0:
        generate_index_page(posts_dest_dir, base_dir)
        print(f"Successfully processed {processed_count} file(s)")
    
if __name__ == "__main__":
    process_markdown_files()