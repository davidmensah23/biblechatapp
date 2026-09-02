import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-yvp-app-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const YOUVERSION_API_KEY =
  Deno.env.get("YOUVERSION_API_KEY") ||
  "vTLO6ybbDqjJHgaMCPemruLzH0o9GpIrZmfyEow7eVoF5fyp";

const BASE_URL = "https://api.youversion.com/v1";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "votd";
    const day = url.searchParams.get("day");

    let targetUrl = `${BASE_URL}/verse_of_the_days`;

    if (action === "votd" || action === "today") {
      if (day) {
        targetUrl = `${BASE_URL}/verse_of_the_days/${day}`;
      } else {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        targetUrl = `${BASE_URL}/verse_of_the_days/${dayOfYear}`;
      }
    } else if (action === "all_votd") {
      targetUrl = `${BASE_URL}/verse_of_the_days`;
    } else if (action === "bibles") {
      targetUrl = `${BASE_URL}/bibles`;
    }

    const resp = await fetch(targetUrl, {
      headers: {
        "X-YVP-App-Key": YOUVERSION_API_KEY,
        "User-Agent": "BibleChatApp/1.0",
        "Accept": "application/json",
      },
    });

    const data = await resp.json();

    return new Response(JSON.stringify({ success: true, data }), {
      status: resp.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Failed to query YouVersion API" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
