from PIL import Image
import rembg
import os

input_path = r'C:\Users\murat\.gemini\antigravity-ide\brain\419950e5-c21b-471a-b3ec-0914741de332\.user_uploaded\media_1793125256154.jpg'
output_dir = r'c:\Users\murat\OneDrive\Belgeler\New OpenCode Project\guess-up-party\assets'
os.makedirs(output_dir, exist_ok=True)

print("Opening image...")
input_img = Image.open(input_path)
print("Removing background with rembg...")
nobg_img = rembg.remove(input_img)

# Crop to transparent bounding box
bbox = nobg_img.getbbox()
if bbox:
    nobg_img = nobg_img.crop(bbox)

# Rotate 90 degrees clockwise so bottle neck points UP (12 o'clock needle pointer)
# In original, neck is at x=0 (left). Rotating 90 degrees clockwise puts x=0 at y=0 (top)!
vertical_bottle = nobg_img.transpose(Image.ROTATE_270)

# Save high-res PNG and optimized WebP
png_path = os.path.join(output_dir, 'wine_bottle.png')
webp_path = os.path.join(output_dir, 'wine_bottle.webp')

vertical_bottle.save(png_path, 'PNG', optimize=True)
vertical_bottle.save(webp_path, 'WEBP', quality=92)

print(f"Saved: {png_path} ({os.path.getsize(png_path)} bytes)")
print(f"Saved: {webp_path} ({os.path.getsize(webp_path)} bytes)")
print("Dimensions:", vertical_bottle.size)
