import base64
import sys
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Hash import HMAC, SHA256

WATERMARK_KEY = 'foodie-catches-thieves'

def base64url_to_bytes(s):
    s2 = s.replace('-', '+').replace('_', '/')
    padding = (-len(s2)) % 4
    s2 += '=' * padding
    return base64.b64decode(s2)

def decrypt_identifier(identifier):
    try:
        # Split the identifier into encrypted part and signature
        parts = identifier.split('.')
        if len(parts) != 2:
            raise ValueError("Invalid identifier format")
        
        encrypted_b64url, signature_b64url = parts
        
        # Convert from base64url to bytes
        encrypted_data = base64url_to_bytes(encrypted_b64url)
        signature = base64url_to_bytes(signature_b64url)
        
        # Derive AES key using PBKDF2 (same as JavaScript)
        salt = b'watermark-salt'
        key = PBKDF2(WATERMARK_KEY.encode('utf-8'), salt, 32, count=100000, hmac_hash_module=SHA256)
        
        # Create fixed IV (same as JavaScript)
        iv = (WATERMARK_KEY.encode('utf-8') + b'\0' * 16)[:16]  # Exactly 16 bytes
        
        # Decrypt using AES-CBC
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted = cipher.decrypt(encrypted_data)
        
        # Remove PKCS7 padding
        padding_length = decrypted[-1]
        if padding_length > 16 or padding_length < 1:
            raise ValueError("Invalid padding")
        ip_bytes = decrypted[:-padding_length]
        
        ip_address = ip_bytes.decode('utf-8')
        
        # Verify HMAC signature against the original IP string (not bytes)
        hmac_key = (WATERMARK_KEY + '-hmac').encode('utf-8')
        hmac_obj = HMAC.new(hmac_key, digestmod=SHA256)
        hmac_obj.update(ip_address.encode('utf-8'))  # Sign the string, not bytes
        
        try:
            hmac_obj.verify(signature)
            return ip_address
        except ValueError:
            # Try alternative: maybe the JavaScript is using a different approach
            # Let's also try with PBKDF2-derived HMAC key
            hmac_key_derived = PBKDF2((WATERMARK_KEY + '-hmac').encode('utf-8'), salt, 32, count=100000, hmac_hash_module=SHA256)
            hmac_obj2 = HMAC.new(hmac_key_derived, digestmod=SHA256)
            hmac_obj2.update(ip_address.encode('utf-8'))
            hmac_obj2.verify(signature)
            return ip_address
            
    except Exception as e:
        raise Exception(f"Decryption failed: {str(e)}")

def main():
    ident = input("Enter the identifier to decode: ").strip()
    try:
        ip = decrypt_identifier(ident)
        print("Decoded IP ->", ip)
    except Exception as e:
        print("Failed to decrypt identifier:", e)

if __name__ == "__main__":
    main()
    if sys.stdin.isatty():
        input("\nPress Enter to close the window...")