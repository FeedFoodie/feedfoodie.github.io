import os
import re
import json
import yaml
from pathlib import Path
from datetime import datetime
from collections import defaultdict
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def extract_yaml_frontmatter(file_content):
    """Extract YAML frontmatter from markdown file, handling various formats"""
    try:
        pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
        match = re.match(pattern, file_content, re.DOTALL | re.MULTILINE)
        if match:
            yaml_str = match.group(1)
            return yaml.safe_load(yaml_str)
        else:
            # Try alternative pattern without trailing newline
            pattern2 = r'^---\s*\n(.*?)\n---\s*(.*)$'
            match2 = re.match(pattern2, file_content, re.DOTALL | re.MULTILINE)
            if match2:
                yaml_str = match2.group(1)
                return yaml.safe_load(yaml_str)
    except Exception as e:
        logger.warning(f"YAML parsing error: {e}")
    
    return None

def extract_chapter_id(filename):
    """Extract chapter ID from filename like 2025-12-26-SIMB477.md"""
    try:
        base_name = os.path.splitext(filename)[0]
        # Remove date part (YYYY-MM-DD-)
        chapter_id = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', base_name)
        return chapter_id
    except:
        return filename

def extract_date_from_filename(filename):
    """Extract date from filename like 2025-12-26-SIMB477.md"""
    try:
        match = re.match(r'^(\d{4})-(\d{2})-(\d{2})-(.*)\.md$', filename)
        if match:
            year, month, day = match.groups()[:3]
            # Create a datetime object with default time 00:00:01
            return f"{year}-{month}-{day} 00:00:01"
    except:
        pass
    return None

def generate_url(tag, chapter_id):
    """Generate URL based on tag and chapter ID"""
    return f"/{tag.lower()}/{chapter_id}.html"

def parse_date(date_str, filename):
    """Parse date string with multiple fallback strategies"""
    if not date_str:
        # Try to extract from filename
        filename_date = extract_date_from_filename(filename)
        if filename_date:
            return filename_date
        return "1970-01-01 00:00:01"  # Ultimate fallback
    
    # If date_str is already a datetime object
    if isinstance(date_str, datetime):
        return date_str.strftime("%Y-%m-%d %H:%M:%S")
    
    # Clean up the date string
    date_str = str(date_str).strip()
    
    # Remove timezone info if present (like +0800)
    date_str = re.sub(r'\s*[+-]\d{4}$', '', date_str)
    
    # Try multiple date formats
    date_formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
        "%Y/%m/%d %H:%M:%S",
        "%Y/%m/%d"
    ]
    
    for fmt in date_formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime("%Y-%m-%d %H:%M:%S")
        except ValueError:
            continue
    
    # Try extracting date from any string that looks like a date
    date_match = re.search(r'(\d{4})[-/](\d{1,2})[-/](\d{1,2})', date_str)
    if date_match:
        year, month, day = date_match.groups()
        month = month.zfill(2)
        day = day.zfill(2)
        return f"{year}-{month}-{day} 00:00:01"
    
    # Last resort: extract from filename
    filename_date = extract_date_from_filename(filename)
    if filename_date:
        return filename_date
    
    return "1970-01-01 00:00:01"

def process_posts(posts_dir, output_dir):
    """Process ALL markdown posts and generate JSON files in chronological order"""
    posts_dir = Path(posts_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True, parents=True)
    
    # Dictionary to track all posts by tag
    all_posts_by_tag = defaultdict(list)
    all_tags = set()
    processed_files = 0
    skipped_files = 0
    files_with_date_issues = []
    
    logger.info(f"Scanning directory: {posts_dir}")
    logger.info(f"Found {len(list(posts_dir.glob('*.md')))} markdown files")
    
    # Get all markdown files
    md_files = list(posts_dir.glob("*.md"))
    
    # Sort files by filename (which includes date) as initial order
    md_files.sort(key=lambda x: x.name)
    
    for md_file in md_files:
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if file has content
            if not content.strip():
                logger.warning(f"Skipping empty file: {md_file.name}")
                skipped_files += 1
                continue
            
            frontmatter = extract_yaml_frontmatter(content)
            if not frontmatter:
                logger.warning(f"No YAML frontmatter found in: {md_file.name}")
                skipped_files += 1
                continue
            
            # Get tags ONLY (ignore categories completely)
            tags = frontmatter.get('tags', [])
            
            # Handle different tag formats
            if isinstance(tags, str):
                if ',' in tags:
                    tags = [t.strip() for t in tags.split(',')]
                else:
                    tags = [tags.strip()]
            elif tags is None:
                tags = []
            
            # Clean and normalize tags
            cleaned_tags = []
            for tag in tags:
                if tag and str(tag).strip():
                    tag_lower = str(tag).lower().strip()
                    if tag_lower and tag_lower not in cleaned_tags:
                        cleaned_tags.append(tag_lower)
            
            if not cleaned_tags:
                logger.warning(f"No valid tags found in: {md_file.name}")
                skipped_files += 1
                continue
            
            # Extract chapter ID from filename
            chapter_id = extract_chapter_id(md_file.name)
            
            # Get title
            title = frontmatter.get('title', '')
            if not title:
                title = chapter_id  # Fallback to chapter ID if no title
            
            # Parse date with multiple fallbacks
            date_str = frontmatter.get('date', '')
            parsed_date = parse_date(date_str, md_file.name)
            
            # Extract just the date part for sorting
            date_for_sorting = parsed_date.split()[0] if ' ' in parsed_date else parsed_date
            
            # Log if we had to extract date from filename
            if not date_str and extract_date_from_filename(md_file.name):
                files_with_date_issues.append(md_file.name)
                logger.info(f"Extracted date from filename for: {md_file.name}")
            
            post_data = {
                'title': title,
                'chapter_id': chapter_id,
                'date': parsed_date,
                'date_for_sorting': date_for_sorting,
                'filename': md_file.name,
                'url': '',  # Will be set per tag
            }
            
            # Add to each tag's collection
            for tag in cleaned_tags:
                all_tags.add(tag)
                
                # Check if this post already exists for this tag
                existing_ids = [p['chapter_id'] for p in all_posts_by_tag[tag]]
                if chapter_id not in existing_ids:
                    post_copy = post_data.copy()
                    post_copy['url'] = generate_url(tag, chapter_id)
                    all_posts_by_tag[tag].append(post_copy)
                else:
                    logger.info(f"Duplicate chapter_id {chapter_id} for tag '{tag}', skipping")
            
            processed_files += 1
            
            # Progress indicator
            if processed_files % 100 == 0:
                logger.info(f"Processed {processed_files} files...")
                
        except Exception as e:
            logger.error(f"Error processing {md_file.name}: {str(e)}")
            skipped_files += 1
    
    logger.info(f"\n{'='*60}")
    logger.info(f"PROCESSING SUMMARY:")
    logger.info(f"  Total files found: {len(md_files)}")
    logger.info(f"  Successfully processed: {processed_files}")
    logger.info(f"  Skipped/Failed: {skipped_files}")
    
    if files_with_date_issues:
        logger.info(f"  Files with date extracted from filename: {len(files_with_date_issues)}")
        for f in files_with_date_issues[:10]:  # Show first 10
            logger.info(f"    - {f}")
        if len(files_with_date_issues) > 10:
            logger.info(f"    ... and {len(files_with_date_issues) - 10} more")
    
    logger.info(f"{'='*60}\n")
    
    # Process each tag's posts
    for tag, posts in all_posts_by_tag.items():
        try:
            # Remove any duplicates by chapter_id
            unique_posts = []
            seen_ids = set()
            for post in posts:
                if post['chapter_id'] not in seen_ids:
                    seen_ids.add(post['chapter_id'])
                    unique_posts.append(post)
            
            # Sort by date in CHRONOLOGICAL order (oldest to newest)
            # This is for TOC display
            sorted_posts = sorted(
                unique_posts,
                key=lambda x: x['date_for_sorting']
            )
            
            # Add previous/next references for navigation
            # IMPORTANT: For chronological TOC (oldest to newest):
            # - "prev" should point to OLDER chapter (lower index)
            # - "next" should point to NEWER chapter (higher index)
            for i, post in enumerate(sorted_posts):
                # Previous chapter (older)
                if i > 0:
                    post['prev_url'] = sorted_posts[i-1]['url']
                    post['prev_title'] = sorted_posts[i-1]['title']
                else:
                    post['prev_url'] = None
                    post['prev_title'] = None
                
                # Next chapter (newer)
                if i < len(sorted_posts) - 1:
                    post['next_url'] = sorted_posts[i+1]['url']
                    post['next_title'] = sorted_posts[i+1]['title']
                else:
                    post['next_url'] = None
                    post['next_title'] = None
            
            all_posts_by_tag[tag] = sorted_posts
            
            # Write individual tag JSON file
            tag_file = output_dir / f"{tag}.json"
            with open(tag_file, 'w', encoding='utf-8') as f:
                json.dump(sorted_posts, f, indent=2, ensure_ascii=False)
            
            # Log the date range for this tag
            if sorted_posts:
                first_date = sorted_posts[0]['date_for_sorting']
                last_date = sorted_posts[-1]['date_for_sorting']
                logger.info(f"✓ {tag}: {len(sorted_posts)} posts from {first_date} to {last_date}")
            else:
                logger.info(f"✓ {tag}: 0 posts")
            
        except Exception as e:
            logger.error(f"Error processing tag '{tag}': {e}")
    
    # Create index of all tags
    tags_index = {
        'all_tags': sorted(list(all_tags)),
        'tag_counts': {tag: len(posts) for tag, posts in all_posts_by_tag.items()},
        'generated_at': datetime.now().isoformat(),
        'total_posts': processed_files,
        'note': 'Posts sorted chronologically (oldest to newest) for TOC'
    }
    
    with open(output_dir / 'tags_index.json', 'w', encoding='utf-8') as f:
        json.dump(tags_index, f, indent=2, ensure_ascii=False)
    
    # Create a detailed summary file
    summary = {
        'total_files_processed': processed_files,
        'total_tags_found': len(all_tags),
        'tags_with_post_counts': {tag: len(posts) for tag, posts in all_posts_by_tag.items()},
        'date_range_by_tag': {}
    }
    
    for tag, posts in all_posts_by_tag.items():
        if posts:
            summary['date_range_by_tag'][tag] = {
                'oldest': posts[0]['date'] if posts else None,
                'newest': posts[-1]['date'] if posts else None,
                'count': len(posts)
            }
    
    with open(output_dir / 'summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    logger.info(f"\n{'='*60}")
    logger.info("FINAL SUMMARY:")
    logger.info(f"  Unique tags found: {len(all_tags)}")
    
    # Show detailed tag counts
    for tag in sorted(all_tags):
        count = len(all_posts_by_tag[tag])
        posts = all_posts_by_tag[tag]
        if posts:
            date_range = f"({posts[0]['date_for_sorting']} to {posts[-1]['date_for_sorting']})"
            logger.info(f"    {tag}: {count:4d} posts {date_range}")
        else:
            logger.info(f"    {tag}: {count:4d} posts")
    
    total_posts = sum(len(posts) for posts in all_posts_by_tag.values())
    logger.info(f"  Total post entries: {total_posts}")
    logger.info(f"  JSON files saved to: {output_dir}/")
    logger.info(f"{'='*60}")
    
    return all_posts_by_tag

def debug_specific_posts(posts_dir, tag_to_check):
    """Debug function to check specific posts"""
    posts_dir = Path(posts_dir)
    
    logger.info(f"\n{'='*60}")
    logger.info(f"DEBUG: Checking for posts with tag '{tag_to_check}'")
    logger.info(f"{'='*60}")
    
    for md_file in posts_dir.glob("*.md"):
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            frontmatter = extract_yaml_frontmatter(content)
            if not frontmatter:
                continue
            
            tags = frontmatter.get('tags', [])
            if isinstance(tags, str):
                if ',' in tags:
                    tags = [t.strip() for t in tags.split(',')]
                else:
                    tags = [tags.strip()]
            elif tags is None:
                tags = []
            
            tags = [t.lower() for t in tags if t]
            
            if tag_to_check in tags:
                date_str = frontmatter.get('date', 'NONE')
                title = frontmatter.get('title', 'NO TITLE')
                logger.info(f"{md_file.name}")
                logger.info(f"  Title: {title}")
                logger.info(f"  Date in YAML: {date_str}")
                
                # Extract date from filename
                filename_date = extract_date_from_filename(md_file.name)
                logger.info(f"  Date from filename: {filename_date}")
                
                # Parse it
                parsed = parse_date(date_str, md_file.name)
                logger.info(f"  Parsed date: {parsed}")
                logger.info("")
                
        except Exception as e:
            pass

if __name__ == "__main__":
    # Configuration
    POSTS_DIR = "_posts"
    OUTPUT_DIR = "_data/toc"
    
    # First, clean the output directory
    if os.path.exists(OUTPUT_DIR):
        import shutil
        shutil.rmtree(OUTPUT_DIR)
    
    logger.info("Starting comprehensive JSON generation from Jekyll posts...")
    logger.info("This version:")
    logger.info("  1. Processes ALL posts (including after July 2025)")
    logger.info("  2. Extracts dates from filenames when YAML date is missing")
    logger.info("  3. Sorts chronologically (oldest to newest) for TOC")
    logger.info("  4. Sets proper prev/next navigation")
    logger.info("-" * 60)
    
    # Optional: Debug a specific tag
    # debug_specific_posts(POSTS_DIR, "simb")
    
    # Process all posts
    process_posts(POSTS_DIR, OUTPUT_DIR)
    
    logger.info("\n" + "="*60)
    logger.info("VERIFICATION COMMANDS:")
    logger.info(f"  Check simb.json: python -c \"import json; data=json.load(open('{OUTPUT_DIR}/simb.json')); print(f'Total simb posts: {{len(data)}}'); print('First 3:', json.dumps(data[:3], indent=2)); print('Last 3:', json.dumps(data[-3:], indent=2))\"")
    logger.info(f"  Check summary: cat {OUTPUT_DIR}/summary.json")
    logger.info("="*60)