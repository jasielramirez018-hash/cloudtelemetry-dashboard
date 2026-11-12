# Fase 2 · Arquitectura del layout y estrategia Mobile-First

## 1. Estrategia Mobile-First

Las reglas base de `css/` están escritas para celular. Después se amplían con media queries `min-width`, y no queda ningún `max-width` en las media queries.

| Punto de quiebre | Qué cambia |
|---|---|
| Base (< 480 px) | Una columna. Sidebar en panel lateral que se abre con ☰. Filas de la tabla como tarjetas. Botones de modal y drawer apilados a todo el ancho |
| ≥ 480 px | Los botones de modal y drawer pasan a fila |
| ≥ 768 px | Bento de 2 columnas. La tabla es una tabla real, con encabezados. Más espacio interior |
| ≥ 1024 px | Sidebar fija a la izquierda. Bento de 3 columnas. Breadcrumbs, saludo, campana y gráfica grande. Popover de detalle del servidor |

Lo que solo existe en escritorio (`.desktop-only`) está oculto de base y se muestra desde 1024 px. Lo que solo existe en móvil (`.mobile-only`) se oculta desde 1024 px.

## 2. Maquetación bidimensional (CSS Grid)

**Cuadrícula macro (`.app-layout`)**

| Ancho | `grid-template-columns` |
|---|---|
| < 1024 px | `minmax(0, 1fr)`: una columna, la sidebar queda fuera del flujo |
| ≥ 1024 px | `var(--sidebar-w) minmax(0, 1fr)`: sidebar de 240 px y contenido |

**Bento Grid (`.bento-grid`)**

| Ancho | Columnas | Distribución |
|---|---|---|
| < 768 px | 1 | Las tarjetas se apilan: CPU, RAM, Bandwidth, tabla |
| 768 a 1023 px | 2 | CPU y tabla ocupan las 2 columnas. RAM y Bandwidth van lado a lado |
| ≥ 1024 px | 3 | CPU ocupa 2 columnas y 2 filas. RAM y Bandwidth se apilan en la columna 3. La tabla ocupa las 3 columnas |

```
≥ 1024 px
┌───────────────┬───────┐
│               │  RAM  │
│      CPU      ├───────┤
│               │  BW   │
├───────────────┴───────┤
│  Active Instances     │
└───────────────────────┘
```

Otros usos de Grid: la gráfica grande (`.chart-full`, ejes + área de trazado) y las filas de la tabla en móvil, que usan `grid-template-areas` para ordenar nombre, acción, uptime y carga.

## 3. Maquetación unidimensional (Flexbox)

| Componente | Selector | Uso |
|---|---|---|
| Barra superior | `.app-header`, `.header-left`, `.header-right` | `justify-content: space-between` y `align-items: center` |
| Grupos de botones | `.pager`, `.modal-actions`, `.drawer-footer` | Fila con `gap`. Columna invertida en móvil |
| Iconos alineados con texto | `.btn`, `.nav-item`, `.badge`, `.server-id`, `.load` | `inline-flex` o `flex` con `align-items: center` |
| Tarjetas individuales | `.card` | Columna con `gap`. `.card-header` en fila con `space-between` |
| Sidebar | `.app-sidebar`, `.sidebar-nav` | Columna que ocupa toda la altura. El pie queda abajo |
| Filtros de la tabla | `.table-toolbar` | Fila con `flex-wrap`. Se apila sola cuando no cabe |

## 4. Pruebas

Probado en Chrome con tema oscuro.

| Ancho | Columnas del Bento | Columnas del layout | Sidebar | Scroll horizontal |
|---|---|---|---|---|
| 320 px | 1 | 1 | Panel (☰) | No |
| 390 px | 1 | 1 | Panel (☰) | No |
| 768 px | 2 | 1 | Panel (☰) | No |
| 1024 px | 3 | 2 | Fija | No |
| 1440 px | 3 | 2 | Fija | No |

Evidencias: `img/f2-movil-390.png`, `img/f2-tableta-768.png` e `img/f2-escritorio-1440.png`.
