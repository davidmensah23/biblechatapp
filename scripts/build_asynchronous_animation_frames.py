import os
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

os.makedirs('assets/mascots/sequences/group_async', exist_ok=True)
base_path = r'C:\Users\Dave\.gemini\antigravity\brain\31575e33-80cf-4308-9bf1-a44ad1f3a869\group_anim_f0_smile_1788304633641.jpg'
base_img = Image.open(base_path).convert('RGBA')
w, h = base_img.size

# Coordinate anchors
cx1, cy1 = int(0.485 * w), int(0.470 * h) # Cloud Left Eye
cx2, cy2 = int(0.595 * w), int(0.460 * h) # Cloud Right Eye
cmx, cmy = int(0.540 * w), int(0.505 * h) # Cloud Mouth

bx1, by1 = int(0.248 * w), int(0.585 * h) # Bread Left Eye
bx2, by2 = int(0.344 * w), int(0.580 * h) # Bread Right Eye
bmx, bmy = int(0.296 * w), int(0.618 * h) # Bread Mouth

dx1, dy1 = int(0.730 * w), int(0.605 * h) # Dewdrop Left Eye
dx2, dy2 = int(0.810 * w), int(0.608 * h) # Dewdrop Right Eye
dmx, dmy = int(0.770 * w), int(0.635 * h) # Dewdrop Mouth

cloud_skin = (220, 235, 252, 255)
bread_skin = (252, 196, 140, 255)
dew_skin = (210, 195, 248, 255)

def draw_star(draw, x, y, r, fill):
    points = [
        (x, y - r), (x + r*0.3, y - r*0.3), (x + r, y), (x + r*0.3, y + r*0.3),
        (x, y + r), (x - r*0.3, y + r*0.3), (x - r, y), (x - r*0.3, y - r*0.3)
    ]
    draw.polygon(points, fill=fill)


# =========================================================================
# FRAME 0: Baseline Rest
# Cloud: Calm smile | Bread: Calm smile | Dewdrop: Curious open eyes
# =========================================================================
f0 = base_img.copy()
f0.convert('RGB').save('assets/mascots/sequences/group_async/async_f0.png', 'PNG')
print('Frame 0 saved')


# =========================================================================
# FRAME 1: Cloud Blinks, Bread Anticipates Crouch
# Cloud: Blink (^ _ ^) | Bread: Anticipation lean/crouch | Dewdrop: Normal
# =========================================================================
f1 = base_img.copy()
d1 = ImageDraw.Draw(f1)
# Cloud blinks
d1.ellipse([cx1 - 18, cy1 - 18, cx1 + 18, cy1 + 18], fill=cloud_skin)
d1.ellipse([cx2 - 18, cy2 - 18, cx2 + 18, cy2 + 18], fill=cloud_skin)
d1.arc([cx1 - 16, cy1 - 14, cx1 + 16, cy1 + 14], start=190, end=350, fill=(24, 24, 27, 255), width=5)
d1.arc([cx2 - 16, cy2 - 14, cx2 + 16, cy2 + 14], start=190, end=350, fill=(24, 24, 27, 255), width=5)

# Bread looks slightly down-left in anticipation
d1.ellipse([bx1 - 16, by1 - 16, bx1 + 16, by1 + 16], fill=bread_skin)
d1.ellipse([bx2 - 16, by2 - 16, bx2 + 16, by2 + 16], fill=bread_skin)
d1.ellipse([bx1 - 12, by1 - 8, bx1 + 6, by1 + 10], fill=(24, 24, 27, 255))
d1.ellipse([bx2 - 12, by2 - 8, bx2 + 6, by2 + 10], fill=(24, 24, 27, 255))

f1.convert('RGB').save('assets/mascots/sequences/group_async/async_f1.png', 'PNG')
print('Frame 1 saved')


# =========================================================================
# FRAME 2: Bread Winks, Dewdrop Bounces, Cloud Opens Eyes Wide
# Cloud: Wide sparkling eyes | Bread: Playful wink | Dewdrop: Joyful tilt
# =========================================================================
f2 = base_img.copy()
d2 = ImageDraw.Draw(f2)
# Bread wink
d2.ellipse([bx1 - 16, by1 - 16, bx1 + 16, by1 + 16], fill=bread_skin)
d2.arc([bx1 - 15, by1 - 12, bx1 + 15, by1 + 12], start=190, end=350, fill=(24, 24, 27, 255), width=5)

# Dewdrop extra sparkle
draw_star(d2, int(0.78 * w), int(0.52 * h), 12, (245, 158, 11, 255))

f2.convert('RGB').save('assets/mascots/sequences/group_async/async_f2.png', 'PNG')
print('Frame 2 saved')


# =========================================================================
# FRAME 3: Anticipation (Deep Breath / Squash before the jump)
# Cloud: Squash down -8px, "O" mouth | Bread: Curious look up | Dewdrop: Ready
# =========================================================================
f3_base = base_img.copy()
d3 = ImageDraw.Draw(f3_base)
# Cloud mouth open "O" anticipation
d3.ellipse([cmx - 12, cmy - 10, cmx + 12, cmy + 12], fill=(30, 24, 24, 255))
d3.ellipse([cmx - 6, cmy + 2, cmx + 6, cmy + 10], fill=(235, 87, 87, 255))

# Slight squash down +6px
f3_canvas = Image.new('RGBA', (w, h), (255, 255, 255, 255))
f3_scaled = f3_base.resize((int(w * 1.02), int(h * 0.96)), Image.BICUBIC)
f3_canvas.paste(f3_scaled, ((w - f3_scaled.width)//2, 10), f3_scaled)
f3_canvas.convert('RGB').save('assets/mascots/sequences/group_async/async_f3.png', 'PNG')
print('Frame 3 saved')


# =========================================================================
# FRAME 4: The Apex Surprise & Hop (Stretch & Sparkles)
# Cloud: Leaps up -18px with stars | Bread: Laughs happily | Dewdrop: Winks
# =========================================================================
f4_base = base_img.copy()
d4 = ImageDraw.Draw(f4_base)

# Bread laughing open smile
d4.ellipse([bmx - 14, bmy - 12, bmx + 14, bmy + 14], fill=(30, 24, 24, 255))
d4.ellipse([bmx - 8, bmy + 2, bmx + 8, bmy + 12], fill=(235, 87, 87, 255))

# Cloud big joyful mouth
d4.ellipse([cmx - 16, cmy - 12, cmx + 16, cmy + 14], fill=(30, 24, 24, 255))
d4.ellipse([cmx - 10, cmy + 2, cmx + 10, cmy + 12], fill=(235, 87, 87, 255))

# Dewdrop wink
d4.ellipse([dx2 - 14, dy2 - 14, dx2 + 14, dy2 + 14], fill=dew_skin)
d4.arc([dx2 - 13, dy2 - 10, dx2 + 13, dy2 + 10], start=190, end=350, fill=(24, 24, 27, 255), width=5)

# Magic Star Sparkles
draw_star(d4, int(0.38 * w), int(0.20 * h), 22, (245, 158, 11, 255))
draw_star(d4, int(0.68 * w), int(0.22 * h), 18, (236, 72, 153, 255))
draw_star(d4, int(0.84 * w), int(0.48 * h), 14, (168, 85, 247, 255))

# Apex Stretch & Hop Up -18px
f4_canvas = Image.new('RGBA', (w, h), (255, 255, 255, 255))
f4_scaled = f4_base.resize((int(w * 0.97), int(h * 1.05)), Image.BICUBIC)
f4_canvas.paste(f4_scaled, ((w - f4_scaled.width)//2, -18), f4_scaled)
f4_canvas.convert('RGB').save('assets/mascots/sequences/group_async/async_f4.png', 'PNG')
print('Frame 4 saved')


# =========================================================================
# FRAME 5: Follow-Through & Settle Bliss
# Cloud: Soft landing bliss (u_u) | Bread: Relaxed smile | Dewdrop: Rosy cheeks
# =========================================================================
f5 = base_img.copy()
d5 = ImageDraw.Draw(f5)

# Cloud blissful closed eyes (u_u)
d5.ellipse([cx1 - 18, cy1 - 18, cx1 + 18, cy1 + 18], fill=cloud_skin)
d5.ellipse([cx2 - 18, cy2 - 18, cx2 + 18, cy2 + 18], fill=cloud_skin)
d5.arc([cx1 - 16, cy1 - 12, cx1 + 16, cy1 + 12], start=10, end=170, fill=(24, 24, 27, 255), width=5)
d5.arc([cx2 - 16, cy2 - 12, cx2 + 16, cy2 + 12], start=10, end=170, fill=(24, 24, 27, 255), width=5)

# Bread peaceful smile
d5.ellipse([bx1 - 16, by1 - 16, bx1 + 16, by1 + 16], fill=bread_skin)
d5.ellipse([bx2 - 16, by2 - 16, bx2 + 16, by2 + 16], fill=bread_skin)
d5.arc([bx1 - 15, by1 - 12, bx1 + 15, by1 + 12], start=10, end=170, fill=(24, 24, 27, 255), width=5)
d5.arc([bx2 - 15, by2 - 12, bx2 + 15, by2 + 12], start=10, end=170, fill=(24, 24, 27, 255), width=5)

f5.convert('RGB').save('assets/mascots/sequences/group_async/async_f5.png', 'PNG')
print('Frame 5 saved')
