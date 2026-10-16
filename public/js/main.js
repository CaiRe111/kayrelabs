const anio = document.getElementById("anio");
if (anio) anio.textContent = new Date().getFullYear();

// Inicio: la tarjeta del creador muestra el logo y gira a la foto solo al hacer clic
const giro = document.querySelector(".retrato-giro");
if (giro) {
  giro.addEventListener("click", () => {
    const girado = giro.classList.toggle("girado");
    giro.setAttribute("aria-pressed", String(girado));
    giro.setAttribute("aria-label", girado ? "Ver el logo de KayreLabs" : "Ver la foto del creador de KayreLabs");
  });
}

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
        acciones.append(demo);
      }
      if (p.galeria) {
        const gal = el("button", "ver-demo", "Ver demo en video");
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
