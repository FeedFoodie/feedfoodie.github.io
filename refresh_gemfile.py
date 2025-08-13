import os
import subprocess
import sys
import time

def run_command(command, step_name):
    print(f"Running: {step_name}...")
    try:
        # We use shell=True on Windows to make sure 'bundle' can be found easily.
        process = subprocess.run(
            command,
            shell=True,
            check=True,
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        # The command was successful, no need to print its full output.
        print("Done.")
        return True
    except subprocess.CalledProcessError as e:
        # If the command fails, print its error output
        print("!!! ERROR !!!")
        print(f"Step '{step_name}' failed with exit code {e.returncode}.")
        if e.stdout:
            print("\n--- Output (stdout) ---")
            print(e.stdout)
        if e.stderr:
            print("\n--- Error Output (stderr) ---")
            print(e.stderr)
        # Pause on error so the user can see what went wrong.
        os.system("pause")
        return False
    except FileNotFoundError:
        print(f"!!! ERROR !!!: Command '{command.split()[0]}' not found. Is Bundler installed and in your system's PATH?")
        os.system("pause")
        return False

def main():
    """Main script execution."""
    print("Refreshing Jekyll dependencies...")

    # Step 1: Delete Gemfile.lock
    print("Deleting Gemfile.lock...")
    try:
        if os.path.exists("Gemfile.lock"):
            os.remove("Gemfile.lock")
        else:
            print("     (not found, skipping)")
    except OSError as e:
        print(f"!!! ERROR !!!: Could not delete Gemfile.lock: {e}")
        sys.exit(1)
    print("Done.")


    # Step 2: Run bundle install
    if not run_command("bundle install", "bundle install"):
        sys.exit(1)

    # Step 3: Add Linux platform
    if not run_command("bundle lock --add-platform x86_64-linux", "bundle lock --add-platform"):
        sys.exit(1)

    print("\nSUCCESS! Gemfile.lock is now ready for commit.")


if __name__ == "__main__":
    main()