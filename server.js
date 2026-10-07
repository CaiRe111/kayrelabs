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
  ".jfif": "image/jpeg",
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

    fs.stat(archivo, (errStat, st) => {
      if (errStat || !st.isFile()) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("No encontrado");
        return;
      }
      const ext = path.extname(archivo).toLowerCase();
      // HTML, CSS, JS y JSON se revalidan siempre; las imágenes se guardan en caché
      const revalidar = [".html", ".css", ".js", ".json"].includes(ext);
      const etag = `"${st.size}-${Math.floor(st.mtimeMs)}"`;
      const cabeceras = {
        "Content-Type": TIPOS[ext] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": revalidar ? "no-cache" : "public, max-age=86400",
        ETag: etag,
        "Last-Modified": st.mtime.toUTCString(),
      };
      if (req.headers["if-none-match"] === etag) {
        res.writeHead(304, cabeceras).end();
        return;
      }
      fs.readFile(archivo, (err, datos) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" }).end("Error del servidor");
          return;
        }
        res.writeHead(200, cabeceras);
        res.end(datos);
      });
    });
  })
  .listen(PORT, HOST, () => console.log(`Portafolio en http://${HOST}:${PORT}`));
