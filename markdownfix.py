import os

def remove_noindex_from_jekyll_posts(folder_path):
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

                in_front_matter = False
                front_matter_start_line = -1
                front_matter_end_line = -1
                noindex_removed = False

                for i, line in enumerate(lines):
                    if line.strip() == '---':
                        if not in_front_matter:
                            in_front_matter = True
                            front_matter_start_line = i
                        else:
                            in_front_matter = False
                            front_matter_end_line = i
                            break
                    
                    if in_front_matter and line.strip().startswith('noindex:'):
                        noindex_removed = True
                        continue

                if front_matter_start_line != -1 and front_matter_end_line != -1:
                    final_content_lines = lines[:front_matter_start_line + 1] 
                    
                    for i in range(front_matter_start_line + 1, front_matter_end_line):
                        if not lines[i].strip().startswith('noindex:'):
                            final_content_lines.append(lines[i])
                    
                    final_content_lines.extend(lines[front_matter_end_line:])

                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.writelines(final_content_lines)
                    
                    if noindex_removed:
                        print(f"Removed 'noindex' from '{filename}'.")
                    else:
                        print(f"No 'noindex' found in '{filename}'.")

                else:
                    print(f"Skipped '{filename}': No valid YAML front matter found.")

            except Exception as e:
                print(f"Error processing '{filename}': {e}")

posts_folder_path = r"C:\Users\rebec\Documents\GitHub\feedfoodie.github.io\_drafts"

remove_noindex_from_jekyll_posts(posts_folder_path)
