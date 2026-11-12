# CloudTelemetry · Dashboard SPA responsivo

Panel de monitoreo de servidores e instancias cloud. Práctica integral de Diseño de Interfaces: HTML5 semántico, CSS nativo (Grid + Flexbox) y JavaScript vanilla, **sin frameworks CSS**.

- Prototipo en Figma: ver [`docs/FASE1.md`](docs/FASE1.md)
- Reporte técnico de validación: [`docs/REPORTE_VALIDACION.md`](docs/REPORTE_VALIDACION.md) (PDF: `docs/REPORTE_VALIDACION.pdf`)

## Cómo ejecutarlo

Abre `index.html` en el navegador. No requiere servidor ni instalación. La galería de estados de los controles está en `estados.html`.

## Estructura

```
├── index.html            # Marcado semántico: Zona 1, Zona 2 y Zona 3
├── estados.html          # Galería de los 5 estados de cada control
├── css/
│   ├── tokens.css        # Variables, modo oscuro (prefers-color-scheme + data-theme)
│   ├── base.css          # Reset, tipografía, utilidades, reduced-motion
│   ├── layout.css        # Grid macro, header, sidebar, Bento Grid (mobile-first)
│   ├── controles.css     # Botones, switches, campos
│   ├── componentes.css   # Tarjetas, gráfica, tabla, popover
│   ├── superposiciones.css  # Toast, drawer, modal
│   ├── navegacion.css    # Orientación: dónde estoy / de dónde vengo
│   └── estados.css       # Loading, microinteracciones, áreas táctiles
├── js/
│   ├── tema.js           # Tema claro/oscuro
│   ├── toast.js          # Notificaciones
│   ├── overlays.js       # Drawer/modal/menú: foco, Escape, capa oscura
│   ├── grafica.js        # Gráfica SVG
│   ├── navegacion.js     # Menú activo, breadcrumbs, "Volver"
│   ├── tabla.js          # Filtros, paginación, acciones críticas
│   ├── formulario.js     # Validación y estado Loading
│   └── estados.js        # Tema para la galería
└── docs/                 # Documentación por fase, reporte y capturas (docs/img)
```

Los CSS se cargan en el orden de la lista (el orden importa por la cascada) y los JS comparten el espacio `window.CT`.

## Responsive (mobile-first)

| Ancho | Layout |
|---|---|
| base (< 768 px) | 1 columna, sidebar off-canvas, filas de tabla como tarjetas |
| ≥ 768 px | Bento de 2 columnas, tabla real |
| ≥ 1024 px | Sidebar fijo + Bento de 3 columnas, popover de detalle |

## Documentación por fase

| Fase | Documento |
|---|---|
| 1 · UX y prototipado | `docs/FASE1.md` |
| 2 · Layout y mobile-first | `docs/FASE2.md` |
| 3 · Tres zonas | `docs/FASE3.md` |
| 4 · Controles, estados y tendencias | `docs/FASE4.md` |
| 5 · Cinco dimensiones de IxD | `docs/FASE5.md` |

## Atajos y comportamiento

- `Esc` cierra el panel superior (no mientras una acción está en curso).
- `Tab` queda atrapado en el modal, drawer o menú abierto; el foco vuelve a quien lo abrió.
- Tema: respeta `prefers-color-scheme` hasta que se use el toggle; luego recuerda la elección.
