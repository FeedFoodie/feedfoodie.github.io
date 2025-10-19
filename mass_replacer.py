import os
import re
import time
from datetime import datetime, timedelta

# List of all directories you want to process
directories_to_process = [
    r'C:/Users/rebec/Documents/GitHub/feedfoodie.github.io/ABSW/chapters',
    r'C:/Users/rebec/Documents/GitHub/feedfoodie.github.io/SIMB/chapters',
    r'C:/Users/rebec/Documents/GitHub/feedfoodie.github.io/LNB/chapters',
    #r'C:/Users/rebec/Documents/GitHub/feedfoodie.github.io/WLRG/chapters',
    r'C:/Users/rebec/Documents/GitHub/feedfoodie.github.io/RUH/chapters',
    r'C:/Users/rebec/Documents/GitHub/feedfoodie.github.io/HERO/chapters',
    #r'C:/Users/rebec/Documents/GitHub/feedfoodie.github.io/_posts/'
]

# Calculate the cutoff time (1 month ago)
one_month_ago = datetime.now() - timedelta(days=1)
# Convert to timestamp for comparison with file modification time
cutoff_timestamp = time.mktime(one_month_ago.timetuple())

# A dictionary for all the static text replacements
replacements = {
    "“": "\"",
    "”": "\"",
    "’": "'",
    "‘": "'",
    "…": "...",
}

# Loop through each directory in the list
for directory in directories_to_process:
    print(f"\n--- Processing directory: {directory} ---")
    try:
        # Use os.scandir() for a more efficient way to scan directories
        for entry in os.scandir(directory):
            # Process only files, ignore subdirectories
            if entry.is_file():
                try:
                    # Get the file's last modification time
                    file_mod_time = entry.stat().st_mtime
                    
                    # Read the file content
                    with open(entry.path, "r", encoding="utf-8") as file:
                        text = file.read()

                    original_text = text
                    
                    # Remove SuandFriends lines only if file was modified more than 1 month ago
                    if file_mod_time < cutoff_timestamp:
                        text = re.sub(r'SuandFriends.*?\n\n', '', text, flags=re.DOTALL)
                        suandfriends_removed = (text != original_text)
                    else:
                        suandfriends_removed = False

                    # Apply all other static replacements from the dictionary (always)
                    for old, new in replacements.items():
                        text = text.replace(old, new)

                    # Write the modified content back to the same file only if changes were made
                    if text != original_text:
                        with open(entry.path, 'w', encoding='utf8') as file:
                            file.write(text)
                        
                        status = "✓ Processed"
                        if suandfriends_removed:
                            status += " (SuandFriends removed)"
                        print(f"  {status}: {entry.name}")
                    else:
                        print(f"  - No changes needed: {entry.name}")

                except Exception as e:
                    print(f"  ✗ Could not process file {entry.name}: {e}")

    except FileNotFoundError:
        print(f"  ✗ Error: Directory not found at '{directory}'")
    except Exception as e:
        print(f"  ✗ An unexpected error occurred while processing {directory}: {e}")

print(f"\n--- All processing complete. Cutoff date: {one_month_ago.strftime('%Y-%m-%d')} ---")