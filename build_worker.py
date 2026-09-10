import json

with open("worker_html.txt", "r", encoding="utf-8") as f:
    html_content = f.read()

# Safe JavaScript template string escaping
safe_html = html_content.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

worker_js = f"""// ==========================================================================
// TRACKING BRIDGE — STANDALONE CLOUDFLARE WORKER
// Multi-Carrier Parcel Tracking System
// ==========================================================================

const HTML_APP = `{safe_html}`;

export default {{
  async fetch(request, env, ctx) {{
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {{
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, 17token"
    }};

    if (request.method === "OPTIONS") {{
      return new Response(null, {{ headers: corsHeaders }});
    }}

    // Serve Static UI
    if (path === "/" || path === "/index.html" || !path.startsWith("/api/")) {{
      return new Response(HTML_APP, {{
        headers: {{
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=0, must-revalidate",
          ...corsHeaders
        }}
      }});
    }}

    // API: Carrier Detection
    if (path === "/api/detect-carrier" && request.method === "POST") {{
      try {{
        const body = await request.json();
        const num = (body.tracking_number || "").trim().toUpperCase().replace(/[\\s-]/g, "");
        let detected = {{ code: "generic", name: "International Courier" }};

        if (/^1Z[0-9A-Z]{{16}}$/.test(num)) detected = {{ code: "ups", name: "UPS" }};
        else if (/^\\d{{10}}$/.test(num) || num.startsWith("DHL") || num.startsWith("JJD")) detected = {{ code: "dhl", name: "DHL Express" }};
        else if (/^\\d{{14}}$/.test(num) || (num.startsWith("155") && num.length === 14) || (/^\\d{{12}}$/.test(num) && num.startsWith("0"))) detected = {{ code: "dpd-uk", name: "DPD (UK)" }};
        else if (/^\\d{{12}}$|^\\d{{15}}$|^\\d{{20}}$|^\\d{{22}}$/.test(num) || num.startsWith("FDX")) detected = {{ code: "fedex", name: "FedEx" }};
        else if (/^[A-Z]{{2}}\\d{{9}}GB$/.test(num)) detected = {{ code: "royal-mail", name: "Royal Mail" }};
        else if (/^(94|92|93)\\d{{20}}$/.test(num) || /^[A-Z]{{2}}\\d{{9}}US$/.test(num)) detected = {{ code: "usps", name: "USPS" }};

        return new Response(JSON.stringify({{ detected }}), {{
          headers: {{ "Content-Type": "application/json", ...corsHeaders }}
        }});
      }} catch (e) {{
        return new Response(JSON.stringify({{ error: e.message }}), {{ status: 400, headers: corsHeaders }});
      }}
    }}

    // Fallback: Let client handle local state smoothly
    return new Response(JSON.stringify({{ error: "Endpoint handled client-side" }}), {{
      status: 404,
      headers: {{ "Content-Type": "application/json", ...corsHeaders }}
    }});
  }}
}};
"""

with open("worker.js", "w", encoding="utf-8") as f:
    f.write(worker_js)

print(f"Generated worker.js successfully: {len(worker_js)} bytes")
