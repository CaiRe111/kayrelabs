// Servidor estático solo para previsualizar el sitio en local (producción: Cloudflare, ver wrangler.jsonc)
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8181;
const HOST = "127.0.0.1"; // solo local
const ROOT = path.join(__dirname, "public");

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
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
      // HTML, CSS, JS, JSON y el manifest se revalidan siempre; imágenes y fuentes se guardan en caché
      const revalidar = [".html", ".css", ".js", ".json", ".webmanifest"].includes(ext);
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
      // Los videos necesitan peticiones Range (Safari e iOS no los reproducen sin ellas)
      cabeceras["Accept-Ranges"] = "bytes";
      const rango = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
      let inicio = 0;
      let fin = st.size - 1;
      let estado = 200;
      if (rango && (rango[1] || rango[2])) {
        if (rango[1]) {
          inicio = Number(rango[1]);
          if (rango[2]) fin = Math.min(Number(rango[2]), st.size - 1);
        } else {
          inicio = Math.max(st.size - Number(rango[2]), 0); // "-N": los últimos N bytes
        }
        if (inicio > fin || inicio >= st.size) {
          res.writeHead(416, { "Content-Range": `bytes */${st.size}` }).end();
          return;
        }
        estado = 206;
        cabeceras["Content-Range"] = `bytes ${inicio}-${fin}/${st.size}`;
      }
      cabeceras["Content-Length"] = fin - inicio + 1;
      res.writeHead(estado, cabeceras);
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      fs.createReadStream(archivo, { start: inicio, end: fin })
        .on("error", () => res.destroy())
        .pipe(res);
    });
  })
  .listen(PORT, HOST, () => console.log(`Portafolio en http://${HOST}:${PORT}`));
