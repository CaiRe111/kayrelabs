const anio = document.getElementById("anio");
if (anio) anio.textContent = new Date().getFullYear();

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

  const abrir = (p) => {
    visorEl.querySelector(".modal-title").textContent = p.titulo;
    const img = visorEl.querySelector("img");
    img.src = p.imagen;
    img.alt = p.titulo;
    visor.show();
  };

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
    const a = el("article", "tarjeta");
    const barra = el("div", "barra");
    barra.append(el("i"), el("i"), el("i"), el("span", "", "[" + p.categoria + "]"));
    const vista = el("div", "vista");
    vista.append(imagen(p));
    const cuerpo = el("div", "cuerpo");
    cuerpo.append(el("h3", "", p.titulo), el("p", "", p.descripcion));
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

        // Accesible con teclado: Enter o espacio abren el visor
        const activador = estilo === "terminal" ? nodo.querySelector(".tarjeta-sombra") : nodo;
        activador.tabIndex = 0;
        activador.setAttribute("role", "button");
        activador.setAttribute("aria-label", "Ampliar: " + p.titulo);
        activador.addEventListener("click", () => abrir(p));
        activador.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrir(p);
          }
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
