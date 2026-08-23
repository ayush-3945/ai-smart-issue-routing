import urllib.request
import re

url = "https://en.wikipedia.org/wiki/Coal_mining"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

# Find image urls
images = re.findall(r'src="(//upload\.wikimedia\.org/wikipedia/commons/thumb/[^"]+\.jpg/[^"]+)"', html)
# Filter for larger images or just use the thumbs and replace the width parameter
real_images = []
for img in images:
    if "px-" in img:
        img = img.split("?")[0] # Strip the query string
        large_img = re.sub(r'/\d+px-', '/800px-', img)
        real_images.append("https:" + large_img)

# We need 4 images
filenames = ['jharia.jpg', 'underground.jpg', 'processing.jpg', 'night_shift.jpg']

for i in range(min(4, len(real_images))):
    print(f"Downloading {real_images[i]} to {filenames[i]}")
    req_img = urllib.request.Request(real_images[i], headers={'User-Agent': 'Mozilla/5.0'})
    try:
        img_data = urllib.request.urlopen(req_img).read()
        with open(f"client/public/mines/{filenames[i]}", "wb") as f:
            f.write(img_data)
        print("Success")
    except Exception as e:
        print("Failed:", e)

print("Done downloading real images!")
