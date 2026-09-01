import os
from PIL import Image, ImageDraw, ImageEnhance

os.makedirs('assets/mascots/sequences/group_opposing', exist_ok=True)
base_path = r'C:\Users\Dave\.gemini\antigravity\brain\31575e33-80cf-4308-9bf1-a44ad1f3a869\group_anim_f0_smile_1788304633641.jpg'
base_img = Image.open(base_path).convert('RGBA')
w, h = base_img.size

# We cut the 3 characters with transparent masks so they move completely independently
# Clean white background canvas
bg_color = (255, 255, 255, 255)

# 1. Bread crop (Left ~ 0 to 42% width)
bread_crop = base_img.crop((0, int(0.25 * h), int(0.44 * w), h))
# 2. Cloud crop (Center ~ 34% to 74% width)
cloud_crop = base_img.crop((int(0.34 * w), 0, int(0.74 * w), int(0.85 * h)))
# 3. Dewdrop crop (Right ~ 64% to 100% width)
dew_crop = base_img.crop((int(0.64 * w), int(0.28 * h), w, h))

# Anchor paste positions on full canvas (w, h)
bread_pos = (0, int(0.25 * h))
cloud_pos = (int(0.34 * w), 0)
dew_pos = (int(0.64 * w), int(0.28 * h))

cloud_skin = (220, 235, 252, 255)
bread_skin = (252, 196, 140, 255)
dew_skin = (210, 195, 248, 255)

def draw_star(draw, x, y, r, fill):
    points = [
        (x, y - r), (x + r*0.3, y - r*0.3), (x + r, y), (x + r*0.3, y + r*0.3),
        (x, y + r), (x - r*0.3, y + r*0.3), (x - r, y), (x - r*0.3, y - r*0.3)
    ]
    draw.polygon(points, fill=fill)

def transform_layer(img, offset_x, offset_y, angle, scale_x=1.0, scale_y=1.0):
    lw, lh = img.size
    if scale_x != 1.0 or scale_y != 1.0:
        img = img.resize((int(lw * scale_x), int(lh * scale_y)), Image.BICUBIC)
    if angle != 0:
        img = img.rotate(angle, resample=Image.BICUBIC, fillcolor=(255, 255, 255, 0))
    return img, offset_x, offset_y


# =========================================================================
# FRAME 0: Resting Baseline
# =========================================================================
f0 = base_img.copy()
f0.convert('RGB').save('assets/mascots/sequences/group_opposing/oppose_f0.png', 'PNG')
print('Frame 0 saved')


# =========================================================================
# FRAME 1: CLOUD UP-LEFT (-18px) | BREAD DOWN-RIGHT (+14px) | DEWDROP RIGHT (+16px)
# Cloud blinks (^ _ ^), Bread anticipates, Dewdrop peers right
# =========================================================================
f1 = Image.new('RGBA', (w, h), bg_color)

# Bread: Shift Down +12px, tilt -3 deg
b1 = bread_crop.copy()
bd1 = ImageDraw.Draw(b1)
# Bread eyes look down-left
bx1_rel = int(0.248 * w) - bread_pos[0]
bx2_rel = int(0.344 * w) - bread_pos[0]
by_rel = int(0.585 * h) - bread_pos[1]
bd1.ellipse([bx1_rel - 16, by_rel - 16, bx1_rel + 16, by_rel + 16], fill=bread_skin)
bd1.ellipse([bx2_rel - 16, by_rel - 16, bx2_rel + 16, by_rel + 16], fill=bread_skin)
bd1.ellipse([bx1_rel - 12, by_rel - 6, bx1_rel + 6, by_rel + 10], fill=(24, 24, 27, 255))
bd1.ellipse([bx2_rel - 12, by_rel - 6, bx2_rel + 6, by_rel + 10], fill=(24, 24, 27, 255))
b1_t, b1_x, b1_y = transform_layer(b1, bread_pos[0] + 4, bread_pos[1] + 14, -3)

# Cloud: Floats UP-LEFT (-8x, -18y), blinks (^ _ ^)
c1 = cloud_crop.copy()
cd1 = ImageDraw.Draw(c1)
cx1_rel = int(0.485 * w) - cloud_pos[0]
cx2_rel = int(0.595 * w) - cloud_pos[0]
cy1_rel = int(0.470 * h) - cloud_pos[1]
cy2_rel = int(0.460 * h) - cloud_pos[1]
cd1.ellipse([cx1_rel - 18, cy1_rel - 18, cx1_rel + 18, cy1_rel + 18], fill=cloud_skin)
cd1.ellipse([cx2_rel - 18, cy2_rel - 18, cx2_rel + 18, cy2_rel + 18], fill=cloud_skin)
cd1.arc([cx1_rel - 16, cy1_rel - 14, cx1_rel + 16, cy1_rel + 14], start=190, end=350, fill=(24, 24, 27, 255), width=5)
cd1.arc([cx2_rel - 16, cy2_rel - 14, cx2_rel + 16, cy2_rel + 14], start=190, end=350, fill=(24, 24, 27, 255), width=5)
c1_t, c1_x, c1_y = transform_layer(c1, cloud_pos[0] - 8, cloud_pos[1] - 18, 2)

# Dewdrop: Sways RIGHT (+14x, +4y)
d1 = dew_crop.copy()
d1_t, d1_x, d1_y = transform_layer(d1, dew_pos[0] + 14, dew_pos[1] + 4, 4)

# Composite Frame 1 (Cloud in back, Bread & Dewdrop in front)
f1.paste(c1_t, (c1_x, c1_y), c1_t)
f1.paste(b1_t, (b1_x, b1_y), b1_t)
f1.paste(d1_t, (d1_x, d1_y), d1_t)
f1.convert('RGB').save('assets/mascots/sequences/group_opposing/oppose_f1.png', 'PNG')
print('Frame 1 saved')


# =========================================================================
# FRAME 2: BREAD HOPS UP (-20px) | CLOUD SETTLES DOWN (+10px) | DEWDROP UP-RIGHT (-16px)
# Bread winks, Cloud smiles forward, Dewdrop sparkles
# =========================================================================
f2 = Image.new('RGBA', (w, h), bg_color)

# Bread: Leaps UP (-20px) + Winks!
b2 = bread_crop.copy()
bd2 = ImageDraw.Draw(b2)
bd2.ellipse([bx1_rel - 16, by_rel - 16, bx1_rel + 16, by_rel + 16], fill=bread_skin)
bd2.arc([bx1_rel - 15, by_rel - 12, bx1_rel + 15, by_rel + 12], start=190, end=350, fill=(24, 24, 27, 255), width=5)
b2_t, b2_x, b2_y = transform_layer(b2, bread_pos[0] - 4, bread_pos[1] - 20, 4, scale_x=0.96, scale_y=1.05)

# Cloud: Settles DOWN (+10px)
c2 = cloud_crop.copy()
c2_t, c2_x, c2_y = transform_layer(c2, cloud_pos[0] + 4, cloud_pos[1] + 10, -2)

# Dewdrop: Bounces UP-RIGHT (+14x, -16y) + Sparkles
d2 = dew_crop.copy()
dd2 = ImageDraw.Draw(d2)
dx1_rel = int(0.730 * w) - dew_pos[0]
dy1_rel = int(0.605 * h) - dew_pos[1]
draw_star(dd2, dx1_rel + 20, dy1_rel - 30, 14, (245, 158, 11, 255))
d2_t, d2_x, d2_y = transform_layer(d2, dew_pos[0] + 14, dew_pos[1] - 16, -4)

f2.paste(c2_t, (c2_x, c2_y), c2_t)
f2.paste(b2_t, (b2_x, b2_y), b2_t)
f2.paste(d2_t, (d2_x, d2_y), d2_t)
f2.convert('RGB').save('assets/mascots/sequences/group_opposing/oppose_f2.png', 'PNG')
print('Frame 2 saved')


# =========================================================================
# FRAME 3: DEWDROP APEX UP (-24px) | BREAD SWAYS LEFT (-14px) | CLOUD SQUASHES DOWN
# Cloud mouth open "O" in anticipation, Dewdrop winks
# =========================================================================
f3 = Image.new('RGBA', (w, h), bg_color)

# Bread: Slides LEFT (-12x, +6y) with curious open mouth
b3 = bread_crop.copy()
bd3 = ImageDraw.Draw(b3)
bm_rel_x = int(0.296 * w) - bread_pos[0]
bm_rel_y = int(0.618 * h) - bread_pos[1]
bd3.ellipse([bm_rel_x - 12, bm_rel_y - 10, bm_rel_x + 12, bm_rel_y + 12], fill=(30, 24, 24, 255))
bd3.ellipse([bm_rel_x - 6, bm_rel_y + 2, bm_rel_x + 6, bm_rel_y + 10], fill=(235, 87, 87, 255))
b3_t, b3_x, b3_y = transform_layer(b3, bread_pos[0] - 12, bread_pos[1] + 6, -5)

# Cloud: Squashes down (+16px, 1.05w x 0.94h) preparing for big hop
c3 = cloud_crop.copy()
cd3 = ImageDraw.Draw(c3)
cm_rel_x = int(0.540 * w) - cloud_pos[0]
cm_rel_y = int(0.505 * h) - cloud_pos[1]
cd3.ellipse([cm_rel_x - 14, cm_rel_y - 10, cm_rel_x + 14, cm_rel_y + 12], fill=(30, 24, 24, 255))
cd3.ellipse([cm_rel_x - 8, cm_rel_y + 2, cm_rel_x + 8, cm_rel_y + 10], fill=(235, 87, 87, 255))
c3_t, c3_x, c3_y = transform_layer(c3, cloud_pos[0], cloud_pos[1] + 16, 0, scale_x=1.05, scale_y=0.94)

# Dewdrop: Apex Jump (-24px) + Wink
d3 = dew_crop.copy()
dd3 = ImageDraw.Draw(d3)
dx2_rel = int(0.810 * w) - dew_pos[0]
dy2_rel = int(0.608 * h) - dew_pos[1]
dd3.ellipse([dx2_rel - 14, dy2_rel - 14, dx2_rel + 14, dy2_rel + 14], fill=dew_skin)
dd3.arc([dx2_rel - 13, dy2_rel - 10, dx2_rel + 13, dy2_rel + 10], start=190, end=350, fill=(24, 24, 27, 255), width=5)
d3_t, d3_x, d3_y = transform_layer(d3, dew_pos[0] + 6, dew_pos[1] - 24, 5, scale_x=0.94, scale_y=1.06)

f3.paste(c3_t, (c3_x, c3_y), c3_t)
f3.paste(b3_t, (b3_x, b3_y), b3_t)
f3.paste(d3_t, (d3_x, d3_y), d3_t)
f3.convert('RGB').save('assets/mascots/sequences/group_opposing/oppose_f3.png', 'PNG')
print('Frame 3 saved')


# =========================================================================
# FRAME 4: CLOUD EXPLOSIVE LEAP UP (-26px) | BREAD SQUASHES DOWN (+12px) | DEWDROP SLIDES DOWN (+10px)
# Cloud burst stars, Bread laughs, Dewdrop smiles
# =========================================================================
f4 = Image.new('RGBA', (w, h), bg_color)

# Bread: Squashes DOWN (+12px) and laughs
b4 = bread_crop.copy()
bd4 = ImageDraw.Draw(b4)
bd4.ellipse([bm_rel_x - 14, bm_rel_y - 12, bm_rel_x + 14, bm_rel_y + 14], fill=(30, 24, 24, 255))
bd4.ellipse([bm_rel_x - 8, bm_rel_y + 2, bm_rel_x + 8, bm_rel_y + 12], fill=(235, 87, 87, 255))
b4_t, b4_x, b4_y = transform_layer(b4, bread_pos[0] + 6, bread_pos[1] + 12, 3, scale_x=1.04, scale_y=0.95)

# Cloud: High Leap Apex (-26px) with double star burst ✨
c4 = cloud_crop.copy()
cd4 = ImageDraw.Draw(c4)
cd4.ellipse([cm_rel_x - 16, cm_rel_y - 12, cm_rel_x + 16, cm_rel_y + 14], fill=(30, 24, 24, 255))
cd4.ellipse([cm_rel_x - 10, cm_rel_y + 2, cm_rel_x + 10, cm_rel_y + 12], fill=(235, 87, 87, 255))
draw_star(cd4, cx1_rel - 20, cy1_rel - 40, 22, (245, 158, 11, 255))
draw_star(cd4, cx2_rel + 30, cy2_rel - 35, 18, (236, 72, 153, 255))
c4_t, c4_x, c4_y = transform_layer(c4, cloud_pos[0] + 6, cloud_pos[1] - 26, 3, scale_x=0.96, scale_y=1.07)

# Dewdrop: Lands DOWN (+12px)
d4 = dew_crop.copy()
d4_t, d4_x, d4_y = transform_layer(d4, dew_pos[0] + 12, dew_pos[1] + 12, 6)

f4.paste(c4_t, (c4_x, c4_y), c4_t)
f4.paste(b4_t, (b4_x, b4_y), b4_t)
f4.paste(d4_t, (d4_x, d4_y), d4_t)
f4.convert('RGB').save('assets/mascots/sequences/group_opposing/oppose_f4.png', 'PNG')
print('Frame 4 saved')


# =========================================================================
# FRAME 5: BREAD UP-LEFT (-6px) | CLOUD SETTLES (-2px) | DEWDROP RECENTERS INTO PRAYER BLISS (u_u)
# All characters close eyes peacefully (u_u) with warm rosy blush
# =========================================================================
f5 = Image.new('RGBA', (w, h), bg_color)

# Bread: Sits in prayer bliss (u_u)
b5 = bread_crop.copy()
bd5 = ImageDraw.Draw(b5)
bd5.ellipse([bx1_rel - 16, by_rel - 16, bx1_rel + 16, by_rel + 16], fill=bread_skin)
bd5.ellipse([bx2_rel - 16, by_rel - 16, bx2_rel + 16, by_rel + 16], fill=bread_skin)
bd5.arc([bx1_rel - 15, by_rel - 12, bx1_rel + 15, by_rel + 12], start=10, end=170, fill=(24, 24, 27, 255), width=5)
bd5.arc([bx2_rel - 15, by_rel - 12, bx2_rel + 15, by_rel + 12], start=10, end=170, fill=(24, 24, 27, 255), width=5)
b5_t, b5_x, b5_y = transform_layer(b5, bread_pos[0] - 6, bread_pos[1] - 4, -2)

# Cloud: Sits in prayer bliss (u_u)
c5 = cloud_crop.copy()
cd5 = ImageDraw.Draw(c5)
cd5.ellipse([cx1_rel - 18, cy1_rel - 18, cx1_rel + 18, cy1_rel + 18], fill=cloud_skin)
cd5.ellipse([cx2_rel - 18, cy2_rel - 18, cx2_rel + 18, cy2_rel + 18], fill=cloud_skin)
cd5.arc([cx1_rel - 16, cy1_rel - 12, cx1_rel + 16, cy1_rel + 12], start=10, end=170, fill=(24, 24, 27, 255), width=5)
cd5.arc([cx2_rel - 16, cy2_rel - 12, cx2_rel + 16, cy2_rel + 12], start=10, end=170, fill=(24, 24, 27, 255), width=5)
c5_t, c5_x, c5_y = transform_layer(c5, cloud_pos[0], cloud_pos[1] - 2, 0)

# Dewdrop: Sits in prayer bliss (u_u)
d5 = dew_crop.copy()
dd5 = ImageDraw.Draw(d5)
dd5.ellipse([dx1_rel - 14, dy1_rel - 14, dx1_rel + 14, dy1_rel + 14], fill=dew_skin)
dd5.ellipse([dx2_rel - 14, dy2_rel - 14, dx2_rel + 14, dy2_rel + 14], fill=dew_skin)
dd5.arc([dx1_rel - 14, dy1_rel - 10, dx1_rel + 14, dy1_rel + 10], start=10, end=170, fill=(24, 24, 27, 255), width=5)
dd5.arc([dx2_rel - 14, dy2_rel - 10, dx2_rel + 14, dy2_rel + 10], start=10, end=170, fill=(24, 24, 27, 255), width=5)
d5_t, d5_x, d5_y = transform_layer(d5, dew_pos[0], dew_pos[1], -2)

f5.paste(c5_t, (c5_x, c5_y), c5_t)
f5.paste(b5_t, (b5_x, b5_y), b5_t)
f5.paste(d5_t, (d5_x, d5_y), d5_t)
f5.convert('RGB').save('assets/mascots/sequences/group_opposing/oppose_f5.png', 'PNG')
print('Frame 5 saved')
