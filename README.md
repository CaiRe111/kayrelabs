# KayreLabs

Sitio web de KayreLabs (impresión 3D, electrónica, domótica, desarrollo y diseño): HTML estático con Bootstrap y Sass, publicado en Cloudflare (Workers Static Assets) en `www.kayrelabs.com`. Cada push a `main` se despliega solo.

## Estructura

| Ruta | Qué es |
| --- | --- |
| `public/` | El sitio: páginas `.html`, `css/` (compilado), `js/`, `data/proyectos.json` y `assets/` |
| `scss/` | Estilos. Colores y tipografías de la marca: `scss/_marca.scss` |
| `scripts/vendor.js` | Copia el JS de Bootstrap y las fuentes desde `node_modules` a `public/` |
| `wrangler.jsonc` | Configuración de Cloudflare: publica la carpeta `public/` |
| `server.js` | Servidor local mínimo, solo para previsualizar (`npm start`) |
| `docs/marca/` | Kit de marca: guía en Markdown y PDF, y copia de logotipos, iconos, ilustraciones, fondos y tipografías. No se publica en el sitio |

## Desarrollo

```bash
npm install      # solo la primera vez o cuando cambie package.json
npm run build    # compila scss/ → public/css/style.css y copia Bootstrap JS y fuentes
npm start        # vista previa local en http://127.0.0.1:8181
```

`public/css/style.css` es un archivo generado: edita `scss/` y vuelve a ejecutar `npm run build`.
Bootstrap se importa por módulos en `scss/style.scss`; si necesitas otro componente, agrega su `@import` ahí.

## Despliegue (Cloudflare)

Se publica solo al hacer push a `main`: Cloudflare ejecuta `npm run build` y luego `npx wrangler deploy`
(configuración en `wrangler.jsonc`, cabeceras y caché en `public/_headers`, página de error en `public/404.html`).
El estado de cada despliegue está en Cloudflare → Workers y Pages → kayrelabs → Implementaciones.

## Contenido

- **Proyectos:** `public/data/proyectos.json`. Cada elemento lleva `area` (`diseno`, `electronica`, `desarrollo` o `impresion-3d`), `categoria`, `titulo`, `descripcion` e `imagen`. Las imágenes viven en `public/assets/img/`.
- **Galerías:** Diseño, Electrónica, Desarrollo e Impresión 3D ya tienen galería. **Domótica** aún no: para activarla, reemplaza el bloque `.vacio` de `domotica.html` por `<div id="lista-proyectos" class="row g-4" data-area="domotica" data-estilo="terminal"></div>` y agrega los proyectos al JSON con `"area": "domotica"`.
- **Redes sociales:** reemplaza los `href="#"` por las URL reales en `contacto.html` y en el pie de cada página.
- **Menú y pie:** están repetidos en cada `.html`; si cambias uno, cámbialo en todas las páginas.
- **Identidad de marca:** `public/marca.html` documenta logotipos, paleta, tipografía y recursos descargables (`public/assets/brand/`). La guía completa (`docs/marca/MARCA-KAYRELABS.pdf` y `.md`) y una copia de todos los archivos gráficos están en `docs/marca/`.
