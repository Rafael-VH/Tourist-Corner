# Actions Components

Componentes para interacción del usuario: botones, toggles y atajos de teclado.

---

## Button

- **Archivo:** `button.tsx`
- **Descripción:** Botón con variantes (default, destructive, outline, secondary, ghost, link) y tamaños (sm, default, lg, icon, icon-sm, icon-lg). Soporta `asChild` para renderizar como Slot de Radix.
- **Props:** `variant`, `size`, `asChild`, `className` + props nativas de `<button>`.
- **Usado por:** `button-group.tsx`, `pagination.tsx`, `sidebar.tsx`, `calendar.tsx`, `carousel.tsx`, `input-group.tsx`, `alert-dialog.tsx`

## ButtonGroup

- **Archivo:** `button-group.tsx`
- **Descripción:** Agrupa múltiples botones horizontalmente con separadores.
- **Usado por:** (ningún otro componente UI)

## Kbd

- **Archivo:** `kbd.tsx`
- **Descripción:** Representa visualmente una tecla o atajo de teclado.
- **Usado por:** (ningún otro componente UI)

## Toggle

- **Archivo:** `toggle.tsx`
- **Descripción:** Botón de dos estados (on/off) con variantes de tamaño y estilo.
- **Props:** `variant`, `size`, `pressed`, `onChange` + props de Toggle de Radix.
- **Usado por:** `toggle-group.tsx`

## ToggleGroup

- **Archivo:** `toggle-group.tsx`
- **Descripción:** Grupo de toggles mutuamente excluyentes o múltiples.
- **Usado por:** (ningún otro componente UI)

## Variantes (no componentes)

- **button-variants.ts** — Define las variantes visuales de Button via CVA.
- **toggle-variants.ts** — Define las variantes visuales de Toggle via CVA.
