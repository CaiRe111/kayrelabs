// Servidor estático mínimo del portafolio (www.kayrelabs.com -> http://localhost:8181)
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8181;
const HOST = "127.0.0.1"; // solo local; cloudflared expone el sitio
const ROOT = path.join(__dirname, "public");

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

http
  .createServer((req, res) => {
    let ruta;
    try {
      ruta = decodeURIComponent(new URL(req.url, "http://x").pathname);
    } catch {
      res.writeHead(400).end("Solicitud inválida");
      return;
    }
    if (ruta.endsWith("/")) ruta += "index.html";

    const archivo = path.normalize(path.join(ROOT, ruta));
    if (!archivo.startsWith(ROOT + path.sep)) {
      res.writeHead(403).end("Prohibido");
      return;
    }

    fs.readFile(archivo, (err, datos) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("No encontrado");
        return;
      }
      res.writeHead(200, {
        "Content-Type": TIPOS[path.extname(archivo).toLowerCase()] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=300",
      });
      res.end(datos);
    });
  })
  .listen(PORT, HOST, () => console.log(`Portafolio en http://${HOST}:${PORT}`));
