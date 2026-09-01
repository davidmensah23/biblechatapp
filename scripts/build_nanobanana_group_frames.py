import os
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

os.makedirs('assets/mascots/sequences/group_nano', exist_ok=True)
base_path = r'C:\Users\Dave\.gemini\antigravity\brain\31575e33-80cf-4308-9bf1-a44ad1f3a869\group_anim_f0_smile_1788304633641.jpg'
base_img = Image.open(base_path).convert('RGBA')
w, h = base_img.size

# Frame 0: Base Smile
base_img.convert('RGB').save('assets/mascots/sequences/group_nano/group_f0_smile.png', 'PNG')
print('Frame 0 (Smile) saved')

# Frame 1: Blink & Wink (Draw cute curved closed eyes over the cloud eyes and bread eye)
f1 = base_img.copy()
draw1 = ImageDraw.Draw(f1)
# Center Cloud eye positions approx (center is around x=550, y=470 in 1024x682 space)
# Let's dynamically detect coordinates based on w, h
# Cloud Left Eye: (0.485 * w, 0.47 * h), Cloud Right Eye: (0.595 * w, 0.46 * h)
# Bread Left Eye: (0.248 * w, 0.585 * h), Bread Right Eye: (0.344 * w, 0.58 * h)
# Dewdrop Left Eye: (0.730 * w, 0.605 * h), Dewdrop Right Eye: (0.810 * w, 0.608 * h)

cx1, cy1 = int(0.485 * w), int(0.47 * h)
cx2, cy2 = int(0.595 * w), int(0.46 * h)
bx1, by1 = int(0.248 * w), int(0.585 * h)

# Cover cloud open eyes with smooth cloud skin color and draw closed happy curve ^ _ ^
cloud_skin = (220, 235, 252, 255)
draw1.ellipse([cx1 - 18, cy1 - 18, cx1 + 18, cy1 + 18], fill=cloud_skin)
draw1.ellipse([cx2 - 18, cy2 - 18, cx2 + 18, cy2 + 18], fill=cloud_skin)
draw1.arc([cx1 - 16, cy1 - 14, cx1 + 16, cy1 + 14], start=190, end=350, fill=(24, 24, 27, 255), width=5)
draw1.arc([cx2 - 16, cy2 - 14, cx2 + 16, cy2 + 14], start=190, end=350, fill=(24, 24, 27, 255), width=5)

# Bread left eye winking
bread_skin = (252, 196, 140, 255)
draw1.ellipse([bx1 - 16, by1 - 16, bx1 + 16, by1 + 16], fill=bread_skin)
draw1.arc([bx1 - 15, by1 - 12, bx1 + 15, by1 + 12], start=190, end=350, fill=(24, 24, 27, 255), width=5)

f1.convert('RGB').save('assets/mascots/sequences/group_nano/group_f1_blink.png', 'PNG')
print('Frame 1 (Blink & Wink) saved')


# Frame 2: Surprise / Joy (Open "O" mouths + slight hop up + golden sparkle stars)
f2_base = base_img.copy()
draw2 = ImageDraw.Draw(f2_base)

# Bread mouth -> Open joyful "O"
bmx, bmy = int(0.296 * w), int(0.618 * h)
draw2.ellipse([bmx - 14, bmy - 12, bmx + 14, bmy + 14], fill=(30, 24, 24, 255))
draw2.ellipse([bmx - 8, bmy + 2, bmx + 8, bmy + 12], fill=(235, 87, 87, 255))

# Cloud mouth -> Open joyful "O"
cmx, cmy = int(0.540 * w), int(0.505 * h)
draw2.ellipse([cmx - 14, cmy - 12, cmx + 14, cmy + 14], fill=(30, 24, 24, 255))
draw2.ellipse([cmx - 8, cmy + 2, cmx + 8, cmy + 12], fill=(235, 87, 87, 255))

# Dewdrop mouth -> Open cheerful "O"
dmx, dmy = int(0.770 * w), int(0.635 * h)
draw2.ellipse([dmx - 12, dmy - 10, dmx + 12, dmy + 12], fill=(30, 24, 24, 255))
draw2.ellipse([dmx - 6, dmy + 2, dmx + 6, dmy + 10], fill=(235, 87, 87, 255))

# Star sparkles at top
def draw_star(draw, x, y, r, fill):
    points = [
        (x, y - r), (x + r*0.3, y - r*0.3), (x + r, y), (x + r*0.3, y + r*0.3),
        (x, y + r), (x - r*0.3, y + r*0.3), (x - r, y), (x - r*0.3, y - r*0.3)
    ]
    draw.polygon(points, fill=fill)

draw_star(draw2, int(0.40 * w), int(0.22 * h), 22, (245, 158, 11, 255))
draw_star(draw2, int(0.68 * w), int(0.25 * h), 18, (236, 72, 153, 255))

# Hop up 16px
f2_canvas = Image.new('RGBA', (w, h), (255, 255, 255, 255))
f2_canvas.paste(f2_base, (0, -16), f2_base)
f2_canvas.convert('RGB').save('assets/mascots/sequences/group_nano/group_f2_surprise.png', 'PNG')
print('Frame 2 (Surprise & Sparkles) saved')


# Frame 3: Praise & Bliss (Closed eyes, rosy blush glow)
f3 = base_img.copy()
draw3 = ImageDraw.Draw(f3)
# All characters have blissful curved closed eyes (u_u)
# Bread
bx2, by2 = int(0.344 * w), int(0.58 * h)
draw3.ellipse([bx1 - 16, by1 - 16, bx1 + 16, by1 + 16], fill=bread_skin)
draw3.ellipse([bx2 - 16, by2 - 16, bx2 + 16, by2 + 16], fill=bread_skin)
draw3.arc([bx1 - 15, by1 - 12, bx1 + 15, by1 + 12], start=10, end=170, fill=(24, 24, 27, 255), width=5)
draw3.arc([bx2 - 15, by2 - 12, bx2 + 15, by2 + 12], start=10, end=170, fill=(24, 24, 27, 255), width=5)

# Cloud
draw3.ellipse([cx1 - 18, cy1 - 18, cx1 + 18, cy1 + 18], fill=cloud_skin)
draw3.ellipse([cx2 - 18, cy2 - 18, cx2 + 18, cy2 + 18], fill=cloud_skin)
draw3.arc([cx1 - 16, cy1 - 12, cx1 + 16, cy1 + 12], start=10, end=170, fill=(24, 24, 27, 255), width=5)
draw3.arc([cx2 - 16, cy2 - 12, cx2 + 16, cy2 + 12], start=10, end=170, fill=(24, 24, 27, 255), width=5)

# Dewdrop
dew_skin = (210, 195, 248, 255)
dx1, dy1 = int(0.730 * w), int(0.605 * h)
dx2, dy2 = int(0.810 * w), int(0.608 * h)
draw3.ellipse([dx1 - 14, dy1 - 14, dx1 + 14, dy1 + 14], fill=dew_skin)
draw3.ellipse([dx2 - 14, dy2 - 14, dx2 + 14, dy2 + 14], fill=dew_skin)
draw3.arc([dx1 - 14, dy1 - 10, dx1 + 14, dy1 + 10], start=10, end=170, fill=(24, 24, 27, 255), width=5)
draw3.arc([dx2 - 14, dy2 - 10, dx2 + 14, dy2 + 10], start=10, end=170, fill=(24, 24, 27, 255), width=5)

f3.convert('RGB').save('assets/mascots/sequences/group_nano/group_f3_praise.png', 'PNG')
print('Frame 3 (Bliss & Praise) saved')
