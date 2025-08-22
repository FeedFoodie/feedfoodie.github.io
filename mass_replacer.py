import os
import re

# List of all directories you want to process
directories_to_process = [
    #r'C:/Users/rebec/Documents/GitHub/feedfoodie.github.io/ABSW/chapters',
    #r'C:/Users/rebec/Documents/GitHub/feedfoodie.github.io/SIMB/chapters',
    #r'C:/Users/rebec/Documents/GitHub/feedfoodie.github.io/LNB/chapters',
    #r'C:/Users/rebec/Documents/GitHub/feedfoodie.github.io/WLRG/chapters',
    r'C:/Users/rebec/Documents/GitHub/feedfoodie.github.io/_posts/'
]

# A dictionary for all the static text replacements
replacements = {
    "“": "\"",
    "”": "\"",
    "’": "'",
    "‘": "'",
    "…": "...",
    "Otherworlder": "otherworlder",
    "iron skin and strong bones": "Iron Skin Strong Bones",
    "inner arts": "inner qi",
    "inner qi technique": "inner arts technique",
    ". goblin": ". Goblin",
    ". orc": ". Orc"
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
                    # Read the file content
                    with open(entry.path, "r", encoding="utf-8") as file:
                        text = file.read()

                    # Conditionally remove the 'aggAnnoy' pattern if "ABSW" is not in the filename
                    #if "ABSW" not in entry.name:
                        text = re.sub(r'SuandFriends.*?\n\n', '', text, flags=re.DOTALL)

                    # Apply all other static replacements from the dictionary
                    for old, new in replacements.items():
                        text = text.replace(old, new)

                    # Write the modified content back to the same file
                    with open(entry.path, 'w', encoding='utf8') as file:
                        file.write(text)
                    
                    print(f"  ✓ Processed: {entry.name}")

                except Exception as e:
                    print(f"  ✗ Could not process file {entry.name}: {e}")

    except FileNotFoundError:
        print(f"  ✗ Error: Directory not found at '{directory}'")
    except Exception as e:
        print(f"  ✗ An unexpected error occurred while processing {directory}: {e}")

print("\n--- All processing complete. ---")