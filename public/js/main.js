const anio = document.getElementById("anio");
if (anio) anio.textContent = new Date().getFullYear();

const contenedor = document.getElementById("lista-proyectos");

if (contenedor) {
  const rama = contenedor.dataset.rama;

  fetch("data/proyectos.json")
    .then((r) => r.json())
    .then((proyectos) => {
      proyectos
        .filter((p) => p.rama === rama)
        .forEach((p) => {
          const col = document.createElement("div");
          col.className = "col-md-6 col-lg-4";

          const card = document.createElement("article");
          card.className = "card card-proyecto h-100";

          const img = document.createElement("img");
          img.className = "card-img-top";
          img.src = p.imagen;
          img.alt = p.titulo;
          img.loading = "lazy";

          const body = document.createElement("div");
          body.className = "card-body";
          const h = document.createElement("h2");
          h.className = "h5";
          h.textContent = p.titulo;
          const d = document.createElement("p");
          d.textContent = p.descripcion;
          body.append(h, d);

          card.append(img, body);
          col.append(card);
          contenedor.append(col);
        });
    })
    .catch(() => {
      contenedor.textContent = "No se pudieron cargar los proyectos.";
    });
}
