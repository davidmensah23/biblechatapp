import base64
import json

frames_b64 = []
for i in range(6):
    p = f'assets/mascots/sequences/group_async/async_f{i}.png'
    with open(p, 'rb') as fp:
        b64 = base64.b64encode(fp.read()).decode('utf-8')
        frames_b64.append(f'data:image/png;base64,{b64}')

frames_json = json.dumps(frames_b64)

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
</head>
<body class="bg-transparent text-[var(--foreground)] antialiased p-3 font-sans">
  <div class="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl p-5 shadow-lg max-w-xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🎭</span>
        <div>
          <h2 class="text-base font-bold tracking-tight text-[var(--foreground)]">Asynchronous Mascot Animation Principles</h2>
          <p class="text-xs text-[var(--muted-foreground)]">Anticipation • Staggered Timing • Squash & Stretch</p>
        </div>
      </div>
      <div class="flex items-center gap-1 bg-[var(--sidebar)] px-2.5 py-1 rounded-full border border-[var(--border)]">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span id="fpsBadge" class="text-xs font-semibold text-[var(--foreground)]">3 FPS</span>
      </div>
    </div>

    <!-- Main Animation Stage Area -->
    <div class="relative bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl h-64 flex flex-col items-center justify-center overflow-hidden mb-4 shadow-inner">
      <img id="mainFrameImg" src="" alt="Mascot Animation" class="h-52 object-contain transition-none rounded-xl" />

      <!-- Step Indicator & Action Caption -->
      <div class="absolute bottom-2.5 flex items-center gap-2 px-4 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-full border border-[var(--border)] text-xs font-medium text-[var(--muted-foreground)] shadow-xs">
        <span id="frameDesc" class="font-bold text-amber-600">Frame 0: Baseline Rest</span>
      </div>
    </div>

    <!-- Live 6-Frame Timeline Strip -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs font-semibold text-[var(--muted-foreground)]">6 Asynchronous Frames (Staggered Acting):</span>
        <span id="intervalMsText" class="text-[11px] text-[var(--muted-foreground)]">333ms / frame</span>
      </div>
      <div class="grid grid-cols-6 gap-1.5">
        <div id="thumb0" onclick="goToFrame(0)" class="frame-thumb cursor-pointer border-2 border-amber-500 bg-white dark:bg-slate-800 rounded-xl p-1 flex flex-col items-center justify-center h-20 transition-all shadow-sm">
          <img id="thumbImg0" class="h-10 object-contain rounded-md" />
          <span class="text-[8px] font-bold text-amber-600 mt-0.5">0: Rest</span>
        </div>
        <div id="thumb1" onclick="goToFrame(1)" class="frame-thumb cursor-pointer border border-[var(--border)] bg-white dark:bg-slate-800 rounded-xl p-1 flex flex-col items-center justify-center h-20 transition-all opacity-50">
          <img id="thumbImg1" class="h-10 object-contain rounded-md" />
          <span class="text-[8px] font-medium text-[var(--muted-foreground)] mt-0.5">1: Blink/Lean</span>
        </div>
        <div id="thumb2" onclick="goToFrame(2)" class="frame-thumb cursor-pointer border border-[var(--border)] bg-white dark:bg-slate-800 rounded-xl p-1 flex flex-col items-center justify-center h-20 transition-all opacity-50">
          <img id="thumbImg2" class="h-10 object-contain rounded-md" />
          <span class="text-[8px] font-medium text-[var(--muted-foreground)] mt-0.5">2: Wink</span>
        </div>
        <div id="thumb3" onclick="goToFrame(3)" class="frame-thumb cursor-pointer border border-[var(--border)] bg-white dark:bg-slate-800 rounded-xl p-1 flex flex-col items-center justify-center h-20 transition-all opacity-50">
          <img id="thumbImg3" class="h-10 object-contain rounded-md" />
          <span class="text-[8px] font-medium text-[var(--muted-foreground)] mt-0.5">3: Anticipate</span>
        </div>
        <div id="thumb4" onclick="goToFrame(4)" class="frame-thumb cursor-pointer border border-[var(--border)] bg-white dark:bg-slate-800 rounded-xl p-1 flex flex-col items-center justify-center h-20 transition-all opacity-50">
          <img id="thumbImg4" class="h-10 object-contain rounded-md" />
          <span class="text-[8px] font-medium text-[var(--muted-foreground)] mt-0.5">4: Hop & Star</span>
        </div>
        <div id="thumb5" onclick="goToFrame(5)" class="frame-thumb cursor-pointer border border-[var(--border)] bg-white dark:bg-slate-800 rounded-xl p-1 flex flex-col items-center justify-center h-20 transition-all opacity-50">
          <img id="thumbImg5" class="h-10 object-contain rounded-md" />
          <span class="text-[8px] font-medium text-[var(--muted-foreground)] mt-0.5">5: Bliss Settle</span>
        </div>
      </div>
    </div>

    <!-- Controls Toolbar (Speed Slider & Play/Pause) -->
    <div class="flex items-center justify-between gap-3 bg-[var(--sidebar)] border border-[var(--border)] rounded-xl p-2.5">
      <div class="flex items-center gap-2 flex-1">
        <span class="text-xs font-medium text-[var(--muted-foreground)]">Speed:</span>
        <input id="fpsSlider" type="range" min="1" max="5" value="3" oninput="changeFps(this.value)" class="w-full accent-amber-500 cursor-pointer">
      </div>
      <div class="flex items-center gap-2">
        <button id="playPauseBtn" onclick="togglePlayPause()" class="px-3 py-1 bg-[var(--card)] hover:bg-slate-100 dark:hover:bg-slate-700 border border-[var(--border)] text-xs font-semibold rounded-lg transition-all shadow-xs">
          ⏸️ Pause
        </button>
      </div>
    </div>
  </div>

  <script>
    const frames = """ + frames_json + """;
    const descriptions = [
      'Frame 0: Baseline Calm Rest Pose',
      'Frame 1: Staggered Acting (Cloud blinks ^_^ while Bread leans in anticipation)',
      'Frame 2: Character Handoff (Bread winks playfully while Dewdrop sparkles)',
      'Frame 3: Anticipation Squash (Cloud squashes down with open "O" mouth)',
      'Frame 4: The Apex Surprise Hop (Cloud leaps with sparkles ✨ & Bread laughs)',
      'Frame 5: Follow-Through & Bliss Settle (Gentle landing into prayer bliss u_u)'
    ];
    let currentFrame = 0;
    let fps = 3;
    let isPlaying = true;
    let timer = null;

    function renderFrame() {
      document.getElementById('mainFrameImg').src = frames[currentFrame];
      document.getElementById('frameDesc').innerText = descriptions[currentFrame];

      for (let i = 0; i < 6; i++) {
        const thumb = document.getElementById(`thumb${i}`);
        if (i === currentFrame) {
          thumb.className = 'frame-thumb cursor-pointer border-2 border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 rounded-xl p-1 flex flex-col items-center justify-center h-20 transition-all shadow-sm scale-105';
        } else {
          thumb.className = 'frame-thumb cursor-pointer border border-[var(--border)] bg-white dark:bg-slate-800 rounded-xl p-1 flex flex-col items-center justify-center h-20 transition-all opacity-50';
        }
      }
    }

    function updateThumbnails() {
      for (let i = 0; i < 6; i++) {
        document.getElementById(`thumbImg${i}`).src = frames[i];
      }
    }

    function startLoop() {
      if (timer) clearInterval(timer);
      const intervalMs = Math.floor(1000 / fps);
      document.getElementById('intervalMsText').innerText = `${intervalMs}ms / frame`;
      timer = setInterval(() => {
        if (!isPlaying) return;
        currentFrame = (currentFrame + 1) % 6;
        renderFrame();
      }, intervalMs);
    }

    function goToFrame(index) {
      currentFrame = index;
      renderFrame();
    }

    function changeFps(newFps) {
      fps = parseInt(newFps);
      document.getElementById('fpsBadge').innerText = `${fps} FPS`;
      startLoop();
    }

    function togglePlayPause() {
      isPlaying = !isPlaying;
      document.getElementById('playPauseBtn').innerText = isPlaying ? '⏸️ Pause' : '▶️ Play';
    }

    // Init
    updateThumbnails();
    renderFrame();
    startLoop();
  </script>
</body>
</html>"""

with open(r'C:\Users\Dave\.gemini\antigravity\brain\31575e33-80cf-4308-9bf1-a44ad1f3a869\async_animation_showcase.html', 'w', encoding='utf-8') as fp:
    fp.write(html_content)
print('Successfully wrote async_animation_showcase.html')
