// Copia a public/ los archivos de terceros que viven en node_modules:
// el JS de Bootstrap y las fuentes autoalojadas (licencia OFL, sin CDN externo).
const fs = require("fs");
const path = require("path");

const copiar = (origen, destino) => {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.copyFileSync(origen, destino);
};

copiar("node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", "public/vendor/bootstrap.bundle.min.js");

// Plus Jakarta Sans: tipografía de la marca. JetBrains Mono: secciones técnicas.
const fuentes = [
  ["plus-jakarta-sans", "plus-jakarta-sans-latin-wght-normal.woff2"],
  ["jetbrains-mono", "jetbrains-mono-latin-wght-normal.woff2"],
];
for (const [paquete, archivo] of fuentes) {
  const base = `node_modules/@fontsource-variable/${paquete}`;
  copiar(`${base}/files/${archivo}`, `public/assets/fonts/${archivo}`);
  copiar(`${base}/LICENSE`, `public/assets/fonts/LICENSE-${paquete}.txt`);
}
