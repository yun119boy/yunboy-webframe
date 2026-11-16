// Cloudflare Worker: พร็อกซีสำหรับ Webframe
// วิธีใช้: Cloudflare Dashboard > Workers & Pages > Create > Hello World > วางโค้ดนี้ > Deploy
// จากนั้นนำที่อยู่ Worker ไปใส่ใน index.html เช่น
//   const MY_PROXY = "https://webframe-proxy.ชื่อคุณ.workers.dev/?url=";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export default {
  async fetch(request) {
    const cors = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "*",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    const target = new URL(request.url).searchParams.get("url");
    let url;
    try {
      url = new URL(target);
      if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
    } catch (_) {
      return new Response("ต้องระบุ ?url=https://...", { status: 400, headers: cors });
    }

    try {
      const upstream = await fetch(url.href, {
        redirect: "follow",
        headers: {
          "user-agent": UA,
          accept: "text/html,application/xhtml+xml,*/*;q=0.8",
          "accept-language": request.headers.get("accept-language") || "th,en;q=0.8",
        },
      });

      const headers = new Headers(cors);
      headers.set("content-type", upstream.headers.get("content-type") || "text/html; charset=utf-8");
      headers.set("x-final-url", upstream.url);

      return new Response(upstream.body, { status: upstream.status, headers });
    } catch (err) {
      return new Response("ดึงหน้าเว็บไม่สำเร็จ: " + err.message, { status: 502, headers: cors });
    }
  },
};
