# tools/generate_icons.py - Kafana Tak! Profesyonel İkon Üretici
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_base_icon(size=512):
    # RGBA Master canvas
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Dış Parlama / Gradient Arka Plan
    bg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)

    # Yuvarlatılmış Kare (Squircle) tabanı
    corner_radius = int(size * 0.22)
    padding = int(size * 0.04)
    box = [padding, padding, size - padding, size - padding]

    # Renk geçişi simülasyonu (Vibrant Party Gradient: Magenta #FF2E93 -> Cyan #00F5D4)
    for y in range(padding, size - padding):
        t = (y - padding) / (size - 2 * padding)
        # Gradient from #FF2E93 (255, 46, 147) to #7928CA (121, 40, 202) to #00F5D4 (0, 245, 212)
        if t < 0.5:
            t2 = t * 2
            r = int(255 * (1 - t2) + 121 * t2)
            g = int(46 * (1 - t2) + 40 * t2)
            b = int(147 * (1 - t2) + 202 * t2)
        else:
            t2 = (t - 0.5) * 2
            r = int(121 * (1 - t2) + 0 * t2)
            g = int(40 * (1 - t2) + 245 * t2)
            b = int(202 * (1 - t2) + 212 * t2)

        bg_draw.line([(padding, y), (size - padding, y)], fill=(r, g, b, 255))

    # Maske ile squircle kes
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(box, corner_radius, fill=255)

    # Arka planı maskele
    squircle = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    squircle.paste(bg, (0, 0), mask)

    # İnce parlak kenarlık ekle
    border_draw = ImageDraw.Draw(squircle)
    border_draw.rounded_rectangle(box, corner_radius, outline=(255, 255, 255, 120), width=int(size * 0.015))

    # 2. Gövde (Alındaki Telefon Çerçevesi Simgesi)
    center_x = size // 2
    center_y = int(size * 0.52)
    phone_w = int(size * 0.56)
    phone_h = int(size * 0.36)
    phone_box = [
        center_x - phone_w // 2,
        center_y - phone_h // 2,
        center_x + phone_w // 2,
        center_y + phone_h // 2
    ]

    # Telefon gövdesi
    phone_radius = int(size * 0.06)
    phone_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(phone_img)
    # Koyu ekran içi
    p_draw.rounded_rectangle(phone_box, phone_radius, fill=(11, 14, 20, 240), outline=(255, 255, 255, 230), width=int(size * 0.018))

    # Telefon içi neon ışıma ve parti yazısı "KT!" (Kafana Tak!)
    screen_box = [
        phone_box[0] + int(size * 0.02),
        phone_box[1] + int(size * 0.02),
        phone_box[2] - int(size * 0.02),
        phone_box[3] - int(size * 0.02)
    ]
    p_draw.rounded_rectangle(screen_box, phone_radius - 4, fill=(18, 24, 38, 255))

    # Ekran içine neon gülümseme ve gözler (eğlenceli parti yüzü)
    eye_r = int(size * 0.032)
    eye_y = center_y - int(size * 0.03)
    p_draw.ellipse([center_x - int(size * 0.12) - eye_r, eye_y - eye_r, center_x - int(size * 0.12) + eye_r, eye_y + eye_r], fill=(0, 245, 212, 255))
    p_draw.ellipse([center_x + int(size * 0.12) - eye_r, eye_y - eye_r, center_x + int(size * 0.12) + eye_r, eye_y + eye_r], fill=(255, 46, 147, 255))

    # Gülümseme yayı (Neon ark)
    smile_box = [center_x - int(size * 0.14), center_y - int(size * 0.04), center_x + int(size * 0.14), center_y + int(size * 0.1)]
    p_draw.arc(smile_box, start=20, end=160, fill=(255, 230, 0, 255), width=int(size * 0.022))

    # 3. Telefonun Üstüne Parlayan Altın Taç 👑
    crown_y = phone_box[1] - int(size * 0.14)
    crown_pts = [
        (center_x - int(size * 0.22), phone_box[1] + int(size * 0.01)),
        (center_x - int(size * 0.20), crown_y + int(size * 0.03)),
        (center_x - int(size * 0.10), crown_y + int(size * 0.09)),
        (center_x, crown_y),
        (center_x + int(size * 0.10), crown_y + int(size * 0.09)),
        (center_x + int(size * 0.20), crown_y + int(size * 0.03)),
        (center_x + int(size * 0.22), phone_box[1] + int(size * 0.01))
    ]
    p_draw.polygon(crown_pts, fill=(255, 215, 0, 255), outline=(255, 255, 255, 220))

    # Taç üzerindeki mücevherler (3 yakut)
    jewel_r = int(size * 0.016)
    p_draw.ellipse([center_x - int(size * 0.20) - jewel_r, crown_y + int(size * 0.03) - jewel_r, center_x - int(size * 0.20) + jewel_r, crown_y + int(size * 0.03) + jewel_r], fill=(255, 46, 147, 255))
    p_draw.ellipse([center_x - jewel_r, crown_y - jewel_r, center_x + jewel_r, crown_y + jewel_r], fill=(0, 245, 212, 255))
    p_draw.ellipse([center_x + int(size * 0.20) - jewel_r, crown_y + int(size * 0.03) - jewel_r, center_x + int(size * 0.20) + jewel_r, crown_y + int(size * 0.03) + jewel_r], fill=(255, 46, 147, 255))

    # 4. Etrafta Konfeti / Işıltı Yıldızları
    sparkles = [
        (int(size * 0.18), int(size * 0.26), (0, 245, 212, 240), 9),
        (int(size * 0.82), int(size * 0.28), (255, 230, 0, 240), 11),
        (int(size * 0.16), int(size * 0.74), (255, 230, 0, 240), 8),
        (int(size * 0.84), int(size * 0.72), (255, 46, 147, 240), 10)
    ]
    for sx, sy, col, rad in sparkles:
        p_draw.ellipse([sx - rad, sy - rad, sx + rad, sy + rad], fill=col)
        p_draw.line([(sx - rad * 2, sy), (sx + rad * 2, sy)], fill=col, width=2)
        p_draw.line([(sx, sy - rad * 2), (sx, sy + rad * 2)], fill=col, width=2)

    # Katmanları birleştir
    final_img = Image.alpha_composite(squircle, phone_img)
    return final_img

def create_round_icon(base_img):
    size = base_img.width
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    padding = int(size * 0.03)
    draw.ellipse([padding, padding, size - padding, size - padding], fill=255)

    round_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    round_img.paste(base_img, (0, 0), mask)
    return round_img

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    assets_dir = os.path.join(root_dir, 'assets')
    res_dir = os.path.join(root_dir, 'android', 'app', 'src', 'main', 'res')

    print("[INFO] Kafana Tak! Master Ikon uretiliyor...")
    master = create_base_icon(512)
    round_master = create_round_icon(master)

    # 1. assets/icon.png kaydet
    os.makedirs(assets_dir, exist_ok=True)
    master.save(os.path.join(assets_dir, 'icon.png'), 'PNG')
    print("  + assets/icon.png kaydedildi (512x512)")

    # 2. Android Mipmap boyutları
    densities = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192
    }

    for folder, dim in densities.items():
        target_dir = os.path.join(res_dir, folder)
        os.makedirs(target_dir, exist_ok=True)

        # Standard launcher icon
        resized_sq = master.resize((dim, dim), Image.Resampling.LANCZOS)
        resized_sq.save(os.path.join(target_dir, 'ic_launcher.png'), 'PNG')

        # Round launcher icon
        resized_rd = round_master.resize((dim, dim), Image.Resampling.LANCZOS)
        resized_rd.save(os.path.join(target_dir, 'ic_launcher_round.png'), 'PNG')

        # Foreground launcher icon
        resized_sq.save(os.path.join(target_dir, 'ic_launcher_foreground.png'), 'PNG')
        print(f"  + {folder} guncellendi ({dim}x{dim})")

    print("[SUCCESS] Tum Android APK ikonlari basariyla guncellendi!")

if __name__ == '__main__':
    main()
