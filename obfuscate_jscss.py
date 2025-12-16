import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

class AssetMinifier:
    def __init__(self):
        self.project_root = Path.cwd()
        self.js_dir = self.project_root / "js"
        self.css_dir = self.project_root / "css"
        self.backup_dir = self.project_root / "backup"
        self.js_backup_dir = self.backup_dir / "js"
        self.css_backup_dir = self.backup_dir / "css"

    def check_dependencies(self):
        """Check if required tools are installed."""
        print("\n🔍 CHECKING DEPENDENCIES")
        print("-" * 40)

        required_tools = ["node", "npm"]
        for tool in required_tools:
            try:
                subprocess.run([tool, "--version"], capture_output=True, check=True, shell=True)
                print(f"✅ {tool} is installed")
            except (subprocess.CalledProcessError, FileNotFoundError):
                print(f"❌ {tool} is NOT installed")
                print("Please install Node.js from: https://nodejs.org/")
                return False

        print("\n📦 CHECKING NPM PACKAGES")
        print("-" * 40)
        packages = ["terser", "csso-cli"]
        for package in packages:
            try:
                # Check if installed globally
                result = subprocess.run(["npm", "list", "-g", package], capture_output=True, text=True, shell=True)
                if package not in result.stdout:
                    print(f"Installing {package}...")
                    subprocess.run(["npm", "install", "-g", package], check=True, shell=True)
                print(f"✅ {package} is available")
            except subprocess.CalledProcessError:
                return False
        return True

    def create_backup(self):
        """Create backup of original files, overwriting previous backup."""
        print("\n📂 CREATING BACKUPS")
        print("-" * 40)

        self.js_backup_dir.mkdir(parents=True, exist_ok=True)
        self.css_backup_dir.mkdir(parents=True, exist_ok=True)

        # Clear existing backups
        for f in self.js_backup_dir.glob("*"): f.unlink(missing_ok=True)
        for f in self.css_backup_dir.glob("*"): f.unlink(missing_ok=True)

        # Backup JS
        js_files = list(self.js_dir.glob("*.js"))
        if js_files:
            print(f"\n📦 Backing up JavaScript:")
            for js_file in js_files:
                if not js_file.name.endswith(".min.js"):
                    backup_path = self.js_backup_dir / js_file.name
                    shutil.copy2(js_file, backup_path)
                    print(f"   ✅ {js_file.name}")
        else:
            print("ℹ️  No JavaScript files found in /js/")

        # Backup CSS
        css_files = list(self.css_dir.glob("*.css"))
        if css_files:
            print(f"\n🎨 Backing up CSS:")
            for css_file in css_files:
                if not css_file.name.endswith(".min.css"):
                    backup_path = self.css_backup_dir / css_file.name
                    shutil.copy2(css_file, backup_path)
                    print(f"   ✅ {css_file.name}")
        else:
            print("ℹ️  No CSS files found in /css/")

    def minify_javascript_safely(self):
        """Minify JavaScript files without obfuscating function names."""
        print("\n🔧 MINIFYING JAVASCRIPT (SAFE MODE)")
        print("-" * 40)

        js_files = list(self.js_dir.glob("*.js"))
        processed = 0
        for js_file in js_files:
            if js_file.name.endswith(".min.js") or "backup" in str(js_file):
                print(f"⏭️  Skipping: {js_file.name}")
                continue

            original_size = js_file.stat().st_size
            print(f"🔄 Processing: {js_file.name} ({self._format_bytes(original_size)})")

            try:
                # Using Terser with critical options:
                # --compress: Enables compression
                # --mangle: Shortens local variable names ONLY
                # --keep-fnames: PRESERVES function names - CRITICAL
                # --comments false: Removes comments
                cmd = [
                    'npx', 'terser', str(js_file),
                    '--compress',
                    '--mangle',
                    '--keep-fnames',  # This prevents renaming of function names
                    '--output', str(js_file),
                    '--comments', 'false'
                ]
                subprocess.run(cmd, check=True, capture_output=True, text=True, shell=True)

                new_size = js_file.stat().st_size
                reduction = ((original_size - new_size) / original_size) * 100
                print(f"   ✅ Minified: {self._format_bytes(new_size)} ({reduction:.1f}% reduction)")
                processed += 1

            except subprocess.CalledProcessError as e:
                print(f"   ❌ Error: {e.stderr if e.stderr else e}")
                # Restore from backup
                backup_file = self.js_backup_dir / js_file.name
                if backup_file.exists():
                    shutil.copy2(backup_file, js_file)
                    print(f"   🔄 Restored from backup")

        if processed > 0:
            print(f"\n📊 JavaScript minification complete. Files processed: {processed}")
        else:
            print("ℹ️  No JavaScript files were minified")

    def minify_css(self):
        """Minify CSS files."""
        print("\n🎨 MINIFYING CSS")
        print("-" * 40)

        css_files = list(self.css_dir.glob("*.css"))
        processed = 0
        for css_file in css_files:
            if css_file.name.endswith(".min.css") or "backup" in str(css_file):
                print(f"⏭️  Skipping: {css_file.name}")
                continue

            original_size = css_file.stat().st_size
            print(f"🔄 Processing: {css_file.name} ({self._format_bytes(original_size)})")

            try:
                cmd = ['npx', 'csso', str(css_file), '--output', str(css_file)]
                subprocess.run(cmd, check=True, capture_output=True, text=True, shell=True)

                new_size = css_file.stat().st_size
                reduction = ((original_size - new_size) / original_size) * 100
                print(f"   ✅ Minified: {self._format_bytes(new_size)} ({reduction:.1f}% reduction)")
                processed += 1

            except subprocess.CalledProcessError as e:
                print(f"   ❌ Error: {e.stderr if e.stderr else e}")
                backup_file = self.css_backup_dir / css_file.name
                if backup_file.exists():
                    shutil.copy2(backup_file, css_file)
                    print(f"   🔄 Restored from backup")

        if processed > 0:
            print(f"\n📊 CSS minification complete. Files processed: {processed}")
        else:
            print("ℹ️  No CSS files were minified")

    def _format_bytes(self, bytes):
        """Format bytes to human readable format."""
        for unit in ['B', 'KB', 'MB']:
            if bytes < 1024.0:
                return f"{bytes:.1f} {unit}"
            bytes /= 1024.0
        return f"{bytes:.1f} GB"

    def run(self):
        """Main execution method."""
        print("=" * 60)
        print("📦 ASSET MINIFICATION TOOL (SAFE MODE)")
        print("=" * 60)
        print("This script will:")
        print("1. Backup original JS/CSS files to /backup/")
        print("2. Minify JavaScript (PRESERVING function names)")
        print("3. Minify CSS")
        print("=" * 60)

        if not self.js_dir.exists():
            print(f"\n❌ Directory not found: {self.js_dir}")
            print("   Run this from your project root (where /js/ and /css/ are)")
            return False

        if not self.check_dependencies():
            return False

        self.create_backup()
        self.minify_javascript_safely()
        self.minify_css()

        print("\n" + "=" * 60)
        print("🎉 MINIFICATION COMPLETE!")
        print("=" * 60)
        print("\n⚠️  IMPORTANT: Test your website thoroughly!")
        print("   Check browser console (F12) for any errors.")
        print(f"   Original files are backed up in: {self.backup_dir}")
        print("\n💾 To restore from backup if needed:")
        print(f"   copy backup\\js\\*.js js\\")
        print(f"   copy backup\\css\\*.css css\\")
        return True

def main():
    try:
        minifier = AssetMinifier()
        if minifier.run():
            print("\n✅ Script finished successfully.")
        input("\nPress Enter to exit...")
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        import traceback
        traceback.print_exc()
        input("\nPress Enter to exit...")
        sys.exit(1)

if __name__ == "__main__":
    main()