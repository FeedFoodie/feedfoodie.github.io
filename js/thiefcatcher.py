import base64
import binascii
import hmac
import hashlib
import sys

# must match the worker's key exactly
WATERMARK_KEY = "foodie-catches-thieves"

def base64url_to_b64(s):
    # transform base64url (no padding) back to standard base64 with padding
    s2 = s.replace('-', '+').replace('_', '/')
    padding = (-len(s2)) % 4
    s2 += '=' * padding
    return s2

def decode_b64_utf8(s):
    try:
        raw = base64.b64decode(s)
        return raw.decode('utf-8')
    except Exception:
        return None

def verify_hmac(ip_str, sig_b64url, key=WATERMARK_KEY):
    # recompute HMAC-SHA256 over the plain IP string
    key_bytes = key.encode('utf-8')
    hm = hmac.new(key_bytes, ip_str.encode('utf-8'), hashlib.sha256).digest()
    # encode to base64url without padding to compare
    hm_b64 = base64.b64encode(hm).decode('ascii')
    hm_b64url = hm_b64.replace('+', '-').replace('/', '_').rstrip('=')
    return hm_b64url == sig_b64url

def main():
    ident = input("Enter the identifier to decode: ").strip()
    if '.' not in ident:
        print("Identifier must be in format: <base64_ip>.<base64url_hmac>")
        return

    b64ip_part, sig_part = ident.split('.', 1)

    # decode the IP
    ip = None
    try:
        ip_bytes = base64.b64decode(b64ip_part)
        ip = ip_bytes.decode('utf-8')
    except Exception:
        # try base64url conversion if needed
        try:
            b64 = base64url_to_b64(b64ip_part)
            ip = base64.b64decode(b64).decode('utf-8')
        except Exception:
            ip = None

    if ip is None:
        print("Failed to decode IP part.")
        return

    # verify signature
    valid = verify_hmac(ip, sig_part)
    if valid:
        print("Signature: VALID")
        print("decoded IP ->", ip)
    else:
        print("Signature: INVALID! The identifier was not signed with the expected key or was tampered.")
        print("Decoded IP (unchecked) ->", ip)

if __name__ == "__main__":
    main()
    if sys.stdin.isatty():
        input("\nPress Enter to close the window...")