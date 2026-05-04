# Forms Components

Componentes para formularios y captura de datos del usuario.

---

## Calendar

- **Archivo:** `calendar.tsx`
- **Descripción:** Calendario para selección de fechas basado en react-day-picker.
- **Usado por:** (ningún otro componente UI)

## Checkbox

- **Archivo:** `checkbox.tsx`
- **Descripción:** Casilla de verificación con estado checked/unchecked/indeterminate.
- **Usado por:** (ningún otro componente UI)

## Field

- **Archivo:** `field.tsx`
- **Descripción:** Agrupador semántico de campos con título, descripción y separadores.
- **Exports:** `Field`, `FieldGroup`, `FieldLegend`, `FieldTitle`, `FieldDescription`.
- **Dependencias UI:** `Label`, `Separator`

## Form

- **Archivo:** `form.tsx`
- **Descripción:** Sistema de formularios integrado con React Hook Form.
- **Exports:** `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `FormError`.
- **Dependencias UI:** `Label`

## Input

- **Archivo:** `input.tsx`
- **Descripción:** Campo de texto con estados de foco y variantes dark/light.
- **Usado por:** `sidebar.tsx`, `input-group.tsx`

## InputGroup

- **Archivo:** `input-group.tsx`
- **Descripción:** Agrupa input con texto, botones o iconos adyacentes.
- **Exports:** `InputGroup`, `InputGroupAddon`, `InputGroupText`, `InputGroupButton`.
- **Dependencias UI:** `Button`, `Input`, `Textarea`

## InputOTP

- **Archivo:** `input-otp.tsx`
- **Descripción:** Campo OTP de un solo dígito con validación y auto-avance.
- **Exports:** `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`.

## Label

- **Archivo:** `label.tsx`
- **Descripción:** Etiqueta accesible para campos de formulario.
- **Usado por:** `form.tsx`, `field.tsx`

## RadioGroup

- **Archivo:** `radio-group.tsx`
- **Descripción:** Grupo de opciones mutuamente excluyentes.
- **Exports:** `RadioGroup`, `RadioGroupItem`.

## Select

- **Archivo:** `select.tsx`
- **Descripción:** Dropdown de selección con soporte para grupos y búsqueda.
- **Exports:** `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator`.

## Separator

- **Archivo:** `separator.tsx`
- **Descripción:** Línea divisoria horizontal o vertical.
- **Usado por:** `sidebar.tsx`, `button-group.tsx`, `item.tsx`, `field.tsx`

## Slider

- **Archivo:** `slider.tsx`
- **Descripción:** Control deslizante de rango numérico.

## Switch

- **Archivo:** `switch.tsx`
- **Descripción:** Interruptor de encendido/apagado.

## Textarea

- **Archivo:** `textarea.tsx`
- **Descripción:** Campo de texto multilínea.
- **Usado por:** `input-group.tsx`
