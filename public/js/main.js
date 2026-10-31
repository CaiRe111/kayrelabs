// ---------- WhatsApp ----------
// Número con indicativo de país, sin "+" ni espacios (ej.: "573001234567").
// Vacío: los botones "Cotizar" y "Pedir" llevan a contacto.html.
const WHATSAPP = "";

const enlaceWhatsapp = (mensaje) => "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(mensaje);
const activarWhatsapp = (raiz) => {
  if (!WHATSAPP) return;
  raiz.querySelectorAll("[data-whatsapp]").forEach((a) => {
    a.href = enlaceWhatsapp(a.dataset.whatsapp);
    a.target = "_blank";
    a.rel = "noopener";
  });
};
activarWhatsapp(document);
if (WHATSAPP) document.querySelectorAll("[data-solo-whatsapp]").forEach((n) => (n.hidden = false));

const anio = document.getElementById("anio");
if (anio) anio.textContent = new Date().getFullYear();

// Inicio: la tarjeta del creador muestra el logo y gira a la foto al hacer clic;
// a los 5 segundos vuelve sola al logo
const giro = document.querySelector(".retrato-giro");
if (giro) {
  let temporizador;
  const girar = (girado) => {
    clearTimeout(temporizador);
    giro.classList.toggle("girado", girado);
    giro.setAttribute("aria-pressed", String(girado));
    giro.setAttribute("aria-label", girado ? "Ver el logo de KayreLabs" : "Ver la foto del creador de KayreLabs");
    if (girado) temporizador = setTimeout(() => girar(false), 5000);
  };
  giro.addEventListener("click", () => girar(!giro.classList.contains("girado")));
}

const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Inicio y áreas: el brillo verde y la retícula de puntos del encabezado siguen al ratón
document.querySelectorAll(".hero-vivo").forEach((portada) => {
  if (sinMovimiento) return;
  const reposo = () => ({ x: portada.clientWidth * 0.88, y: 0 });
  let meta = reposo();
  let actual = { ...meta };
  let activo = false;
  const mover = () => {
    actual.x += (meta.x - actual.x) * 0.08;
    actual.y += (meta.y - actual.y) * 0.08;
    portada.style.setProperty("--mx", actual.x.toFixed(1) + "px");
    portada.style.setProperty("--my", actual.y.toFixed(1) + "px");
    if (Math.abs(meta.x - actual.x) > 0.5 || Math.abs(meta.y - actual.y) > 0.5) requestAnimationFrame(mover);
    else activo = false;
  };
  const arrancar = () => { if (!activo) { activo = true; requestAnimationFrame(mover); } };
  portada.addEventListener("pointermove", (e) => {
    const r = portada.getBoundingClientRect();
    meta = { x: e.clientX - r.left, y: e.clientY - r.top };
    arrancar();
  });
  portada.addEventListener("pointerleave", () => { meta = reposo(); arrancar(); });
  window.addEventListener("resize", () => { if (!activo) { meta = reposo(); actual = { ...meta }; arrancar(); } });
});

// ---------- Visor de imagen (modal de Bootstrap, se crea al primer uso) ----------
let visorEl, visor, cuerpoVisor;
const crearVisor = () => {
  visorEl = document.createElement("div");
  visorEl.className = "modal fade visor";
  visorEl.tabIndex = -1;
  visorEl.setAttribute("data-bs-theme", "dark");
  visorEl.innerHTML =
    '<div class="modal-dialog modal-dialog-centered modal-xl"><div class="modal-content">' +
    '<div class="modal-header border-0"><h2 class="modal-title h5"></h2>' +
    '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button></div>' +
    '<div class="modal-body pt-0"><img alt=""></div></div></div>';
  document.body.append(visorEl);
  visor = new bootstrap.Modal(visorEl);
  cuerpoVisor = visorEl.querySelector(".modal-body");
  visorEl.addEventListener("hidden.bs.modal", () => cuerpoVisor.replaceChildren());
};

// Un proyecto con "galeria" muestra todas sus imágenes y videos; si no, solo su imagen
const abrir = (p) => {
  if (!visorEl) crearVisor();
  visorEl.querySelector(".modal-title").textContent = p.titulo;
  cuerpoVisor.replaceChildren();
  (p.galeria || [p]).forEach((g) => {
    let medio;
    if (g.video) {
      medio = document.createElement("video");
      medio.src = g.video;
      medio.poster = g.poster;
      medio.preload = "none";
      medio.muted = true;
      medio.playsInline = true;
      if (g.controles) medio.controls = true;
      else {
        medio.loop = true;
        medio.autoplay = true;
      }
      medio.setAttribute("aria-label", g.titulo);
    } else {
      medio = document.createElement("img");
      medio.src = g.imagen;
      medio.alt = g.titulo;
    }
    cuerpoVisor.append(medio);
    if (p.galeria) {
      const pie = document.createElement("p");
      pie.className = "pie-visor";
      pie.textContent = g.titulo;
      cuerpoVisor.append(pie);
    }
  });
  visor.show();
};

const el = (tag, clase, texto) => {
  const nodo = document.createElement(tag);
  if (clase) nodo.className = clase;
  if (texto) nodo.textContent = texto;
  return nodo;
};

const contenedor = document.getElementById("lista-proyectos");

if (contenedor) {
  // Una galería puede reunir varias áreas separadas por espacios (Kayre Labs: impresión 3D, electrónica y domótica)
  const areas = contenedor.dataset.area.split(" ");
  // "marco": fotos enmarcadas (Diseño) · "terminal": tarjetas tipo ventana (Electrónica, Desarrollo)
  const estilo = contenedor.dataset.estilo;

  const imagen = (p) => {
    const img = el("img");
    img.src = p.imagen;
    img.alt = p.titulo;
    img.loading = "lazy";
    return img;
  };

  // Diseño: marcos tipo foto
  const piezaDiseno = (p) => {
    const f = el("figure", "pieza " + p.categoria);
    f.append(imagen(p), el("figcaption", "", p.titulo));
    return f;
  };

  // Electrónica y Desarrollo: tarjetas tipo ventana de terminal
  const tarjetaTerminal = (p) => {
    // "ajuste": "completo" muestra la imagen entera (infografías) en vez de recortarla
    const a = el("article", p.ajuste === "completo" ? "tarjeta completa" : "tarjeta");
    const barra = el("div", "barra");
    barra.append(el("i"), el("i"), el("i"), el("span", "", "[" + p.categoria + "]"));
    const vista = el("div", "vista");
    vista.append(imagen(p));
    const cuerpo = el("div", "cuerpo");
    cuerpo.append(el("h3", "", p.titulo), el("p", "", p.descripcion));
    if (p.etiquetas) {
      const lista = el("div", "etiquetas");
      p.etiquetas.forEach((e) => lista.append(el("span", "", e)));
      cuerpo.append(lista);
    }
    if (p.enlace || p.galeria) {
      const acciones = el("div", "acciones");
      if (p.enlace) {
        const demo = el("a", "ver-demo", (p.textoEnlace || "Ver demo") + " ↗");
        demo.href = p.enlace;
        demo.target = "_blank";
        demo.rel = "noopener";
        acciones.append(demo);
      }
      if (p.galeria) {
        const conVideo = p.galeria.some((g) => g.video);
        const gal = el("button", "ver-demo", conVideo ? "Ver demo en video" : "Ver galería (" + p.galeria.length + " fotos)");
        gal.type = "button";
        gal.addEventListener("click", () => abrir(p));
        acciones.append(gal);
      }
      cuerpo.append(acciones);
    }
    a.append(barra, vista, cuerpo);
    const sombra = el("div", "tarjeta-sombra");
    sombra.append(a);
    const col = el("div", "col-md-6 col-lg-4");
    col.append(sombra);
    return col;
  };

  fetch("data/proyectos.json")
    .then((r) => r.json())
    .then((todos) => {
      const proyectos = todos.filter((p) => areas.includes(p.area));
      const nodos = proyectos.map((p) => {
        const nodo = estilo === "terminal" ? tarjetaTerminal(p) : piezaDiseno(p);
        nodo.dataset.categoria = p.categoria;
        nodo.dataset.area = p.area;

        // Accesible con teclado: Enter o espacio abren el visor.
        // Si la tarjeta ya trae enlaces o botones propios, el clic abre el visor pero
        // la tarjeta no se vuelve un botón (evita controles anidados).
        const activador = estilo === "terminal" ? nodo.querySelector(".tarjeta-sombra") : nodo;
        const conControles = Boolean(p.enlace || p.galeria);
        if (!conControles) {
          activador.tabIndex = 0;
          activador.setAttribute("role", "button");
          activador.setAttribute("aria-label", "Ampliar: " + p.titulo);
          activador.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              abrir(p);
            }
          });
        }
        activador.addEventListener("click", (e) => {
          if (!e.target.closest("a, button")) abrir(p);
        });

        contenedor.append(nodo);
        return nodo;
      });

      // Aviso cuando un filtro (o el área entera) aún no tiene proyectos
      const vacio = el("p", "galeria-vacia", "Estoy preparando esta galería. Pronto verás proyectos aquí.");
      vacio.hidden = nodos.length > 0;
      contenedor.after(vacio);

      const filtros = document.getElementById("filtros");
      if (filtros) {
        filtros.addEventListener("click", (e) => {
          const boton = e.target.closest("button[data-filtro]");
          if (!boton) return;
          filtros.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === boton));
          const f = boton.dataset.filtro;
          nodos.forEach((n) => (n.hidden = f !== "todos" && n.dataset.categoria !== f && n.dataset.area !== f));
          vacio.hidden = nodos.some((n) => !n.hidden);
        });
        // Kayre Labs: "Ver proyectos de…" aplica el filtro de esa área y baja a la galería
        document.querySelectorAll("[data-ver-filtro]").forEach((b) =>
          b.addEventListener("click", () => {
            filtros.querySelector('[data-filtro="' + b.dataset.verFiltro + '"]').click();
            document.getElementById("proyectos").scrollIntoView({ behavior: sinMovimiento ? "auto" : "smooth" });
          })
        );
      }
    })
    .catch(() => {
      contenedor.textContent = "No se pudieron cargar los proyectos.";
    });
}

// ---------- Tienda: catálogo desde data/tienda.json, pedido por WhatsApp ----------
const tienda = document.getElementById("lista-tienda");
if (tienda) {
  const pesos = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

  const articulo = (a) => {
    const col = el("div", "col-sm-6 col-lg-4 col-xl-3");
    col.dataset.categoria = a.categoria;
    const tarjeta = el("article", "articulo");

    const foto = el("button", "articulo-foto border-0 p-0");
    foto.type = "button";
    foto.setAttribute("aria-label", "Ver fotos: " + a.nombre);
    const img = el("img");
    img.src = a.imagen;
    img.alt = a.nombre;
    img.loading = "lazy";
    img.width = 600;
    img.height = 600;
    foto.append(img, el("span", "articulo-cat", a.categoria));
    foto.addEventListener("click", () =>
      abrir({ titulo: a.nombre, galeria: (a.fotos || [a.imagen]).map((f, i) => ({ imagen: f, titulo: a.nombre + " · foto " + (i + 1) })) })
    );

    const cuerpo = el("div", "articulo-cuerpo");
    cuerpo.append(el("h3", "", a.nombre), el("p", "", a.descripcion));
    const pie = el("div", "articulo-pie");
    const precio = a.precio ? el("span", "articulo-precio", pesos.format(a.precio)) : el("span", "articulo-precio consultar", "Precio a consultar");
    const pedir = el("a", "btn btn-primary btn-sm", "Pedir ");
    pedir.href = "contacto.html";
    pedir.dataset.whatsapp = "Hola KayreLabs, quiero pedir: " + a.nombre;
    const icono = el("span", "icono i-whatsapp");
    icono.setAttribute("aria-hidden", "true");
    pedir.append(icono);
    pie.append(precio, pedir);
    cuerpo.append(pie);

    tarjeta.append(foto, cuerpo);
    col.append(tarjeta);
    return col;
  };

  fetch("data/tienda.json")
    .then((r) => r.json())
    .then((articulos) => {
      const nodos = articulos.map(articulo);
      tienda.append(...nodos);
      activarWhatsapp(tienda);

      // Filtros por categoría (se crean a partir de los datos)
      const filtros = document.getElementById("filtros-tienda");
      [...new Set(articulos.map((a) => a.categoria))].forEach((c) => {
        const b = el("button", "btn btn-outline-dark btn-sm rounded-pill", c);
        b.dataset.filtro = c;
        filtros.append(b);
      });
      filtros.addEventListener("click", (e) => {
        const boton = e.target.closest("button[data-filtro]");
        if (!boton) return;
        filtros.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === boton));
        nodos.forEach((n) => (n.hidden = boton.dataset.filtro !== "todos" && n.dataset.categoria !== boton.dataset.filtro));
      });
    })
    .catch(() => {
      tienda.textContent = "No se pudo cargar el catálogo.";
    });
}
