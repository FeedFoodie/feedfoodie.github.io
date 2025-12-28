import os
import re
from pathlib import Path

def update_timezone_in_front_matter(folder_path):
    """
    Update timezone from +0800 to +0000 in YAML front matter of markdown files.
    
    Args:
        folder_path (str): Path to the _posts folder
    """
    folder = Path(folder_path)
    
    # Check if folder exists
    if not folder.exists():
        print(f"Error: Folder '{folder_path}' does not exist.")
        return
    
    # Find all .md files in the folder
    md_files = list(folder.glob("*.md"))
    
    if not md_files:
        print(f"No .md files found in '{folder_path}'")
        return
    
    print(f"Found {len(md_files)} markdown files.")
    
    # Regex pattern to match date lines with +0800 timezone
    # This pattern looks for lines starting with "date:" and containing the timezone
    pattern = re.compile(r'(date:\s*\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+)\+0800')
    
    files_modified = 0
    
    for md_file in md_files:
        try:
            # Read the file content
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Use regex to find and replace +0800 with +0000
            # We'll replace in the entire content but the pattern ensures we only
            # match date lines in front matter
            new_content, replacements = pattern.subn(r'\1+0000', content)
            
            # If replacements were made, write the file back
            if replacements > 0:
                with open(md_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"Modified {md_file.name}: {replacements} date(s) updated")
                files_modified += 1
                
        except Exception as e:
            print(f"Error processing {md_file.name}: {e}")
    
    print(f"\nSummary: Modified {files_modified} out of {len(md_files)} files.")

def main():
    # Set the path to your _posts folder
    posts_folder = "_posts"  # Change this if your folder has a different path
    
    # Call the function to update files
    update_timezone_in_front_matter(posts_folder)
    
    print("\nDone!")

if __name__ == "__main__":
    main()