# Component: [Component Name]

## Overview
*Describe what the component does, its visual look/layout, and where it is typically used in the application.*

## Architecture & Implementation
*Explain the internal layout and structure of the component.*

### Props
| Prop Name | Type | Default | Required | Description |
|-----------|------|---------|----------|-------------|
| `propName` | String | `'default'` | No | Description of what the prop controls. |
| `onClick` | Function | `undefined` | Yes | Callback function for click events. |

### State
*List the internal state hooks (`useState`, `useReducer`) used by the component.*
- `isOpen` (`boolean`): Tracks the visible/hidden state of the component's dropdown or popover.

---

## Styling & Theme
*List the styling classes or design system variables applied.*
- **Base Style:** Built using Tailwind CSS utility classes.
- **Variant styles:** `primary`, `secondary`, `destructive` implemented via `cva` (class-variance-authority).
- **Tailwind class pattern:** `bg-background text-foreground border border-input hover:bg-accent`

---

## Usage Example
*Provide a clean code snippet demonstrating how to import and use the component.*

```tsx
import { ComponentName } from "@/components/ui/component-name";

export default function ExamplePage() {
  return (
    <ComponentName 
      propName="example"
      onClick={() => console.log("clicked")}
    />
  );
}
```

---

## Accessibility (A11y)
*Details of keyboard navigation, ARIA attributes, and focus management.*
- Uses Radix UI primitives to ensure full screen-reader and keyboard compliance.
- Supports `Tab` for focus navigation and `Enter`/`Space` to activate.

## Future Improvements
*Visual details, performance optimizations, or missing features.*
- [ ] Add loading skeletons.

## References
- [Design System Guide](../07-design-system.md)

## Developer Notes
- Ensure this is marked with `"use client"` if it relies on browser-only features, user inputs, or hooks.
- Keep the component stateless where possible to facilitate reuse.
