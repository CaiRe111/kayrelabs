fetch("data/proyectos.json")
  .then(response => response.json())
  .then(proyectos => {
    const contenedor = document.getElementById("lista-proyectos");
    if (!contenedor) return;

    proyectos.forEach(proyecto => {
      contenedor.innerHTML += `
        <div class="col-md-4">
          <div class="card h-100">
            <img src="${proyecto.imagen}" class="card-img-top" alt="${proyecto.titulo}">
            <div class="card-body">
              <h3 class="h5">${proyecto.titulo}</h3>
              <p>${proyecto.descripcion}</p>
              <a href="${proyecto.url}" class="btn btn-primary">Ver proyecto</a>
            </div>
          </div>
        </div>
      `;
    });
  });