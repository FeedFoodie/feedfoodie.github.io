# /scripts/submit_urls.py

import os
import sys
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# --- Configuration ---
# These will be read from environment variables in the GitHub Action
INDEXNOW_KEY = os.environ.get('INDEXNOW_API_KEY')
GOOGLE_SA_KEY_JSON = os.environ.get('GOOGLE_SA_KEY_JSON')
SITE_URL = "https://northbladetl.com" # <-- IMPORTANT: REPLACE with your actual GitHub Pages URL

# --- IndexNow (Bing, Yandex, etc.) ---
def submit_to_indexnow(urls_to_submit):
    """Submits a list of URLs to the IndexNow API."""
    if not INDEXNOW_KEY:
        print("🟡 IndexNow API key not found. Skipping.")
        return

    print("\n-- Submitting to IndexNow --")
    
    headers = {'Content-Type': 'application/json'}
    data = {
        'host': SITE_URL.replace("https://", "").replace("http://", ""),
        'key': INDEXNOW_KEY,
        'urlList': urls_to_submit
    }

    try:
        response = requests.post("https://api.indexnow.org/indexnow", json=data, headers=headers)
        if response.status_code == 200:
            print(f"✅ Success! {len(urls_to_submit)} URL(s) submitted to IndexNow.")
        elif response.status_code == 202:
            print(f"✅ Accepted. {len(urls_to_submit)} URL(s) sent to IndexNow for processing.")
        else:
            print(f"❌ IndexNow Error! Status: {response.status_code}, Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ An error occurred with IndexNow request: {e}")

# --- Google Indexing API ---
def submit_to_google(urls_to_submit):
    """Submits a list of URLs to the Google Indexing API."""
    if not GOOGLE_SA_KEY_JSON:
        print("🟡 Google Service Account JSON not found. Skipping.")
        return

    print("\n-- Submitting to Google --")

    try:
        # Load credentials from the environment variable string
        credentials_dict = os.environ.get('GOOGLE_SA_KEY_JSON')
        if not credentials_dict:
            raise ValueError("GOOGLE_SA_KEY_JSON environment variable not set.")
        
        # The service account info is passed as a string, so we load it directly
        credentials = service_account.Credentials.from_service_account_info(
            eval(credentials_dict), # Using eval is safe here as we control the input via GitHub secrets
            scopes=['https://www.googleapis.com/auth/indexing']
        )
        service = build('indexing', 'v3', credentials=credentials)
    except Exception as e:
        print(f"❌ Failed to authenticate with Google: {e}")
        return

    for url in urls_to_submit:
        try:
            request_body = {'url': url, 'type': 'URL_UPDATED'}
            response = service.urlNotifications().publish(body=request_body).execute()
            print(f"  ✅ Submitted '{url}'. Response: {response.get('urlNotificationMetadata', {}).get('latestUpdate', {})}")
        except HttpError as e:
            print(f"  ❌ Failed to submit '{url}'. Reason: {e.reason}")
        except Exception as e:
            print(f"  ❌ An unexpected error occurred for '{url}': {e}")


# --- Main Execution ---
if __name__ == "__main__":
    # The script expects URLs to be passed as command-line arguments
    if len(sys.argv) < 2:
        print("Usage: python submit_urls.py <url1> <url2> ...")
        sys.exit(1)

    all_urls = sys.argv[1:]
    print(f"Found {len(all_urls)} URL(s) to submit.")

    submit_to_indexnow(all_urls)
    submit_to_google(all_urls)

    print("\n🚀 All submissions complete.")
