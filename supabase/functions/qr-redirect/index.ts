import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  let device = "Desktop";
  let browser = "Unknown";
  let os = "Unknown";

  if (/Mobile|Android|iPhone/i.test(ua)) device = "Mobile";
  else if (/iPad|Tablet/i.test(ua)) device = "Tablet";

  if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua)) browser = "Safari";

  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

function htmlLandingPage(title: string, links: { label: string; url: string }[], accent: string): string {
  const linkItems = links.map((l, i) =>
    `<a href="${l.url}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:12px;padding:16px 20px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;text-decoration:none;color:#1e293b;font-weight:500;transition:all 0.2s;" onmouseover="this.style.borderColor='${accent}';this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 16px rgba(0,0,0,0.08)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.transform='';this.style.boxShadow=''">
      <span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:${accent}15;color:${accent};border-radius:10px;font-weight:700;font-size:14px;">${i + 1}</span>
      <span style="flex:1;">${l.label}</span>
      <span style="color:#94a3b8;">&#8599;</span>
    </a>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .container { max-width: 420px; width: 100%; }
  .header { text-align: center; margin-bottom: 32px; }
  .header h1 { font-size: 24px; color: #0f172a; margin-bottom: 8px; }
  .header p { color: #64748b; font-size: 14px; }
  .links { display: flex; flex-direction: column; gap: 12px; }
  .footer { text-align: center; margin-top: 32px; color: #94a3b8; font-size: 12px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>${title}</h1>
    <p>Choose a destination below</p>
  </div>
  <div class="links">${linkItems}</div>
  <div class="footer">Powered by QR Nexus</div>
</div>
</body>
</html>`;
}

function htmlBusinessCard(card: {
  full_name: string; job_title: string | null; company: string | null;
  email: string | null; phone: string | null; website: string | null;
  address: string | null; bio: string | null; photo_url: string | null;
  social_links: Record<string, string>; accent_color: string;
}): string {
  const social = Object.entries(card.social_links || {}).filter(([, v]) => v).map(([key, url]) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:${card.accent_color}15;color:${card.accent_color};border-radius:12px;text-decoration:none;font-size:13px;font-weight:700;text-transform:uppercase;">${key.charAt(0)}</a>`
  ).join("");

  const contactRows = [
    card.email ? `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9;"><span style="font-size:18px;">✉</span><a href="mailto:${card.email}" style="color:#475569;text-decoration:none;font-size:14px;">${card.email}</a></div>` : "",
    card.phone ? `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9;"><span style="font-size:18px;">☎</span><a href="tel:${card.phone}" style="color:#475569;text-decoration:none;font-size:14px;">${card.phone}</a></div>` : "",
    card.website ? `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9;"><span style="font-size:18px;">🌐</span><a href="${card.website}" target="_blank" style="color:#475569;text-decoration:none;font-size:14px;">${card.website}</a></div>` : "",
    card.address ? `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;"><span style="font-size:18px;">📍</span><span style="color:#475569;font-size:14px;">${card.address}</span></div>` : "",
  ].filter(Boolean).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${card.full_name} - Digital Card</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card { max-width: 400px; width: 100%; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
  .header { padding: 32px 24px; text-align: center; background: linear-gradient(135deg, ${card.accent_color}, ${card.accent_color}dd); }
  .avatar { width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px; font-weight: 700; color: #fff; border: 3px solid rgba(255,255,255,0.3); }
  .name { color: #fff; font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .title { color: rgba(255,255,255,0.85); font-size: 14px; }
  .body { padding: 24px; }
  .bio { color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 20px; text-align: center; }
  .contact { margin-bottom: 20px; }
  .social { display: flex; justify-content: center; gap: 10px; margin-top: 16px; }
  .footer { text-align: center; padding: 16px; color: #94a3b8; font-size: 12px; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="avatar">${card.photo_url ? `<img src="${card.photo_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" alt="${card.full_name}" />` : card.full_name.charAt(0).toUpperCase()}</div>
    <div class="name">${card.full_name}</div>
    ${card.job_title ? `<div class="title">${card.job_title}${card.company ? ` · ${card.company}` : ''}</div>` : ''}
  </div>
  <div class="body">
    ${card.bio ? `<p class="bio">${card.bio}</p>` : ''}
    <div class="contact">${contactRows}</div>
    ${social ? `<div class="social">${social}</div>` : ''}
  </div>
  <div class="footer">Powered by QR Nexus</div>
</div>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const shortId = url.searchParams.get("id");
    const cardId = url.searchParams.get("card");
    const userAgent = req.headers.get("user-agent") || "";
    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0].trim() || "unknown";
    const referrer = req.headers.get("referer") || "";

    // Business card view
    if (cardId) {
      const { data: card } = await supabase
        .from("business_cards")
        .select("*")
        .eq("id", cardId)
        .maybeSingle();

      if (!card) {
        return new Response("Business card not found", {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        });
      }

      // Track scan if QR code exists
      if (card.qr_code_id) {
        const { device, browser, os } = parseUserAgent(userAgent);
        await supabase.from("scans").insert({
          qr_code_id: card.qr_code_id,
          user_agent: userAgent,
          ip_address: ip,
          device_type: device,
          browser,
          os,
          referrer,
        });
        const { data: qrRow } = await supabase.from("qr_codes").select("scan_count").eq("id", card.qr_code_id).maybeSingle();
        await supabase.from("qr_codes").update({ scan_count: (qrRow?.scan_count || 0) + 1 }).eq("id", card.qr_code_id);
      }

      return new Response(htmlBusinessCard(card as never), {
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Dynamic QR redirect
    if (shortId) {
      const { data: qr } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("short_id", shortId)
        .maybeSingle();

      if (!qr) {
        return new Response("QR code not found", {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        });
      }

      if (!qr.is_active) {
        return new Response("This QR code is inactive", {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        });
      }

      // Track scan
      const { device, browser, os } = parseUserAgent(userAgent);
      await supabase.from("scans").insert({
        qr_code_id: qr.id,
        user_agent: userAgent,
        ip_address: ip,
        device_type: device,
        browser,
        os,
        referrer,
      });

      // Increment scan count
      await supabase.from("qr_codes").update({ scan_count: (qr.scan_count || 0) + 1 }).eq("id", qr.id);

      // Multi-link: show landing page
      if (qr.type === "multi_link") {
        const { data: links } = await supabase
          .from("qr_links")
          .select("label, url")
          .eq("qr_code_id", qr.id)
          .order("position", { ascending: true });

        if (links && links.length > 0) {
          return new Response(htmlLandingPage(qr.name, links as never, "#2563EB"), {
            headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
          });
        }
      }

      // Redirect to destination
      if (qr.destination) {
        return new Response(null, {
          status: 302,
          headers: { ...corsHeaders, Location: qr.destination },
        });
      }
    }

    return new Response("Missing id or card parameter", {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
