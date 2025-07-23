import os

def add_noindex_to_jekyll_posts(folder_path):
    """
    Adds 'noindex: true' to the YAML front matter of all .md files
    in the specified folder, or updates it if 'noindex: false' exists.

    Args:
        folder_path (str): The path to the _posts folder.
    """
    if not os.path.isdir(folder_path):
        print(f"Error: Folder '{folder_path}' not found.")
        return

    print(f"Scanning for .md files in: {folder_path}")

    for filename in os.listdir(folder_path):
        if filename.endswith(".md"):
            filepath = os.path.join(folder_path, filename)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    lines = f.readlines()

                modified_lines = []
                in_front_matter = False
                front_matter_start_line = -1
                front_matter_end_line = -1
                noindex_found = False
                noindex_line_index = -1

                for i, line in enumerate(lines):
                    if line.strip() == '---':
                        if not in_front_matter:
                            in_front_matter = True
                            front_matter_start_line = i
                        else:
                            in_front_matter = False
                            front_matter_end_line = i
                            # Break after finding the closing '---'
                            break 
                    
                    if in_front_matter and line.strip().startswith('noindex:'):
                        noindex_found = True
                        noindex_line_index = i
                    
                # Reconstruct lines based on findings
                if front_matter_start_line != -1 and front_matter_end_line != -1:
                    # YAML front matter found
                    
                    # Copy lines before front matter
                    modified_lines.extend(lines[:front_matter_start_line + 1])

                    # Copy front matter lines, applying changes
                    for i in range(front_matter_start_line + 1, front_matter_end_line):
                        line = lines[i]
                        if i == noindex_line_index:
                            # Replace existing noindex line
                            modified_lines.append("noindex: true\n")
                        else:
                            modified_lines.append(line)
                    
                    if not noindex_found:
                        # Add noindex: true if not found anywhere in front matter
                        modified_lines.append("noindex: true\n")
                    
                    # Add closing '---' and rest of the content
                    modified_lines.extend(lines[front_matter_end_line:])
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.writelines(modified_lines)
                    
                    if noindex_found:
                        print(f"Updated '{filename}': 'noindex: true' value adjusted.")
                    else:
                        print(f"Added 'noindex: true' to '{filename}'.")

                else:
                    print(f"Skipped '{filename}': No valid YAML front matter found.")

            except Exception as e:
                print(f"Error processing '{filename}': {e}")

# Specify the path to your _posts folder
posts_folder_path = r"C:\Users\rebec\Documents\GitHub\feedfoodie.github.io\_posts"

add_noindex_to_jekyll_posts(posts_folder_path)