import urllib.request
import re
import json

def get_images_bing(query):
    encoded = urllib.parse.quote(query)
    url = f"https://www.bing.com/images/search?q={encoded}&form=HDRSC2&first=1"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Extract murl from bing html (murl is the direct high-res image link)
            matches = re.findall(r'murl&quot;:&quot;(https?://[^&]+)&quot;', html)
            print(f"Query: {query}, Found {len(matches)} direct images")
            return matches[:5]
    except Exception as e:
        print(f"Error for {query}: {e}")
        return []

images = get_images_bing("GORUCK GR1 21L backpack product")
for i, img in enumerate(images):
    print(f"  {i+1}: {img}")
