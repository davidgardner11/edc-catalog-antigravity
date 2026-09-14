import urllib.request
import urllib.parse
import json
import os
import re
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
DATA_FILE = os.path.join(PROJECT_DIR, 'src', 'data', 'backpacks.json')
PUBLIC_IMAGES_DIR = os.path.join(PROJECT_DIR, 'public', 'images', 'backpacks')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9'
}

def search_bing_images(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            matches = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            valid = [m for m in matches if not m.endswith('.svg') and not 'icon' in m.lower() and not 'logo' in m.lower()]
            return valid
    except Exception as e:
        print(f"  [Search Warning] Error querying '{query}': {e}")
        return []

def download_image(url, target_path):
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            content_type = resp.headers.get('Content-Type', '').lower()
            if 'text/html' in content_type:
                return False
            data = resp.read()
            if len(data) < 5000: # Ignore tiny thumbnail artifacts or error responses
                return False
            with open(target_path, 'wb') as f:
                f.write(data)
            return True
    except Exception as e:
        return False

def process_catalog():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        backpacks = json.load(f)

    print(f"\n========================================================")
    print(f"DOWNLOADING REAL PRODUCT PHOTOGRAPHY FOR {len(backpacks)} EDC BACKPACKS")
    print(f"========================================================\n")

    for idx, pack in enumerate(backpacks):
        pack_id = pack['id']
        brand = pack['brand']
        name = pack['name']
        pack_dir = os.path.join(PUBLIC_IMAGES_DIR, pack_id)
        os.makedirs(pack_dir, exist_ok=True)

        print(f"[{idx+1}/{len(backpacks)}] Fetching real photos for {brand} {name}...")

        queries = [
            f"{brand} {name} everyday backpack product white background",
            f"{brand} {name} backpack review pack hacker carryology",
            f"{brand} {name} backpack exterior angle",
            f"{brand} {name} backpack harness straps back panel",
            f"{brand} {name} backpack interior organization laptop",
            f"{brand} {name} backpack in the wild everyday carry"
        ]

        candidate_urls = []
        for q in queries:
            results = search_bing_images(q)
            for r in results:
                if r not in candidate_urls:
                    candidate_urls.append(r)
            if len(candidate_urls) >= 15:
                break
            time.sleep(0.3)

        downloaded_images = []
        img_num = 1

        for candidate_url in candidate_urls:
            if img_num > 5:
                break

            target_filename = f"{img_num}.jpg"
            target_path = os.path.join(pack_dir, target_filename)

            success = download_image(candidate_url, target_path)
            if success:
                file_size_kb = os.path.getsize(target_path) / 1024
                print(f"  ✓ Image {img_num}/5 downloaded ({file_size_kb:.1f} KB) from: {candidate_url[:60]}...")
                downloaded_images.append(f"/images/backpacks/{pack_id}/{target_filename}")
                img_num += 1
            time.sleep(0.2)

        # If at least 1 image was downloaded, update the pack images list
        if downloaded_images:
            pack['images'] = downloaded_images
            print(f"  --> Total {len(downloaded_images)} real photos saved for {pack_id}.\n")
        else:
            print(f"  --> Warning: No new photos downloaded for {pack_id}, retaining existing paths.\n")

    # Update backpacks.json with new real photo paths
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(backpacks, f, indent=2)

    print("========================================================")
    print("ALL REAL BACKPACK PHOTOGRAPHY SUCCESSFULLY DOWNLOADED & SAVED!")
    print("========================================================\n")

if __name__ == '__main__':
    process_catalog()
