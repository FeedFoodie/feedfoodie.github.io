import datetime
import sys

def generate_markdown(tag, chapter_num):
    # Get current date and time
    now = datetime.datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M") + ":00 +0800"
    
    # Generate filename
    filename = f"{date_str}-{tag.upper()}{chapter_num}.md"
    
    # Generate YAML content
    yaml_content = f"""---
layout: post{tag.upper()}
title: ""
comments: true
tags: [{tag}]
categories: [{tag}]
date: {date_str} {time_str}
---"""
    
    # Write to file
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(yaml_content)
    
    print(f"Created: {filename}")

if __name__ == "__main__":
    valid_tags = ['lcs', 'absw', 'lnb', 'simb']
    
    while True:
        tag = input("Enter tag (lcs, absw, lnb, simb): ").lower().strip()
        if tag in valid_tags:
            break
        print(f"Error: Tag must be one of {valid_tags}")
    
    while True:
        chapter_num = input("Enter chapter number: ").strip()
        if chapter_num:  # Check if it's not empty
            break
        print("Error: Chapter number cannot be empty")
    
    generate_markdown(tag, chapter_num)