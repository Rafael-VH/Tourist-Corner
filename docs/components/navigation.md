# Navigation Components

Componentes para navegación y estructura de rutas de la aplicación.

---

## Breadcrumb

- **Archivo:** `breadcrumb.tsx`
- **Descripción:** Indicador de ruta con links de navegación jerárquica.
- **Exports:** `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`.
- **Usado por:** (ningún otro componente UI)

## NavigationMenu

- **Archivo:** `navigation-menu.tsx`
- **Descripción:** Menú de navegación con submenús y animaciones.
- **Exports:** `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport`.
- **Usado por:** (ningún otro componente UI)

## Pagination

- **Archivo:** `pagination.tsx`
- **Descripción:** Controles de paginación con botones de anterior/siguiente y números de página.
- **Exports:** `Pagination`, `PaginationContent`, `PaginationEllipsis`, `PaginationItem`, `PaginationLink`, `PaginationNext`, `PaginationPrevious`.
- **Dependencias UI:** `Button`, `buttonVariants`
- **Usado por:** (ningún otro componente UI)

## Sidebar

- **Archivo:** `sidebar.tsx`
- **Descripción:** Barra lateral con menú, colapsable y responsive. Incluye drawer para móvil.
- **Exports:** `Sidebar`, `SidebarProvider`, `SidebarTrigger`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarInput`, `SidebarInset`.
- **Dependencias UI:** `Button`, `Input`, `Separator`, `Sheet`, `Skeleton`, `Tooltip`

## Tabs

- **Archivo:** `tabs.tsx`
- **Descripción:** Pestañas para cambiar entre vistas de contenido.
- **Exports:** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.
- **Usado por:** (ningún otro componente UI)
