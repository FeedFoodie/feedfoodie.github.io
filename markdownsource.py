import os
import re

def add_markdown_source_to_posts(directory="temp"):
    """
    Adds a 'markdown_source' field to the YAML front matter of all .md files
    in a specified directory.

    Args:
        directory (str): The path to the directory containing the markdown posts.
                         Defaults to "_posts".
    """
    if not os.path.isdir(directory):
        print(f"Error: Directory '{directory}' not found.")
        print("Please run this script from the root of your Jekyll project.")
        return

    print(f"Scanning directory: '{directory}'...")
    processed_count = 0

    # Iterate over every file in the specified directory
    for filename in os.listdir(directory):
        if filename.endswith(".md") or filename.endswith(".markdown"):
            file_path = os.path.join(directory, filename)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Use regex to find the front matter block (between --- and ---)
                # The re.DOTALL flag allows '.' to match newlines
                match = re.search(r'^(---(?P<frontmatter>.*?)---)', content, re.DOTALL)

                if not match:
                    print(f"  - Skipping '{filename}': No front matter found.")
                    continue

                frontmatter_text = match.group('frontmatter')

                # Check if the markdown_source key already exists
                if 'markdown_source:' in frontmatter_text:
                    print(f"  - Skipping '{filename}': 'markdown_source' already exists.")
                    continue

                # Prepare the new line to be added
                new_line = f"markdown_source: {filename}\n"
                
                # Find the end of the front matter to insert the new line
                # We split the content to insert the line just before the closing '---'
                parts = content.split('---', 2)
                
                # Reconstruct the content with the new line added
                # parts[0] is empty
                # parts[1] is the front matter content
                # parts[2] is the rest of the file
                new_content = f"---{parts[1]}{new_line}---{parts[2]}"

                # Write the updated content back to the file
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"  - Updated '{filename}'")
                processed_count += 1

            except Exception as e:
                print(f"  - Error processing '{filename}': {e}")

    print(f"\nProcessing complete. Updated {processed_count} files.")

if __name__ == "__main__":
    add_markdown_source_to_posts()
