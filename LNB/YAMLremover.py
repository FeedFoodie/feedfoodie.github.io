import os
import re

def remove_yaml_from_files(directory="chapters"):
    """
    Removes the YAML front matter block from all .md files in a specified
    directory. The front matter is defined as any text enclosed by '---' at
    the beginning of the file.

    Args:
        directory (str): The path to the directory containing the markdown files.
                         Defaults to "chapters".
    """
    # Check if the target directory exists
    if not os.path.isdir(directory):
        print(f"Error: Directory '{directory}' not found.")
        print("Please place this script in the same folder that contains the 'chapters' directory.")
        return

    print(f"Scanning for .md files in '{directory}'...")
    processed_count = 0
    skipped_count = 0

    # Loop through all files in the directory
    for filename in os.listdir(directory):
        if filename.endswith(".md") or filename.endswith(".markdown"):
            file_path = os.path.join(directory, filename)
            
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                # Regex to find a YAML front matter block at the very start of the file.
                # The re.DOTALL flag allows '.' to match newline characters.
                # It looks for '---', captures everything until the next '---',
                # and ensures it's at the beginning of the string with '^'.
                yaml_pattern = re.compile(r'^\s*---\s*$.*?^\s*---\s*$', re.MULTILINE | re.DOTALL)
                
                # Check if a front matter block exists
                if yaml_pattern.search(content):
                    # Replace the found YAML block with an empty string
                    new_content = yaml_pattern.sub('', content).lstrip()
                    
                    # Write the modified content back to the file
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    print(f"  - Removed YAML from: {filename}")
                    processed_count += 1
                else:
                    # If no YAML block is found, do nothing
                    print(f"  - Skipping: {filename} (No YAML front matter found)")
                    skipped_count += 1

            except Exception as e:
                print(f"  - Error processing '{filename}': {e}")

    print(f"\nProcessing complete.")
    print(f"  - Files modified: {processed_count}")
    print(f"  - Files skipped: {skipped_count}")

if __name__ == "__main__":
    remove_yaml_from_files()
