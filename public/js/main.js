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

// Inicio: las áreas orbitan el logo como electrones (modelo atómico)
const orbita = document.querySelector(".orbita");
if (orbita && !sinMovimiento) {
  const RELACION = 0.5; // alto / ancho de las elipses (igual que en el CSS)
  const PERIODOS = [2.5, 3.2, 4]; // segundos por vuelta de cada órbita
  const anillos = [...orbita.querySelectorAll(".orbita-anillo")].map((a) => {
    const grados = parseFloat(a.dataset.t);
    a.style.transform = "rotate(" + grados + "deg)";
    return (grados * Math.PI) / 180;
  });
  const electrones = [...orbita.querySelectorAll(".orbita-i")].map((el) => ({
    el,
    anillo: Number(el.dataset.anillo),
    fase: Number(el.dataset.fase) * 2 * Math.PI,
  }));
  orbita.classList.add("orbita-atomo");

  let tiempo = 0; // se detiene suavemente mientras el puntero está sobre un icono
  let velocidad = 1;
  let objetivo = 1;
  let previo = performance.now();
  // Se detienen en cuanto el puntero se acerca al átomo (toda la columna), no solo sobre un icono
  const zona = orbita.parentElement;
  zona.addEventListener("pointerenter", () => { objetivo = 0; });
  zona.addEventListener("pointerleave", () => { objetivo = 1; });
  orbita.addEventListener("focusin", () => { objetivo = 0; });
  orbita.addEventListener("focusout", () => { objetivo = 1; });

  const pintar = (ahora) => {
    const dt = Math.min((ahora - previo) / 1000, 0.1);
    previo = ahora;
    velocidad += (objetivo - velocidad) * 0.3;
    if (velocidad < 0.02) velocidad = 0; // detenidos del todo: así se puede hacer clic en cualquier icono
    tiempo += dt * velocidad;
    const a = orbita.clientWidth * 0.44;
    const b = a * RELACION;
    for (const e of electrones) {
      const ang = e.fase + (tiempo * 2 * Math.PI) / PERIODOS[e.anillo];
      const x0 = a * Math.cos(ang);
      const y0 = b * Math.sin(ang);
      const t = anillos[e.anillo];
      const x = x0 * Math.cos(t) - y0 * Math.sin(t);
      const y = x0 * Math.sin(t) + y0 * Math.cos(t);
      const profundidad = (Math.sin(ang) + 1) / 2; // 1 = adelante, 0 = detrás del núcleo
      e.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) scale(" + (0.86 + 0.14 * profundidad).toFixed(3) + ")";
      // Al detenerse, todos pasan al frente y a plena opacidad para poder elegirlos
      const frente = Math.max(profundidad, 1 - velocidad);
      e.el.style.opacity = (0.7 + 0.3 * frente).toFixed(2);
      e.el.style.zIndex = velocidad < 0.5 || profundidad > 0.5 ? 2 : 0;
    }
    requestAnimationFrame(pintar);
  };
  requestAnimationFrame(pintar);
}

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

const contenedor = document.getElementById("lista-proyectos");

if (contenedor) {
  const area = contenedor.dataset.area;
  // "marco": fotos enmarcadas (Diseño) · "terminal": tarjetas tipo ventana (Electrónica, Desarrollo)
  const estilo = contenedor.dataset.estilo;

  // Visor de imagen (modal de Bootstrap)
  const visorEl = document.createElement("div");
  visorEl.className = "modal fade visor";
  visorEl.tabIndex = -1;
  visorEl.setAttribute("data-bs-theme", "dark");
  visorEl.innerHTML =
    '<div class="modal-dialog modal-dialog-centered modal-xl"><div class="modal-content">' +
    '<div class="modal-header border-0"><h2 class="modal-title h5"></h2>' +
    '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button></div>' +
    '<div class="modal-body pt-0"><img alt=""></div></div></div>';
  document.body.append(visorEl);
  const visor = new bootstrap.Modal(visorEl);

  // Un proyecto con "galeria" muestra todas sus imágenes y videos; si no, solo su imagen
  const cuerpoVisor = visorEl.querySelector(".modal-body");
  const abrir = (p) => {
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
  visorEl.addEventListener("hidden.bs.modal", () => cuerpoVisor.replaceChildren());

  const el = (tag, clase, texto) => {
    const nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (texto) nodo.textContent = texto;
    return nodo;
  };

  // Aviso "Sitio en desarrollo": se muestra sobre la sección desenfocada (proyectos con "mantenimiento": true)
  let aviso;
  let origenAviso;
  const cerrarAviso = () => {
    if (!aviso || aviso.hidden) return;
    aviso.hidden = true;
    document.body.classList.remove("aviso-abierto");
    if (origenAviso) origenAviso.focus();
  };
  const abrirAviso = (desde) => {
    if (!aviso) {
      aviso = el("div", "aviso-sitio");
      aviso.hidden = true;
      const caja = el("div", "aviso-caja");
      caja.setAttribute("role", "dialog");
      caja.setAttribute("aria-modal", "true");
      caja.setAttribute("aria-labelledby", "aviso-titulo");
      const icono = el("span", "icono i-desarrollo");
      icono.setAttribute("aria-hidden", "true");
      const titulo = el("h2", "", "Sitio en desarrollo");
      titulo.id = "aviso-titulo";
      const entendido = el("button", "btn btn-primary", "Entendido");
      entendido.type = "button";
      entendido.addEventListener("click", cerrarAviso);
      caja.append(icono, titulo, el("p", "", "Estamos actualizando esta página. Volverá a estar disponible muy pronto."), entendido);
      aviso.append(caja);
      aviso.addEventListener("click", (e) => { if (e.target === aviso) cerrarAviso(); });
      document.addEventListener("keydown", (e) => {
        if (aviso.hidden) return;
        if (e.key === "Escape") cerrarAviso();
        if (e.key === "Tab") { e.preventDefault(); entendido.focus(); } // único control: el foco se queda dentro
      });
      document.body.append(aviso);
    }
    origenAviso = desde;
    aviso.hidden = false;
    document.body.classList.add("aviso-abierto");
    aviso.querySelector("button").focus();
  };

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
        const demo = el("a", "ver-demo", "Ver demo ↗");
        demo.href = p.enlace;
        demo.target = "_blank";
        demo.rel = "noopener";
        if (p.mantenimiento) demo.addEventListener("click", (e) => { e.preventDefault(); abrirAviso(demo); });
        acciones.append(demo);
      }
      if (p.galeria) {
        const gal = el("button", "ver-demo", "Ver demo en video");
        gal.type = "button";
        gal.addEventListener("click", () => (p.mantenimiento ? abrirAviso(gal) : abrir(p)));
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
      const proyectos = todos.filter((p) => p.area === area);
      const nodos = proyectos.map((p) => {
        const nodo = estilo === "terminal" ? tarjetaTerminal(p) : piezaDiseno(p);
        nodo.dataset.categoria = p.categoria;

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

      const filtros = document.getElementById("filtros");
      if (filtros) {
        filtros.addEventListener("click", (e) => {
          const boton = e.target.closest("button[data-filtro]");
          if (!boton) return;
          filtros.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === boton));
          const f = boton.dataset.filtro;
          nodos.forEach((n) => (n.hidden = f !== "todos" && n.dataset.categoria !== f));
        });
      }
    })
    .catch(() => {
      contenedor.textContent = "No se pudieron cargar los proyectos.";
    });
}
