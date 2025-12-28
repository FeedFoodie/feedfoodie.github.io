import os
import re
from datetime import datetime

POSTS_DIR = "_posts"

FM_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)
DATE_RE = re.compile(r"^(\d{4}-\d{2}-\d{2})-")
FM_DATE_RE = re.compile(r"^date:\s*(.+)$", re.M)
FM_LAYOUT_RE = re.compile(r"^layout:\s*(.+)$", re.M)
FM_MD_SOURCE_RE = re.compile(r"^markdown_source:.*$\n?", re.M)

changed = []

def extract_filename_date(filename):
    m = DATE_RE.match(filename)
    return m.group(1) if m else None

def normalize_date(date_str, fallback_date):
    parts = date_str.split()
    tz = parts[-1] if len(parts) >= 3 and parts[-1].startswith(("+", "-")) else "+0800"
    time_part = parts[1] if len(parts) >= 2 else "00:00:01"
    return f"{fallback_date} {time_part} {tz}"

def remove_markdown_source(front_matter):
    return FM_MD_SOURCE_RE.sub("", front_matter)

for name in os.listdir(POSTS_DIR):
    if not name.endswith(".md"):
        continue

    filepath = os.path.join(POSTS_DIR, name)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    fm_match = FM_RE.match(content)
    if not fm_match:
        continue

    front_matter = fm_match.group(1)
    rest = content[fm_match.end():]

    file_date = extract_filename_date(name)
    if not file_date:
        continue

    updated = False

    date_match = FM_DATE_RE.search(front_matter)
    if date_match:
        existing_date = date_match.group(1)
        normalized = normalize_date(existing_date, file_date)
        if not existing_date.startswith(file_date):
            front_matter = FM_DATE_RE.sub(f"date: {normalized}", front_matter)
            updated = True
    else:
        front_matter += f"\ndate: {file_date} 00:00:01 +0800"
        updated = True

    layout_match = FM_LAYOUT_RE.search(front_matter)
    if layout_match and layout_match.group(1).strip() != "post":
        front_matter = FM_LAYOUT_RE.sub("layout: post", front_matter)
        updated = True

    cleaned = remove_markdown_source(front_matter)
    if cleaned != front_matter:
        front_matter = cleaned
        updated = True

    if updated:
        new_content = f"---\n{front_matter.strip()}\n---\n{rest}"
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        changed.append(name)

for f in changed:
    print(f"CHANGED: {f}")
