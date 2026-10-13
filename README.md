# KayreLabs

Sitio web de KayreLabs (impresión 3D, electrónica, domótica, desarrollo y diseño): HTML estático con Bootstrap y Sass, servido por un servidor Node mínimo en `127.0.0.1:8181` (el dominio `www.kayrelabs.com` llega por cloudflared).

## Estructura

| Ruta | Qué es |
| --- | --- |
| `public/` | El sitio: páginas `.html`, `css/` (compilado), `js/`, `data/proyectos.json` y `assets/` |
| `scss/` | Estilos. Colores y tipografías de la marca: `scss/_marca.scss` |
| `scripts/vendor.js` | Copia el JS de Bootstrap y las fuentes desde `node_modules` a `public/` |
| `server.js` · `ecosystem.config.js` | Servidor estático y configuración de PM2 |

## Desarrollo

```bash
npm install      # solo la primera vez o cuando cambie package.json
npm run build    # compila scss/ → public/css/style.css y copia Bootstrap JS y fuentes
npm start        # http://127.0.0.1:8181
```

`public/css/style.css` es un archivo generado: edita `scss/` y vuelve a ejecutar `npm run build`.
Bootstrap se importa por módulos en `scss/style.scss`; si necesitas otro componente, agrega su `@import` ahí.

## Despliegue en el servidor (Windows + PM2)

```bash
cd "C:\Users\PC\Documents\1. Proyectos\ClaudeCode\kayrelabs"
git restore public/css/style.css
git pull origin main
npm install
npm run build
pm2 restart kayrelabs
```

La primera vez, o si cambia `ecosystem.config.js`: `pm2 start ecosystem.config.js` y `pm2 save`.
Después, recarga el navegador con Ctrl+F5 (las imágenes se guardan en caché un día).

## Contenido

- **Proyectos:** `public/data/proyectos.json`. Cada elemento lleva `area` (`diseno`, `electronica` o `desarrollo`), `categoria`, `titulo`, `descripcion` e `imagen`. Las imágenes viven en `public/assets/img/`.
- **Impresión 3D y Domótica** aún no tienen galería. Para activarla, reemplaza el bloque `.vacio` de la página por `<div id="lista-proyectos" class="row g-4" data-area="..." data-estilo="terminal"></div>` y agrega los proyectos al JSON con esa `area`.
- **Redes sociales:** reemplaza los `href="#"` por las URL reales en `contacto.html` y en el pie de cada página.
- **Menú y pie:** están repetidos en cada `.html`; si cambias uno, cámbialo en todas las páginas.
- **Identidad de marca:** `public/marca.html` documenta logotipos, paleta, tipografía y recursos descargables (`public/assets/brand/`).
- 
