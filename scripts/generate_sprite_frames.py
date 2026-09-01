import os
from PIL import Image, ImageEnhance

os.makedirs('assets/mascots/sequences/walk', exist_ok=True)
os.makedirs('assets/mascots/sequences/wave', exist_ok=True)
os.makedirs('assets/mascots/sequences/read', exist_ok=True)
os.makedirs('assets/mascots/sequences/group', exist_ok=True)

# 1. Walk Sequence from faith_mascot_bread.jpg
bread_img = Image.open('assets/mascots/faith_mascot_bread.jpg').convert('RGBA')
w, h = bread_img.size

# Frame 0: Stride Left (-4 deg tilt, shifted left 8px)
f0 = bread_img.rotate(-4, resample=Image.BICUBIC, fillcolor=(255, 255, 255, 255))
f0_canvas = Image.new('RGBA', (w, h), (255, 255, 255, 255))
f0_canvas.paste(f0, (-8, 0), f0)
f0_canvas.convert('RGB').save('assets/mascots/sequences/walk/walk_frame_0.png', 'PNG')

# Frame 1: Mid-Air Squash & Stretch Leap (Scaled 0.96w x 1.06h, translated up 16px)
f1_scaled = bread_img.resize((int(w * 0.96), int(h * 1.06)), Image.BICUBIC)
f1_canvas = Image.new('RGBA', (w, h), (255, 255, 255, 255))
paste_x = (w - f1_scaled.width) // 2
f1_canvas.paste(f1_scaled, (paste_x, -16), f1_scaled)
f1_canvas.convert('RGB').save('assets/mascots/sequences/walk/walk_frame_1.png', 'PNG')

# Frame 2: Stride Right (+4 deg tilt, shifted right 8px)
f2 = bread_img.rotate(4, resample=Image.BICUBIC, fillcolor=(255, 255, 255, 255))
f2_canvas = Image.new('RGBA', (w, h), (255, 255, 255, 255))
f2_canvas.paste(f2, (8, 0), f2)
f2_canvas.convert('RGB').save('assets/mascots/sequences/walk/walk_frame_2.png', 'PNG')

# Frame 3: Ground Impact Squash (Scaled 1.05w x 0.94h, translated down 14px)
f3_scaled = bread_img.resize((int(w * 1.05), int(h * 0.94)), Image.BICUBIC)
f3_canvas = Image.new('RGBA', (w, h), (255, 255, 255, 255))
paste_x = (w - f3_scaled.width) // 2
f3_canvas.paste(f3_scaled, (paste_x, 14), f3_scaled)
f3_canvas.convert('RGB').save('assets/mascots/sequences/walk/walk_frame_3.png', 'PNG')
print('Generated 4 Walk Sequence PNG frames')

# 2. Wave Sequence from faith_mascot_cloud.jpg
cloud_img = Image.open('assets/mascots/faith_mascot_cloud.jpg').convert('RGBA')
cw, ch = cloud_img.size

# Frame 0: Rest Float
cloud_img.convert('RGB').save('assets/mascots/sequences/wave/wave_frame_0.png', 'PNG')

# Frame 1: Tilt Left Wave -5 deg + up 10px
c1 = cloud_img.rotate(-5, resample=Image.BICUBIC, fillcolor=(255, 255, 255, 255))
c1_canvas = Image.new('RGBA', (cw, ch), (255, 255, 255, 255))
c1_canvas.paste(c1, (0, -10), c1)
c1_canvas.convert('RGB').save('assets/mascots/sequences/wave/wave_frame_1.png', 'PNG')

# Frame 2: Tilt Right Wave +5 deg + up 16px
c2 = cloud_img.rotate(5, resample=Image.BICUBIC, fillcolor=(255, 255, 255, 255))
c2_canvas = Image.new('RGBA', (cw, ch), (255, 255, 255, 255))
c2_canvas.paste(c2, (0, -16), c2)
c2_canvas.convert('RGB').save('assets/mascots/sequences/wave/wave_frame_2.png', 'PNG')

# Frame 3: Soft Float Down +6px
c3_canvas = Image.new('RGBA', (cw, ch), (255, 255, 255, 255))
c3_canvas.paste(cloud_img, (0, 6), cloud_img)
c3_canvas.convert('RGB').save('assets/mascots/sequences/wave/wave_frame_3.png', 'PNG')
print('Generated 4 Wave Sequence PNG frames')

# 3. Read Sequence from faith_mascot_rock.jpg
rock_img = Image.open('assets/mascots/faith_mascot_rock.jpg').convert('RGBA')
rw, rh = rock_img.size

# Frame 0: Base Study
rock_img.convert('RGB').save('assets/mascots/sequences/read/read_frame_0.png', 'PNG')

# Frame 1: Gentle Inhale Breathe (-10px up, slight scale)
r1_scaled = rock_img.resize((int(rw * 1.02), int(rh * 1.03)), Image.BICUBIC)
r1_canvas = Image.new('RGBA', (rw, rh), (255, 255, 255, 255))
r1_canvas.paste(r1_scaled, ((rw - r1_scaled.width)//2, -10), r1_scaled)
r1_canvas.convert('RGB').save('assets/mascots/sequences/read/read_frame_1.png', 'PNG')

# Frame 2: Holy Radiance Shimmer (Slightly enhanced warmth)
r2_enhancer = ImageEnhance.Color(rock_img)
r2_colored = r2_enhancer.enhance(1.25)
r2_canvas = Image.new('RGBA', (rw, rh), (255, 255, 255, 255))
r2_canvas.paste(r2_colored, (0, -14), r2_colored)
r2_canvas.convert('RGB').save('assets/mascots/sequences/read/read_frame_2.png', 'PNG')

# Frame 3: Exhale Settle
r3_canvas = Image.new('RGBA', (rw, rh), (255, 255, 255, 255))
r3_canvas.paste(rock_img, (0, 4), rock_img)
r3_canvas.convert('RGB').save('assets/mascots/sequences/read/read_frame_3.png', 'PNG')
print('Generated 4 Read Sequence PNG frames')

# 4. Group Sequence from faith_mascots_group.jpg
group_img = Image.open('assets/mascots/faith_mascots_group.jpg').convert('RGBA')
gw, gh = group_img.size

# Frame 0: Group Settle
group_img.convert('RGB').save('assets/mascots/sequences/group/group_frame_0.png', 'PNG')

# Frame 1: Group Joy Bounce (-14px)
g1_canvas = Image.new('RGBA', (gw, gh), (255, 255, 255, 255))
g1_canvas.paste(group_img, (0, -14), group_img)
g1_canvas.convert('RGB').save('assets/mascots/sequences/group/group_frame_1.png', 'PNG')

# Frame 2: Group Tilt Sway (-3 deg)
g2 = group_img.rotate(-3, resample=Image.BICUBIC, fillcolor=(255, 255, 255, 255))
g2.convert('RGB').save('assets/mascots/sequences/group/group_frame_2.png', 'PNG')

# Frame 3: Group Tilt Sway (+3 deg)
g3 = group_img.rotate(3, resample=Image.BICUBIC, fillcolor=(255, 255, 255, 255))
g3.convert('RGB').save('assets/mascots/sequences/group/group_frame_3.png', 'PNG')
print('Generated 4 Group Sequence PNG frames')
