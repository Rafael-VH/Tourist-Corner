# Overlays Components

Componentes que se superponen sobre el contenido principal: diálogos, menús y tooltips.

---

## Command

- **Archivo:** `command.tsx`
- **Descripción:** Interfaz de comando con búsqueda, como palette de comandos (Cmd+K).
- **Exports:** `Command`, `CommandDialog`, `CommandEmpty`, `CommandGroup`, `CommandInput`, `CommandItem`, `CommandList`, `CommandSeparator`, `CommandShortcut`.
- **Dependencias UI:** `Dialog`

## ContextMenu

- **Archivo:** `context-menu.tsx`
- **Descripción:** Menú que aparece al hacer click derecho.
- **Exports:** `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuPortal`, `ContextMenuSub`, `ContextMenuSubContent`, `ContextMenuSubTrigger`, `ContextMenuRadioGroup`.

## Dialog

- **Archivo:** `dialog.tsx`
- **Descripción:** Modal genérico con header, footer y botón de cierre.
- **Exports:** `Dialog`, `DialogTrigger`, `DialogClose`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`.
- **Usado por:** `command.tsx`

## Drawer

- **Archivo:** `drawer.tsx`
- **Descripción:** Panel deslizable desde el borde de la pantalla (mobile-first).
- **Exports:** `Drawer`, `DrawerClose`, `DrawerContent`, `DrawerDescription`, `DrawerFooter`, `DrawerHeader`, `DrawerOverlay`, `DrawerTitle`, `DrawerTrigger`.
- **Usado por:** `sidebar.tsx`

## DropdownMenu

- **Archivo:** `dropdown-menu.tsx`
- **Descripción:** Menú desplegable con opciones, checkboxes, radios y submenús.
- **Exports:** `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuGroup`, `DropdownMenuPortal`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, `DropdownMenuRadioGroup`.

## HoverCard

- **Archivo:** `hover-card.tsx`
- **Descripción:** Tarjeta que aparece al hacer hover sobre un elemento.
- **Exports:** `HoverCard`, `HoverCardTrigger`, `HoverCardContent`.

## Menubar

- **Archivo:** `menubar.tsx`
- **Descripción:** Barra de menú estilo desktop (como la barra de macOS).
- **Exports:** `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`, `MenubarSeparator`, `MenubarLabel`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarPortal`, `MenubarSubContent`, `MenubarSubTrigger`, `MenubarGroup`, `MenubarSub`, `MenubarShortcut`.

## Popover

- **Archivo:** `popover.tsx`
- **Descripción:** Panel flotante anclado a un elemento trigger.
- **Exports:** `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`.

## Sheet

- **Archivo:** `sheet.tsx`
- **Descripción:** Panel lateral deslizante (drawer) con posiciones configurables.
- **Exports:** `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`.
- **Usado por:** `sidebar.tsx`

## Tooltip

- **Archivo:** `tooltip.tsx`
- **Descripción:** Tooltip informativo al hacer hover o focus.
- **Exports:** `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`.
- **Usado por:** `sidebar.tsx`
