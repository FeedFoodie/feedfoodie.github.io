#!/usr/bin/env python
"""
Standalone script to generate RSS feed files from JSON data.
Generates feeds exactly like the old Jekyll-feed plugin output.
"""

import os
import json
from datetime import datetime
import re
import yaml

def load_config(public_repo_dir):
    """Load Jekyll config to get site settings"""
    config_path = os.path.join(public_repo_dir, '_config.yml')
    config = {}
    
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = yaml.safe_load(f)
    except Exception as e:
        print(f"Warning: Could not load _config.yml: {e}")
        # Default values from your config
        config = {
            'url': 'https://northbladetl.com',
            'baseurl': '',
            'title': 'Northern Blade Translations',
            'description': 'Read free English fan translations of novels like Legend of the Northern Blade, Star Instructor Master Baek & more. No ads, no paywalls. Updated regularly.'
        }
    
    return config

def parse_date_for_rss(date_value):
    """Parse date and format for RSS (RFC 822 format)"""
    if not date_value:
        return ''
    
    date_str = str(date_value).strip()
    
    # Remove timezone offset if present
    date_str = re.sub(r'\s*[+-]\d{4}$', '', date_str)
    
    # Try multiple date formats
    date_formats = [
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%dT%H:%M:%S',
        '%Y-%m-%d %H:%M',
        '%Y-%m-%d'
    ]
    
    for fmt in date_formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            # Format as RFC 822 (required by RSS)
            return dt.strftime('%a, %d %b %Y %H:%M:%S +0000')
        except ValueError:
            continue
    
    # If parsing fails, return current time
    return datetime.now().strftime('%a, %d %b %Y %H:%M:%S +0000')

def escape_xml(text):
    """Escape XML special characters (mimics Jekyll's xml_escape)"""
    if not text:
        return ""
    
    text = str(text)
    # Basic XML escaping
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    text = text.replace('"', '&quot;')
    text = text.replace("'", '&apos;')
    
    return text

def generate_tag_feed(public_repo_dir, tag, posts, series_title, config):
    """Generate a tag-specific RSS feed file exactly like Jekyll-feed"""
    try:
        # Site settings
        site_url = config.get('url', 'https://northbladetl.com')
        baseurl = config.get('baseurl', '')
        site_description = config.get('description', '')
        
        # Current time for feed metadata
        current_time = datetime.now()
        current_rfc822 = current_time.strftime('%a, %d %b %Y %H:%M:%S +0000')
        
        # Get last 10 posts (newest first for RSS)
        feed_posts = posts[-10:] if len(posts) > 10 else posts
        
        # Build the RSS XML exactly like Jekyll-feed
        rss_content = f"""---
layout: null
---
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>{escape_xml(series_title)}</title>
        <description>{escape_xml(site_description)}</description>
        <link>{site_url}{baseurl}</link>
        <atom:link href="{site_url}{baseurl}/feed.{tag}.xml" rel="self" type="application/rss+xml"/>
        <pubDate>{current_rfc822}</pubDate>
        <lastBuildDate>{current_rfc822}</lastBuildDate>
        <generator>Jekyll v4.3.2</generator>
"""
        
        # Add items (in reverse order for newest first)
        for post in reversed(feed_posts):
            # Get post data
            title = escape_xml(post.get('title', ''))
            date_str = parse_date_for_rss(post.get('date', ''))
            
            # Build URL (matching Jekyll's url structure)
            post_url = f"{site_url}{post.get('url', '')}"
            
            # Build item exactly like Jekyll-feed
            rss_content += f"""        <item>
            <title>{tag.upper()} {title}</title>
            <author>somethingrandom@somethingrandom.com (FoodieMonster007)</author>
            <description>(NorthBladeTL) {escape_xml(series_title)} Chapter Update - {post_url}</description>
            <pubDate>{date_str}</pubDate>
            <link>{post_url}</link>
            <guid isPermaLink="true">{post_url}</guid>
            <category>{tag}</category>
        </item>
"""
        
        rss_content += """    </channel>
</rss>"""
        
        # Write feed file
        feed_path = os.path.join(public_repo_dir, f'feed.{tag}.xml')
        with open(feed_path, 'w', encoding='utf-8') as f:
            f.write(rss_content)
        
        print(f"  ✅ feed.{tag}.xml: {len(feed_posts)} posts")
        return True
        
    except Exception as e:
        print(f"  ❌ Error generating feed.{tag}.xml: {e}")
        import traceback
        traceback.print_exc()
        return False

def generate_overall_feed(public_repo_dir, posts, config):
    """Generate overall RSS feed with latest posts from all series"""
    try:
        # Site settings
        site_url = config.get('url', 'https://northbladetl.com')
        baseurl = config.get('baseurl', '')
        site_title = config.get('title', 'Northern Blade Translations')
        site_description = config.get('description', '')
        
        # Current time
        current_rfc822 = datetime.now().strftime('%a, %d %b %Y %H:%M:%S +0000')
        
        # Series title mapping
        series_titles = {
            'simb': 'Star Instructor Master Baek',
            'absw': 'Absolute Warrior', 
            'lnb': 'Legend of the Northern Blade',
            'lcs': 'Chronicles of the Demon Faction — Lee Cheonsang',
            'ruh': 'Reincarnated as an Unruly Heir',
            'hero': 'Heroes'
        }
        
        # Get top 10 posts sorted by date (newest first)
        def get_sort_key(post):
            date_str = post.get('date', '')
            if not date_str:
                return datetime.min
            # Try to parse date
            try:
                # Remove timezone
                clean_date = re.sub(r'\s*[+-]\d{4}$', '', str(date_str))
                # Try common formats
                for fmt in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d']:
                    try:
                        return datetime.strptime(clean_date, fmt)
                    except:
                        continue
            except:
                pass
            return datetime.min
        
        posts.sort(key=get_sort_key, reverse=True)
        top_posts = posts[:10]
        
        # Build RSS XML
        rss_content = f"""---
layout: null
---
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>{escape_xml(site_title)}</title>
        <description>{escape_xml(site_description)}</description>
        <link>{site_url}{baseurl}</link>
        <atom:link href="{site_url}{baseurl}/feed.xml" rel="self" type="application/rss+xml"/>
        <pubDate>{current_rfc822}</pubDate>
        <lastBuildDate>{current_rfc822}</lastBuildDate>
        <generator>Jekyll v4.3.2</generator>
"""
        
        for post in top_posts:
            tag = post.get('tag', '')
            title = escape_xml(post.get('title', ''))
            date_str = parse_date_for_rss(post.get('date', ''))
            series_title = series_titles.get(tag, tag.upper())
            post_url = f"{site_url}{post.get('url', '')}"
            
            rss_content += f"""        <item>
            <title>{tag.upper()} {title}</title>
            <author>somethingrandom@somethingrandom.com (FoodieMonster007)</author>
            <description>(NorthBladeTL) {escape_xml(series_title)} Chapter Update - {post_url}</description>
            <pubDate>{date_str}</pubDate>
            <link>{post_url}</link>
            <guid isPermaLink="true">{post_url}</guid>
            <category>{tag}</category>
        </item>
"""
        
        rss_content += """    </channel>
</rss>"""
        
        # Write feed file
        feed_path = os.path.join(public_repo_dir, 'feed.xml')
        with open(feed_path, 'w', encoding='utf-8') as f:
            f.write(rss_content)
        
        print(f"  ✅ feed.xml: {len(top_posts)} posts from all series")
        return True
        
    except Exception as e:
        print(f"  ❌ Error generating feed.xml: {e}")
        import traceback
        traceback.print_exc()
        return False

def generate_all_feeds(public_repo_dir):
    """Generate all RSS feed files from JSON data"""
    try:
        print("Generating RSS feed files from JSON...")
        
        # Load site config
        config = load_config(public_repo_dir)
        print(f"  Site URL: {config.get('url')}")
        
        # Series title mapping
        series_titles = {
            'simb': 'Star Instructor Master Baek',
            'absw': 'Absolute Warrior', 
            'lnb': 'Legend of the Northern Blade',
            'lcs': 'Chronicles of the Demon Faction — Lee Cheonsang',
            'ruh': 'Reincarnated as an Unruly Heir',
            'hero': 'Heroes'
        }
        
        # Directory paths
        toc_dir = os.path.join(public_repo_dir, '_data', 'toc')
        
        if not os.path.exists(toc_dir):
            print(f"❌ Directory not found: {toc_dir}")
            return False
        
        # Get all JSON files
        json_files = [f for f in os.listdir(toc_dir) 
                     if f.endswith('.json') 
                     and f not in ['index.json', 'summary.json', 'tags_index.json', 'master.json']]
        
        if not json_files:
            print("❌ No tag-specific JSON files found")
            return False
        
        print(f"Found {len(json_files)} tag-specific JSON files")
        
        all_posts = []
        
        # Process each tag-specific JSON
        for json_file in sorted(json_files):
            tag = json_file.replace('.json', '')
            json_path = os.path.join(toc_dir, json_file)
            
            print(f"  Processing {tag}...")
            
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    posts = json.load(f)
            except Exception as e:
                print(f"  ❌ Error reading {json_file}: {e}")
                continue
            
            if not posts:
                print(f"  ⚠️  No posts in {json_file}")
                continue
            
            # Generate tag-specific feed
            series_title = series_titles.get(tag, tag.upper())
            generate_tag_feed(public_repo_dir, tag, posts, series_title, config)
            
            # Add recent posts to overall feed (last 3 from each tag)
            recent_posts = posts[-3:] if len(posts) > 3 else posts
            for post in recent_posts:
                post['tag'] = tag
                all_posts.append(post)
        
        # Generate overall feed
        generate_overall_feed(public_repo_dir, all_posts, config)
        
        print(f"\n✅ RSS feeds generated successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error generating feeds: {e}")
        import traceback
        traceback.print_exc()
        return False

def validate_feed_file(file_path):
    """Validate a feed file structure"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"\nValidating {os.path.basename(file_path)}:")
        
        # Check for required elements
        checks = [
            ('XML declaration', '<?xml version="1.0"'),
            ('RSS opening tag', '<rss version="2.0"'),
            ('Channel element', '<channel>'),
            ('Title element', '<title>'),
            ('Link element', '<link>'),
            ('Atom self link', 'atom:link'),
            ('Items', '<item>')
        ]
        
        for check_name, check_str in checks:
            if check_str in content:
                print(f"  ✓ {check_name}")
            else:
                print(f"  ✗ {check_name}")
        
        # Count items
        item_count = content.count('<item>')
        print(f"  Items found: {item_count}")
        
        # Check for common issues
        if '---' in content and '<!' in content:
            print("  ⚠️  Contains both frontmatter and XML - this is correct for Jekyll")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Validation error: {e}")
        return False

if __name__ == "__main__":
    # Set your repository path
    PUBLIC_REPO_DIR = r"C:\Users\rebec\Documents\GitHub\feedfoodie.github.io"
    
    print("="*60)
    print("NORTHBLADETL RSS FEED GENERATOR (Jekyll-feed compatible)")
    print("="*60)
    
    if not os.path.exists(PUBLIC_REPO_DIR):
        print(f"❌ Repository directory not found: {PUBLIC_REPO_DIR}")
        print("Please update the PUBLIC_REPO_DIR variable in the script.")
        exit(1)
    
    # Generate all feeds
    success = generate_all_feeds(PUBLIC_REPO_DIR)
    
    if success:
        # Validate key feeds
        print("\n" + "="*60)
        print("VALIDATING FEED FILES:")
        print("="*60)
        
        validate_feed_file(os.path.join(PUBLIC_REPO_DIR, 'feed.xml'))
        validate_feed_file(os.path.join(PUBLIC_REPO_DIR, 'feed.simb.xml'))
        
        print("\n" + "="*60)
        print("NEXT STEPS:")
        print("1. Delete old jekyll-feed plugin from _config.yml and Gemfile")
        print("2. Commit and push the new feed files:")
        print(f"   cd \"{PUBLIC_REPO_DIR}\"")
        print("   git checkout gh-pages")
        print("   git add feed*.xml")
        print("   git commit -m \"Update RSS feeds to use JSON data\"")
        print("   git push origin gh-pages")
        print("3. Test feeds in your RSS reader")
        print("="*60)
    else:
        print("\n❌ Feed generation failed. Please check the errors above.")
        exit(1)