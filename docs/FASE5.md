# Fase 5 · Las 5 dimensiones del Diseño de Interacción (IxD)

Cada afirmación de este documento se verificó sobre el proyecto (código y mediciones en Chromium a 390 px y 1440 px).

## 1D · Palabras

| Criterio | Aplicación | Ejemplo real |
|---|---|---|
| Etiquetas claras y visibles | Todo campo tiene `<label>` y ayuda debajo | "Nombre del servidor" + "Mínimo 3 caracteres: minúsculas, números o guiones." |
| Botones con verbo + objeto | Dicen qué pasa al pulsarlos | "Guardar cambios", "Reiniciar", "Eliminar", "Cancelar" |
| Microcopia de progreso en gerundio | El botón cambia mientras trabaja | "Guardando…", "Reiniciando…", "Eliminando…" |
| Errores que dicen qué hacer | Sin códigos ni culpa | "Escribe un nombre para el servidor." · "Ese nombre ya existe. Prueba con otro." · "Elige una fecha de hoy en adelante." |
| Confirmaciones que nombran el objeto | El modal repite el servidor afectado | "¿Eliminar srv-prod-05 de forma permanente? Esta acción no se puede deshacer." |
| Feedback de éxito | Toast de 4 s | "srv-prod-01 se reinició correctamente." |
| Estado vacío útil | Explica por qué no hay datos | "No hay instancias que coincidan con tu búsqueda." |
| Texto para lectores de pantalla | `aria-label` en iconos y medidores | "Abrir menú", "Notificaciones: 1 alerta nueva", "76% usada, 24% libre" |

Observación: algunos rótulos están en inglés a propósito (Server, Location, Uptime, Active Instances, Configuration) por ser vocabulario habitual de DevOps; el resto de la interfaz está en español.

## 2D · Representaciones visuales

| Criterio | Aplicación |
|---|---|
| Iconografía consistente | 18 iconos en un único sprite SVG: trazo de 2 px, esquinas redondeadas, `currentColor` y viewBox 24×24. Siempre acompañan a texto o llevan `aria-label` |
| Jerarquía tipográfica | Una familia del sistema (`system-ui`). Métrica principal 2.4 rem › valores medios 1.6 rem › título de página 1.6 rem › títulos de tarjeta 1 rem › cuerpo 0.9–0.95 rem › notas 0.72–0.85 rem. Negrita solo para títulos y datos clave |
| Paleta funcional | Azul = acción y selección. Verde = normal. Ámbar = alerta (≥ 70 % carga). Rojo = crítico y acciones destructivas (≥ 90 %). Gris = neutro y deshabilitado |
| El color nunca va solo | El estado de carga siempre tiene punto + texto ("85% Load", "Crítico"); el foco tiene contorno y no solo cambio de tono |
| Contraste (WCAG AA ≥ 4.5:1 texto, ≥ 3:1 foco) | Texto principal 17.9:1 · secundario 6.2:1 · botón azul 5.2:1 · botón rojo 4.8:1 · verde 5.0:1 · ámbar 5.0:1 · foco claro 5.2:1 · foco oscuro 8.8:1 · secundario oscuro 7.3:1 |
| Tema claro y oscuro | Misma estructura y jerarquía, ver Fase 4 |

## 3D · Objetos físicos (táctil y mouse)

La variable `--touch: 44px` es el mínimo de todo control interactivo.

| Control | Tamaño | Cómo |
|---|---|---|
| Botones `.btn`, `.btn-sm`, `.btn-icon` | ≥ 44×44 px | `min-height`/`width: var(--touch)` |
| Campos, textarea, select, fecha | alto ≥ 44 px | `.form-control` |
| Switch | pista 44×24 px dentro de una fila de 44 px; toda la fila es clicable | `.toggle-row` con `<label>` |
| Ítems del menú, paginación, toggle de tema | ≥ 44 px de alto | `.nav-item`, `.btn-sm` |
| Enlaces del breadcrumb y nombre de servidor | visual de ~24 px, área de toque de 44 px | pseudo-elemento `::after` (se corrigió en esta fase; antes medían 23–24 px) |

Medición automática (`getBoundingClientRect`) en móvil y escritorio: los únicos elementos bajo 44 px visibles eran los dos casos anteriores (ya corregidos con área ampliada) y la pista del switch (24 px de alto visual, 44 px de fila).

Mouse en escritorio: cursor `pointer` en elementos accionables, `not-allowed` en deshabilitados y `progress` en cargando; hover siempre visible con `@media (hover: hover)` para tarjetas, de modo que en táctil no queden "pegados". Botones apilados a todo el ancho en móvil (< 480 px) para pulgar, en fila en pantallas mayores.

## 4D · Tiempo

| Token | Valor | Uso |
|---|---|---|
| `--t-fast` | 200 ms | Hover de botones, switch, menú, foco, popover |
| `--t-base` | 250 ms | Tarjetas, modal, fundido del fondo, toast |
| `--t-slow` | 350 ms | Drawer, sacudida de error, rebote del icono |

Auditoría de todos los elementos del DOM (incluye `::before`/`::after`): las únicas duraciones de transición presentes son **0.2 s, 0.25 s y 0.35 s**. Excepción deliberada: la rotación del spinner (0.7 s por vuelta) es una animación continua, no una transición.

Spinners: botones (`.is-loading::before`), campo de nombre, switch y confirmación del modal; con `aria-busy="true"`. Verificaciones simuladas: 0.9 s (nombre), 1.2 s (guardar), 1.5 s (reiniciar/eliminar). Toast desaparece a los 4 s. `prefers-reduced-motion: reduce` desactiva las animaciones decorativas.

## 5D · Comportamiento

| Situación | Regla del sistema |
|---|---|
| Clic en acción destructiva | Nunca ejecuta directo: abre modal de confirmación con el nombre del servidor. El foco empieza en **Cancelar** (opción segura) |
| Confirmar | Spinner, botones y ✕ deshabilitados, `Esc` y clic fuera ignorados hasta terminar. Luego cierra, actualiza la tabla y muestra toast |
| `Esc` | Cierra el panel superior (modal, drawer o menú móvil), salvo que esté ocupado |
| `Tab` / `Shift+Tab` | Atrapado dentro del panel abierto; al cerrar, el foco regresa al botón que lo abrió (verificado: modal → `Esc` → vuelve a "Reiniciar") |
| Clic en la capa oscura | Cierra el panel (si no está ocupado) |
| Formulario | Valida al enviar y al salir del campo; mueve el foco al primer campo con error; no permite reenviar mientras guarda; el nombre repetido se bloquea |
| Navegación | Menú activo y breadcrumb siguen la posición del scroll; "Volver a…" aparece tras cambiar de vista |
| Tabla | Filtro por texto y estado vuelve a la página 1; "Anterior/Siguiente" se deshabilitan en los extremos |
| Tema | Sigue al sistema hasta que la persona use el toggle; luego recuerda su elección |
| Consistencia | Mismo patrón para toda acción crítica (modal), toda configuración (drawer), todo resultado (toast), y mismo orden de botones: secundario a la izquierda, principal a la derecha |

## Tabla checklist final

| Dimensión | Criterio de la práctica | Evidencia | ✔ |
|---|---|---|---|
| 1D Palabras | Etiquetas, microcopia y errores claros | Tabla 1D | ✔ |
| 2D Visuales | Iconos consistentes, jerarquía, paleta funcional | Sprite de 18 iconos; contrastes AA | ✔ |
| 3D Objetos | Áreas ≥ 44×44 px | Medición y corrección de breadcrumb y nombres de servidor | ✔ |
| 4D Tiempo | 200–350 ms y spinners | Auditoría: solo 0.2 / 0.25 / 0.35 s | ✔ |
| 5D Comportamiento | Esc, foco atrapado, confirmación, consistencia | Prueba de teclado en modal | ✔ |
