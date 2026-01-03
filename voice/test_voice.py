import requests
import sys

def test_server():
    base_url = "http://localhost:8000"
    print(f"Testing Voice Server at {base_url}...")

    try:
        # Check if server is running (by hitting a 404 endpoint or just connecting)
        # We don't have a root / endpoint, but 404 means it's running
        response = requests.get(base_url)
        if response.status_code == 404:
             print("✅ Server is running (connection successful)")
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Is it running?")
        print("Run: python voice/server.py")
        sys.exit(1)

    # Test TTS
    print("\nTesting TTS (Text-to-Speech)...")
    try:
        response = requests.post(f"{base_url}/synthesize", json={
            "text": "Hello, this is a test.",
            "voice": "en-US-AriaNeural"
        })
        if response.status_code == 200:
            print(f"✅ TTS Success! Received {len(response.content)} bytes of audio.")
        else:
            print(f"❌ TTS Failed: {response.text}")
    except Exception as e:
        print(f"❌ TTS Error: {e}")

    # Test STT (Requires a file, skipping or using dummy if possible)
    # We won't create a dummy wav here to keep it simple, checking TTS is usually enough to verify the server is up.
    print("\nTo test STT, use the main application.")

if __name__ == "__main__":
    test_server()
