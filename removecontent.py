import os

def clean_markdown_files(directory):
    # Check if the directory exists
    if not os.path.isdir(directory):
        print(f"Error: Directory '{directory}' not found.")
        # Create the directory if it doesn't exist
        os.makedirs(directory)
        print(f"Created directory '{directory}'. Please add your markdown files to it and run the script again.")
        return

    # Iterate over all files in the given directory
    for filename in os.listdir(directory):
        # Check if the file is a Markdown file
        if filename.endswith(".md"):
            file_path = os.path.join(directory, filename)

            try:
                with open(file_path, 'r', encoding='utf-8-sig') as f:
                    lines = f.readlines()

                # Check for the starting '---' on the first line
                if not lines or lines[0].strip() != '---':
                    print(f"Skipped '{filename}': No front matter found.")
                    continue

                front_matter_lines = []
                in_front_matter = False
                front_matter_complete = False

                # Find the front matter block
                for i, line in enumerate(lines):
                    stripped_line = line.strip()
                    if i == 0 and stripped_line == '---':
                        in_front_matter = True
                        front_matter_lines.append(line)
                        continue
                    
                    if in_front_matter:
                        front_matter_lines.append(line)
                        if stripped_line == '---':
                            front_matter_complete = True
                            break # End of front matter

                # If a complete front matter block was found, write it back
                if front_matter_complete:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.writelines(front_matter_lines)
                    print(f"Processed '{filename}': Content deleted, front matter preserved.")
                else:
                    print(f"Skipped '{filename}': Malformed or no front matter found.")

            except Exception as e:
                print(f"Error processing '{filename}': {e}")

if __name__ == "__main__":
    # Specify the directory to process
    temp_directory = "temp"
    clean_markdown_files(temp_directory)
