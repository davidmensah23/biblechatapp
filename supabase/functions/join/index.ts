import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const url = new URL(req.url)
  const refCode = url.searchParams.get("ref") || url.pathname.split("/").pop() || "Pilgrim"
  const formattedName = refCode.split("-")[0] || "A Friend"
  const displayName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1)

  const ogTitle = `${displayName} invited you to walk in Faith on Akorno`
  const ogDesc = "Converse with the 12 Apostles, study ancient Scripture with peaceful reflection, and unlock Grace Shields together."
  const ogImage = "https://raw.githubusercontent.com/davidmensah23/biblechatapp/main/assets/mascots/faith_mascots_group.jpg"

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ogTitle}</title>
  
  <!-- Open Graph / Facebook / WhatsApp / iMessage -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${req.url}">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:image" content="${ogImage}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogTitle}">
  <meta name="twitter:description" content="${ogDesc}">
  <meta name="twitter:image" content="${ogImage}">

  <!-- Smart App Banner -->
  <meta name="apple-itunes-app" content="app-argument=akorno://join/${refCode}">

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #FAF9F6; color: #18181B; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #FFFFFF; max-width: 440px; width: 100%; border-radius: 32px; padding: 32px 24px; text-align: center; box-shadow: 0 12px 36px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.04); }
    .hero-img { width: 100%; max-height: 200px; object-fit: contain; border-radius: 20px; margin-bottom: 20px; }
    h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 8px; }
    p { font-size: 15px; color: #64748B; line-height: 1.5; margin-bottom: 24px; }
    .btn { display: block; width: 100%; padding: 16px; background: #18181B; color: #FFFFFF; font-weight: 600; text-decoration: none; border-radius: 24px; font-size: 15px; margin-bottom: 12px; transition: transform 0.2s; }
    .btn:active { transform: scale(0.98); }
    .badge { display: inline-block; background: #FEF3C7; color: #D97706; padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✨ +100 Grace XP Welcome Gift</div>
    <img src="${ogImage}" alt="Akorno Faith Mascots" class="hero-img">
    <h1>Walk in Faith with ${displayName}</h1>
    <p>${ogDesc}</p>
    <a href="akorno://join/${refCode}" class="btn">Open in Akorno App</a>
    <a href="https://expo.dev" class="btn" style="background: #F1F5F9; color: #334155;">Download Akorno</a>
  </div>
</body>
</html>`

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
})
