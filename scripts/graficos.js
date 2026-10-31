// Genera los gráficos de marca de KayreLabs a partir de plantillas HTML (Playwright):
// mockups de las plataformas, imágenes para compartir (OG) y piezas para redes.
// Uso: node scripts/graficos.js <carpeta-de-salida>
// Luego copia/convierte: web/*-mockup.png → public/assets/media/<plataforma>/mockup.webp (1200×750),
// og/*.png → public/assets/brand/, redes/*.png → docs/redes/.
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const RAIZ = path.resolve(__dirname, "..");
const PUB = RAIZ + "/public";
const SAL = path.resolve(process.argv[2] || "graficos");
const f = (p) => "file://" + p;
const a = (p) => f(PUB + "/" + p);

const BASE = `
@font-face { font-family: "PJS"; font-weight: 200 800; src: url("${a("assets/fonts/plus-jakarta-sans-latin-wght-normal.woff2")}") format("woff2"); }
@font-face { font-family: "JBM"; font-weight: 100 800; src: url("${a("assets/fonts/jetbrains-mono-latin-wght-normal.woff2")}") format("woff2"); }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: transparent; }
body { font-family: "PJS", sans-serif; -webkit-font-smoothing: antialiased; color: #111; }
.verde { color: #00c853; }
.oscuro { position: relative; overflow: hidden; background: #111; color: #fff; isolation: isolate; }
.oscuro::before { content: ""; position: absolute; inset: 0; z-index: -2;
  background: radial-gradient(55% 70% at 92% 0%, rgba(0,200,83,.32), transparent 65%), radial-gradient(45% 55% at 0% 100%, rgba(0,200,83,.14), transparent 70%); }
.oscuro::after { content: ""; position: absolute; inset: 0; z-index: -1;
  background: radial-gradient(rgba(255,255,255,.13) 1.6px, transparent 2.1px) 0 0 / 34px 34px;
  -webkit-mask-image: linear-gradient(115deg, transparent 25%, #000 95%); }
.etq { font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: #00c853; }
.ico { display: inline-block; background: currentColor; -webkit-mask: var(--i) center / contain no-repeat; flex: none; }
`;
// Íconos en línea (SVG embebido: las máscaras CSS no cargan desde file://)
const ico = (n, size, color = "#00c853") =>
  fs.readFileSync(PUB + "/assets/iconos/" + n + ".svg", "utf8")
    .replace(/stroke="#00C853"/gi, `stroke="${color}"`)
    .replace("<svg ", `<svg class="ico-svg" width="${size}" height="${size}" style="flex:none" `);

// ---------------------------------------------------------------- mockup laptop + celular
const mockupHTML = (escritorio, movil) => `<!doctype html><html><head><style>${BASE}
body { width: 1600px; height: 1000px; position: relative; }
.laptop { position: absolute; left: 40px; top: 70px; width: 1240px; }
.pantalla { padding: 26px 20px 20px; background: #0c0d0c; border-radius: 26px 26px 6px 6px; box-shadow: 0 0 0 2px #2b2e2c, 0 40px 80px rgba(0,0,0,.45); }
.pantalla img { display: block; width: 100%; aspect-ratio: 16/10; object-fit: cover; object-position: top left; border-radius: 4px; }
.base { position: relative; height: 34px; margin: 0 -70px; border-radius: 0 0 26px 26px;
  background: linear-gradient(#d9dedb, #9aa29e 70%, #6f7773); box-shadow: 0 24px 40px rgba(0,0,0,.35); }
.base::before { content: ""; position: absolute; left: 50%; top: 0; width: 190px; height: 12px; margin-left: -95px; border-radius: 0 0 12px 12px; background: #8a928e; }
.cel { position: absolute; right: 70px; bottom: 40px; width: 330px; height: 690px; padding: 12px; border-radius: 52px; background: #0c0d0c;
  box-shadow: 0 0 0 2px #2b2e2c, 0 0 0 5px #0c0d0c, 0 40px 80px rgba(0,0,0,.5); }
.cel img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: 40px; }
.cel::before { content: ""; position: absolute; left: 50%; top: 22px; width: 96px; height: 26px; margin-left: -48px; border-radius: 20px; background: #0c0d0c; z-index: 1; }
</style></head><body>
<div class="laptop"><div class="pantalla"><img src="${escritorio}"></div><div class="base"></div></div>
<div class="cel"><img src="${movil}"></div>
</body></html>`;

const MOCKUPS = {
  ecommerce: [a("assets/media/ecommerce/08-panel-resumen.jpg"), a("assets/media/ecommerce/movil-tienda.webp")],
  "enlace-nfc": [a("assets/media/enlace-nfc/02-enlaces-y-pagos.jpg"), a("assets/media/enlace-nfc/07-tarjeta-vitrina.webp")],
  garantias: [a("assets/media/garantias/02-bandeja-por-rol.jpg"), a("assets/media/garantias/16-movil.jpg")],
  ofertas: [a("assets/media/ofertas/09-vista-por-rol.jpg"), a("assets/media/ofertas/movil.webp")],
};

// ---------------------------------------------------------------- imágenes para compartir (1200 × 630)
const LOGO_NEG = a("assets/brand/logo-horizontal-negativo.svg");
const LOGO = a("assets/brand/logo-horizontal.svg");
const og = ({ etiqueta, titulo, texto, chips, arte }) => `<!doctype html><html><head><style>${BASE}
body { width: 1200px; height: 630px; }
.lienzo { width: 1200px; height: 630px; padding: 56px 64px; display: flex; flex-direction: column; }
.logo { height: 46px; width: auto; align-self: flex-start; }
.txt { width: 580px; margin-top: auto; }
.etq { font-size: 17px; margin-bottom: 18px; }
h1 { font-size: 60px; line-height: 1.02; letter-spacing: -.035em; font-weight: 800; margin-bottom: 20px; }
p { font-size: 23px; line-height: 1.4; color: rgba(255,255,255,.76); }
.chips { display: flex; gap: 10px; margin-top: 26px; flex-wrap: wrap; }
.chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1.5px solid rgba(255,255,255,.25); border-radius: 99px; font-size: 18px; font-weight: 600; }
.arte { position: absolute; right: 30px; top: 50%; transform: translateY(-50%); }
.web { position: absolute; right: 64px; top: 56px; font-size: 19px; font-weight: 600; color: rgba(255,255,255,.7); }
</style></head><body><div class="lienzo oscuro">
<img class="logo" src="${LOGO_NEG}">
<span class="web">kayrelabs.com</span>
<div class="arte">${arte}</div>
<div class="txt"><p class="etq">${etiqueta}</p><h1>${titulo}</h1><p>${texto}</p>
<div class="chips">${chips.map(([i, t]) => `<span class="chip">${ico(i, 20)} ${t}</span>`).join("")}</div></div>
</div></body></html>`;

const fotosTienda = (tam) => ["gatos-sabiduria", "llaveros-calavera", "gatos-enamorados", "gnomos"]
  .map((s) => `<img src="${a("assets/img/impresion-3d/" + s + "/01.webp")}" style="width:${tam}px;height:${tam}px;object-fit:cover;border-radius:22px;border:4px solid #fff;box-shadow:0 18px 36px rgba(0,0,0,.4)">`).join("");

const OGS = {
  "og-image": og({ etiqueta: "Software · Impresión 3D · Electrónica", titulo: 'Software y productos <span class="verde">a la medida</span> de tu negocio',
    texto: "Marca, web y software para pymes y empresas. Piezas, domótica e IoT con impresión 3D.",
    chips: [["tienda", "Paquetes desde $2.500.000"], ["check", "Demos en vivo"]],
    arte: `<img src="${a("assets/ilustraciones/inicio.svg")}" style="width:540px">` }),
  "og-desarrollo": og({ etiqueta: "Desarrollo", titulo: 'Marca, web y software para tu <span class="verde">negocio</span>',
    texto: "Paquetes para pymes y aplicativos robustos para empresas.",
    chips: [["tienda", "Desde $2.500.000"], ["empresa", "Para empresas"]],
    arte: `<img src="${f(SAL + "/web/ecommerce-mockup.png")}" style="width:540px;margin-right:-30px">` }),
  "og-productos": og({ etiqueta: "Productos", titulo: 'Impresión 3D, domótica e <span class="verde">IoT</span>',
    texto: "Piezas a medida, kits para conectar tu casa y automatización para tu negocio.",
    chips: [["impresion-3d", "Piezas a medida"], ["domotica", "Domótica"], ["electronica", "IoT"]],
    arte: `<img src="${a("assets/ilustraciones/impresion-3d.svg")}" style="width:500px">` }),
  "og-tienda": og({ etiqueta: "Tienda", titulo: 'Piezas impresas en 3D <span class="verde">listas para llevar</span>',
    texto: "Figuras, llaveros y accesorios. Pide por WhatsApp y coordinamos la entrega.",
    chips: [["whatsapp", "Pide por WhatsApp"]],
    arte: `<div style="display:grid;grid-template-columns:repeat(2,210px);gap:18px;margin-right:30px;transform:rotate(-4deg)">${fotosTienda(210)}</div>` }),
};

// ---------------------------------------------------------------- redes sociales
const WA = "+57 301 221 7575";
const pieRed = (oscuro) => `<div class="pie-red ${oscuro ? "" : "claro"}">
  <span>${ico("whatsapp", 36, oscuro ? "#111111" : "#00c853")} ${WA}</span><span>kayrelabs.com</span></div>`;
const RED_CSS = `
.pieza { width: 1080px; padding: 72px 80px 64px; display: flex; flex-direction: column; }
.pieza.claro { background: #f6f8f7; }
.logo { height: 58px; width: auto; align-self: flex-start; }
.etq { font-size: 22px; margin-bottom: 20px; }
.claro .etq { color: #007a33; }
h1 { font-size: 92px; line-height: .98; letter-spacing: -.04em; font-weight: 800; }
h2 { font-size: 64px; line-height: 1.02; letter-spacing: -.035em; font-weight: 800; }
.sub { font-size: 32px; line-height: 1.35; margin-top: 18px; color: rgba(255,255,255,.76); }
.claro .sub { color: #5d6762; }
.precio { margin-top: 30px; display: flex; align-items: baseline; gap: 18px; }
.precio small { font-size: 24px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; opacity: .7; }
.precio strong { font-size: 84px; font-weight: 800; letter-spacing: -.04em; }
.nota { font-size: 24px; opacity: .7; margin-top: 4px; }
ul { list-style: none; display: grid; gap: 16px; margin-top: 34px; font-size: 30px; }
li { display: flex; gap: 16px; align-items: center; }
.pie-red { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding: 26px 34px; border-radius: 26px;
  background: #00c853; color: #111; font-size: 32px; font-weight: 800; }
.pie-red span { display: inline-flex; align-items: center; gap: 14px; }

.pie-red.claro { background: #111; color: #fff; }

.sello { align-self: flex-start; padding: 10px 22px; border-radius: 99px; background: #00c853; color: #111; font-size: 22px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
`;

const PAQ = {
  arranca: { nombre: "Arranca", para: "Para el negocio que empieza", precio: "$2.500.000", nota: "Pago único · entrega en 2 a 3 semanas", oscuro: false,
    incluye: ["Logo, paleta y tipografía", "Manual básico de marca", "Página web de 1 a 5 secciones", "Botón de WhatsApp y redes"],
    arte: `<div style="display:flex;align-items:center;justify-content:center;width:300px;height:300px;border-radius:70px;background:#e8faf0">${ico("bombillo", 170, "#00c853")}</div>` },
  vende: { nombre: "Vende", para: "Para vender en línea", precio: "$3.600.000", nota: "+ mensualidad desde $150.000 · 4 a 6 semanas", oscuro: true, sello: "Recomendado",
    incluye: ["Marca + kit de 10 piezas para redes", "Tienda en línea con panel", "Pagos con Wompi y factura electrónica", "Carga de hasta 50 productos"],
    arte: `<img src="${f(SAL + "/web/ecommerce-mockup.png")}" style="width:700px;margin-right:-100px">` },
  fideliza: { nombre: "Fideliza", para: "Para que tus clientes vuelvan", precio: "$4.100.000", nota: "+ piezas NFC y mensualidad · 4 a 6 semanas", oscuro: true,
    incluye: ["Todo lo del paquete Vende", "Enlace NFC con 10 piezas en 3D", "Pagos por Nequi, Daviplata y Bre-B", "Sellos de fidelización en caja"],
    arte: `<img src="${f(SAL + "/web/enlace-nfc-mockup.png")}" style="width:700px;margin-right:-100px">` },
};
const postPaquete = (p) => `<!doctype html><html><head><style>${BASE}${RED_CSS}
body { width: 1080px; height: 1350px; } .pieza { height: 1350px; }
.cabeza { display: flex; justify-content: space-between; align-items: flex-start; }
.arte { position: absolute; right: 80px; top: 140px; }
</style></head><body><div class="pieza ${p.oscuro ? "oscuro" : "claro"}">
<div class="cabeza"><img class="logo" src="${p.oscuro ? LOGO_NEG : LOGO}">${p.sello ? `<span class="sello">${p.sello}</span>` : ""}</div>
<div class="arte">${p.arte}</div>
<div style="margin-top:430px">
<p class="etq">Paquete para pymes</p>
<h1>${p.nombre}</h1>
<p class="sub">${p.para}</p>
<div class="precio"><small>Desde</small><strong>${p.precio}</strong></div>
<p class="nota">${p.nota}</p>
<ul>${p.incluye.map((x) => `<li>${ico("check", 34, p.oscuro ? "#00c853" : "#007a33")} ${x}</li>`).join("")}</ul>
</div>
${pieRed(p.oscuro)}
</div></body></html>`;

const postTienda = `<!doctype html><html><head><style>${BASE}${RED_CSS}
body { width: 1080px; height: 1350px; } .pieza { height: 1350px; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; margin: 44px 0 40px; }
.grid img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 30px; }
</style></head><body><div class="pieza oscuro">
<img class="logo" src="${LOGO_NEG}">
<div style="margin-top:46px"><p class="etq">Tienda KayreLabs</p>
<h2>Piezas impresas en 3D <span class="verde">listas para llevar</span></h2></div>
<div class="grid">${["gatos-sabiduria", "llaveros-calavera", "gatos-enamorados", "gnomos"].map((s) => `<img src="${a("assets/img/impresion-3d/" + s + "/01.webp")}">`).join("")}</div>
${pieRed(true).replace("kayrelabs.com", "Pide por WhatsApp")}
</div></body></html>`;

const postRamas = `<!doctype html><html><head><style>${BASE}${RED_CSS}
body { width: 1080px; height: 1350px; } .pieza { height: 1350px; }
.ramas { display: grid; gap: 26px; margin: 46px 0 40px; }
.rama { display: grid; grid-template-columns: 280px 1fr; gap: 34px; align-items: center; padding: 30px; border-radius: 34px; background: rgba(255,255,255,.05); border: 1.5px solid rgba(255,255,255,.14); }
.rama img { width: 280px; }
.rama h3 { font-size: 44px; letter-spacing: -.03em; line-height: 1.05; margin: 10px 0 14px; }
.rama p { font-size: 26px; line-height: 1.4; color: rgba(255,255,255,.74); }
.rama .etq { font-size: 19px; margin: 0; }
</style></head><body><div class="pieza oscuro">
<img class="logo" src="${LOGO_NEG}">
<div style="margin-top:46px"><h2>Lo digital y lo físico <span class="verde">en un solo lugar</span></h2></div>
<div class="ramas">
<div class="rama"><img src="${a("assets/ilustraciones/desarrollo.svg")}"><div><p class="etq">Desarrollo</p><h3>Marca, web y software para tu negocio</h3><p>Paquetes para pymes desde $2.500.000 y aplicativos para empresas.</p></div></div>
<div class="rama"><img src="${a("assets/ilustraciones/impresion-3d.svg")}"><div><p class="etq">Productos</p><h3>Impresión 3D, domótica e IoT</h3><p>Piezas a medida, kits para tu casa y automatización para tu negocio.</p></div></div>
</div>
${pieRed(true)}
</div></body></html>`;

const historia = `<!doctype html><html><head><style>${BASE}${RED_CSS}
body { width: 1080px; height: 1920px; } .pieza { height: 1920px; padding: 110px 80px 120px; }
.lista { display: grid; gap: 18px; margin: 40px 0; }
.fila { display: flex; justify-content: space-between; align-items: center; padding: 28px 34px; border-radius: 28px; background: rgba(255,255,255,.06); border: 1.5px solid rgba(255,255,255,.14); font-size: 34px; }
.fila strong { font-size: 40px; } .fila b { color: #00c853; font-size: 40px; }
.fila.dest { border-color: #00c853; background: rgba(0,200,83,.12); }
</style></head><body><div class="pieza oscuro">
<img class="logo" src="${LOGO_NEG}">
<img src="${a("assets/ilustraciones/inicio.svg")}" style="width:880px;margin:40px auto 10px;display:block">
<h1 style="font-size:96px">Software y productos <span class="verde">a la medida</span></h1>
<p class="sub">Marca, página y tienda en línea para tu negocio.</p>
<div class="lista">
<div class="fila"><strong>Arranca</strong><span>desde <b>$2,5 M</b></span></div>
<div class="fila dest"><strong>Vende</strong><span>desde <b>$3,6 M</b></span></div>
<div class="fila"><strong>Fideliza</strong><span>desde <b>$4,1 M</b></span></div>
</div>
${pieRed(true)}
</div></body></html>`;

(async () => {
  const b = await chromium.launch();
  const tmp = path.join(SAL, "_html");
  fs.mkdirSync(tmp, { recursive: true });
  fs.mkdirSync(path.join(SAL, "web"), { recursive: true });
  fs.mkdirSync(path.join(SAL, "og"), { recursive: true });
  fs.mkdirSync(path.join(SAL, "redes"), { recursive: true });

  const render = async (nombre, html, w, h, salida, transparente = false) => {
    const archivo = path.join(tmp, nombre + ".html");
    fs.writeFileSync(archivo, html);
    const pg = await b.newPage({ viewport: { width: w, height: h } });
    await pg.goto("file://" + archivo, { waitUntil: "networkidle" });
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(300);
    await pg.screenshot({ path: salida, omitBackground: transparente });
    await pg.close();
    console.log("ok", path.basename(salida));
  };

  for (const [n, [esc, mov]] of Object.entries(MOCKUPS))
    await render("mock-" + n, mockupHTML(esc, mov), 1600, 1000, path.join(SAL, "web", n + "-mockup.png"), true);
  for (const [n, html] of Object.entries(OGS)) await render(n, html, 1200, 630, path.join(SAL, "og", n + ".png"));
  for (const [n, p] of Object.entries(PAQ)) await render("paq-" + n, postPaquete(p), 1080, 1350, path.join(SAL, "redes", "post-paquete-" + n + ".png"));
  await render("tienda", postTienda, 1080, 1350, path.join(SAL, "redes", "post-tienda.png"));
  await render("ramas", postRamas, 1080, 1350, path.join(SAL, "redes", "post-dos-ramas.png"));
  await render("historia", historia, 1080, 1920, path.join(SAL, "redes", "historia-paquetes.png"));
  await b.close();
})();
