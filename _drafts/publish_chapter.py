import os
import re
import shutil
import tkinter as tk
from tkinter import filedialog
import random
import yaml
from datetime import datetime, date

def add_agg_annoy_markers(lines):
    # Define the text replacements for typographic characters
    replacements = {
        "“": "\"",
        "”": "\"",
        "’": "'",
        "‘": "'",
        "…": "...",
    }

    # Apply the replacements to each incoming line
    processed_lines = []
    for line in lines:
        for old, new in replacements.items():
            line = line.replace(old, new)
        processed_lines.append(line)
        
    # Continue with the original logic using the processed lines
    text_lines = [line for line in processed_lines if line.strip()]
    if not text_lines:
        return []

    output_items = []
    index = 0
    while index < len(text_lines):
        interval = random.randint(6, 15)
        output_items.extend(text_lines[index:index + interval])
        index += interval

        if index < len(text_lines):
            prev_line = text_lines[index - 1].strip()
            next_line = text_lines[index].strip()
            
            if not (prev_line.startswith('>') and next_line.startswith('>')):
                random_number = random.randint(1, 10)
                marker = f"SuandFriends{random_number:02d}"
                output_items.append(marker)

    final_lines = []
    for i, item in enumerate(output_items):
        current_line_stripped = item.strip()
        final_lines.append(current_line_stripped + "\n")

        if i < len(output_items) - 1:
            next_line_stripped = output_items[i + 1].strip()
            if not (current_line_stripped.startswith('>') and next_line_stripped.startswith('>')):
                final_lines.append("\n")
                
    return final_lines

def generate_index_page(posts_dir, site_root):
    try:
        all_posts = []
        for filename in os.listdir(posts_dir):
            if filename.endswith(".md"):
                filepath = os.path.join(posts_dir, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    try:
                        front_matter_match = re.match(r'---\s*\n(.*?)\n---', content, re.DOTALL)
                        if not front_matter_match:
                            continue
                        
                        front_matter_text = front_matter_match.group(1)
                        front_matter = yaml.safe_load(front_matter_text) if front_matter_text else {}
                        
                        if 'date' not in front_matter or not front_matter['date']:
                            continue

                        post_date = None
                        fm_date = front_matter['date']
                        if isinstance(fm_date, datetime):
                            post_date = fm_date
                        elif isinstance(fm_date, date):
                            post_date = datetime.combine(fm_date, datetime.min.time())
                        elif isinstance(fm_date, str):
                            for fmt in ('%Y-%m-%d %H:%M:%S %z', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d'):
                                try:
                                    post_date = datetime.strptime(fm_date, fmt)
                                    break
                                except ValueError:
                                    pass
                            if not post_date:
                                continue
                        
                        if post_date and post_date.tzinfo is not None:
                            post_date = post_date.replace(tzinfo=None)

                        slug = filename.split('-', 3)[3].replace('.md', '')
                        url = f"/{front_matter.get('categories', ['uncategorized'])[0]}/{slug}.html"
                        
                        all_posts.append({
                            'title': front_matter.get('title', 'Untitled'),
                            'date': post_date,
                            'tags': front_matter.get('tags', []),
                            'url': url
                        })
                    except Exception as e:
                        pass

        all_posts.sort(key=lambda p: p['date'], reverse=True)

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

    except Exception as e:
        pass

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
    file_paths = filedialog.askopenfilenames(
        title="Select Markdown file(s) to process",
        filetypes=(("Markdown files", "*.md"), ("All files", "*.*"))
    )
    if not file_paths:
        return
    for file_path in file_paths:
        filename = os.path.basename(file_path)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            front_matter_match = re.match(r'---\s*\n(.*?)\n---', content, re.DOTALL)
            if not front_matter_match:
                continue
            front_matter_text = front_matter_match.group(1)
            main_content = content[front_matter_match.end():].lstrip()
            new_line = f"markdown_source: {filename}"
            updated_front_matter = f"---\n{front_matter_text}\n{new_line}\n---"
            posts_filepath = os.path.join(posts_dest_dir, filename)
            with open(posts_filepath, 'w', encoding='utf-8') as f:
                f.write(updated_front_matter)
            content_dest_dir = None
            if "ABSW" in filename: content_dest_dir = absw_dest_dir
            elif "SIMB" in filename: content_dest_dir = simb_dest_dir
            elif "LNB" in filename: content_dest_dir = lnb_dest_dir
            else:
                continue
            content_lines = main_content.splitlines(keepends=True)
            #modified_content_lines = add_agg_annoy_markers(content_lines)
            modified_content_lines = content_lines
            modified_main_content = "".join(modified_content_lines)
            content_filepath = os.path.join(content_dest_dir, filename)
            with open(content_filepath, 'w', encoding='utf-8') as f:
                f.write(modified_main_content)
            backup_filepath = os.path.join(backup_dest_dir, filename)
            shutil.move(file_path, backup_filepath)
        except Exception as e:
            pass
    
    generate_index_page(posts_dest_dir, site_root_dir)
    
if __name__ == "__main__":
    process_markdown_files()