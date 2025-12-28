import os
import re
import json
import yaml
from pathlib import Path

def extract_yaml_frontmatter(file_content):
    """Extract YAML frontmatter from markdown file - handles both formats"""
    # Try two patterns:
    # 1. With newline after second ---
    pattern1 = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    # 2. Without newline after second --- (end of file)
    pattern2 = r'^---\s*\n(.*?)\n---\s*$'
    
    match1 = re.match(pattern1, file_content, re.DOTALL)
    if match1:
        yaml_str = match1.group(1)
        try:
            return yaml.safe_load(yaml_str)
        except:
            return None
    
    match2 = re.match(pattern2, file_content, re.DOTALL)
    if match2:
        yaml_str = match2.group(1)
        try:
            return yaml.safe_load(yaml_str)
        except:
            return None
    
    return None

def extract_chapter_id(filename):
    """Extract chapter ID from filename like 2025-12-26-SIMB477.md"""
    base = os.path.splitext(filename)[0]
    # Remove date part (YYYY-MM-DD-)
    return re.sub(r'^\d{4}-\d{2}-\d{2}-', '', base)

def extract_chapter_number(chapter_id):
    """Extract numeric part from chapter ID (SIMB477 -> 477)"""
    # Extract all digits at the end of the string
    match = re.search(r'(\d+)$', chapter_id)
    return int(match.group(1)) if match else 0

def generate_url(tag, chapter_id):
    """Generate URL based on tag and chapter ID"""
    return f"/{tag.lower()}/{chapter_id}.html"

def main():
    POSTS_DIR = "_posts"
    OUTPUT_DIR = "_data/toc"
    
    # Clean output directory
    import shutil
    if os.path.exists(OUTPUT_DIR):
        shutil.rmtree(OUTPUT_DIR)
    os.makedirs(OUTPUT_DIR)
    
    print("Processing ALL markdown files...")
    
    # Track all posts by tag
    posts_by_tag = {}
    file_count = 0
    skipped_files = []
    
    # Get ALL markdown files
    all_md_files = list(Path(POSTS_DIR).glob("*.md"))
    print(f"Found {len(all_md_files)} total markdown files")
    
    # Sort by filename (which includes date)
    all_md_files.sort()
    
    # Process every single markdown file
    for md_file in all_md_files:
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Debug: Check file structure
            first_100 = content[:100].replace('\n', '\\n')
            
            frontmatter = extract_yaml_frontmatter(content)
            if not frontmatter:
                skipped_files.append((md_file.name, "No frontmatter"))
                continue
            
            # Get tags only
            tags = frontmatter.get('tags', [])
            if isinstance(tags, str):
                if ',' in tags:
                    tags = [t.strip() for t in tags.split(',')]
                else:
                    tags = [tags.strip()]
            elif tags is None:
                tags = []
            
            # Clean tags
            cleaned_tags = []
            for tag in tags:
                if tag and str(tag).strip():
                    tag_clean = str(tag).strip()
                    if tag_clean not in cleaned_tags:
                        cleaned_tags.append(tag_clean)
            
            if not cleaned_tags:
                skipped_files.append((md_file.name, "No tags"))
                continue
            
            # Extract chapter ID (e.g., SIMB477)
            chapter_id = extract_chapter_id(md_file.name)
            
            # Extract chapter number for sorting (e.g., 477)
            chapter_num = extract_chapter_number(chapter_id)
            
            # Get title
            title = frontmatter.get('title', chapter_id)
            
            # Get date exactly as-is
            date_value = frontmatter.get('date', '')
            date_str = str(date_value) if date_value else ''
            
            # Create post data
            post_data = {
                'title': title,
                'chapter_id': chapter_id,
                'chapter_num': chapter_num,
                'date': date_str,
                'filename': md_file.name,
                'url': ''
            }
            
            # Add to each tag's collection
            for tag in cleaned_tags:
                if tag not in posts_by_tag:
                    posts_by_tag[tag] = []
                
                post_copy = post_data.copy()
                post_copy['url'] = generate_url(tag, chapter_id)
                posts_by_tag[tag].append(post_copy)
            
            file_count += 1
            
            # Show progress for large batches
            if file_count % 50 == 0:
                print(f"  Processed {file_count} files...")
                
        except Exception as e:
            skipped_files.append((md_file.name, f"Error: {str(e)[:50]}"))
            continue
    
    print(f"\n✓ Successfully processed: {file_count} files")
    if skipped_files:
        print(f"⚠️  Skipped {len(skipped_files)} files:")
        for i, (filename, reason) in enumerate(skipped_files[:10]):
            print(f"   {filename}: {reason}")
        if len(skipped_files) > 10:
            print(f"   ... and {len(skipped_files) - 10} more")
    
    print(f"\nUnique tags found: {len(posts_by_tag)}")
    
    # Process each tag
    for tag, posts in posts_by_tag.items():
        try:
            # Remove duplicates by chapter_id
            unique_posts = []
            seen_ids = set()
            for post in posts:
                if post['chapter_id'] not in seen_ids:
                    seen_ids.add(post['chapter_id'])
                    unique_posts.append(post)
            
            # Sort by chapter number (ascending)
            sorted_posts = sorted(unique_posts, key=lambda x: x['chapter_num'])
            
            # Add prev/next navigation
            for i, post in enumerate(sorted_posts):
                if i > 0:  # Has previous (lower chapter number)
                    post['prev_url'] = sorted_posts[i-1]['url']
                    post['prev_title'] = sorted_posts[i-1]['title']
                else:
                    post['prev_url'] = None
                    post['prev_title'] = None
                
                if i < len(sorted_posts) - 1:  # Has next (higher chapter number)
                    post['next_url'] = sorted_posts[i+1]['url']
                    post['next_title'] = sorted_posts[i+1]['title']
                else:
                    post['next_url'] = None
                    post['next_title'] = None
            
            # Save JSON file
            output_file = Path(OUTPUT_DIR) / f"{tag}.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(sorted_posts, f, indent=2, ensure_ascii=False)
            
            # Show stats
            if sorted_posts:
                first_chapter = sorted_posts[0]['chapter_num']
                last_chapter = sorted_posts[-1]['chapter_num']
                print(f"  ✅ {tag}: {len(sorted_posts)} chapters ({first_chapter} to {last_chapter})")
            
        except Exception as e:
            print(f"  ❌ Error processing tag {tag}: {e}")
    
    # Create summary
    import datetime
    summary = {
        'generated_at': datetime.datetime.now().isoformat(),
        'total_files_processed': file_count,
        'tags': {tag: len(posts) for tag, posts in posts_by_tag.items()},
        'skipped_files': len(skipped_files)
    }
    
    with open(Path(OUTPUT_DIR) / 'summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Done! JSON files saved to {OUTPUT_DIR}/")
    
    # Quick verification
    print("\nVerification:")
    for tag in sorted(posts_by_tag.keys()):
        posts = posts_by_tag[tag]
        if posts:
            unique_ids = set(p['chapter_id'] for p in posts)
            print(f"  {tag}: {len(unique_ids)} unique chapters")

if __name__ == "__main__":
    main()