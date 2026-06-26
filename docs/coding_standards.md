# Zenith Coding Standards

## 1. React & Next.js

- Use Functional Components exclusively.
- Use Next.js App Router conventions (`page.tsx`, `layout.tsx`).
- Mark client components with `"use client"` explicitly at the top.
- Keep components small and focused on a single responsibility.
- Avoid passing too many props; consider React Context or Zustand for deeply nested state.

## 2. TypeScript

- Avoid `any`. Use `unknown` if the type is truly unknown, but strive for strict typing.
- Export all interfaces that define component props.
- Use Discriminated Unions for complex state or action types.

## 3. Styling (Tailwind CSS)

- Use utility classes over custom CSS wherever possible.
- Group logical classes together (e.g., all layout classes, then typography, then colors).
- Use `clsx` and `tailwind-merge` for dynamic class names to avoid conflicts.
- Adhere to the mobile-first design principle.

## 4. State Management (Zustand)

- Create small, focused slices instead of one giant store.
- Actions should be co-located with the state they mutate in the Zustand store.
- Do not store complex derived data in the state; compute it on the fly or use memoization.

## 5. Animations (Framer Motion)

- Prefer CSS transitions for simple hover states.
- Use Framer Motion for enter/exit animations, orchestrations, and complex gestures.
- Ensure animations respect `prefers-reduced-motion` for accessibility.
