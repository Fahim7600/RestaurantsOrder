# Decisions

## Why Next.js App Router

I chose Next.js 15 with the App Router over a plain Vite SPA because the brief asked for server-rendered pages with SEO-ready metadata, and the App Router gives me that without extra configuration. I can colocate `metadata` exports, route-level `loading.tsx` skeletons, and `error.tsx` boundaries in the same folder, which keeps each feature self-contained. The trade-off is that client-side state (Zustand stores) cannot be accessed during server render, so every component that reads from a store is wrapped in a `mounted` guard or marked `"use client"`.

## Data flow and state management

All persistent state lives in Zustand stores with the `persist` middleware writing to a `safeJSONStorage` wrapper that silently falls back if `localStorage` is unavailable (SSR or private browsing). I keep stores thin: they hold raw data and expose action methods, but they call pure helper functions in `src/lib/` for any real logic. This means `booking.ts`, `checkout.ts`, and `kitchenStatus.ts` are all pure functions I can unit-test without mounting a component. The availability engine is derived: base booked seats come from a seeded mock dataset, user bookings layer on top, and released seats (from cancellations or the demo simulator) subtract from the total.

## Simulated features and demo affordances

Two features are simulated client-side with no backend. Kitchen Status reads `getHours()` on the local clock and maps the hour to one of five demand tiers; it never blocks ordering. The seat-availability engine seeds from a deterministic dataset keyed by date so pages look realistic across the 14-day booking window. To let assessors exercise the waitlist flow, each waitlisted card exposes a "Demo: Simulate table opening" button that bumps released-seat counts and triggers FIFO promotion in real time. The sample-data loader and reset tool in the Profile page serve the same purpose.

## Accessibility and mobile navigation

I made two concrete decisions here. First, I replaced the mobile hamburger menu with a fixed bottom tab bar (Home, Menu, Book, Cart, Profile) because it puts all navigation one tap away without a slide-out overlay that can trap focus on slow devices. The bar hides when a text input is focused so the on-screen keyboard has full vertical space. Second, I use `:focus-visible` for all keyboard focus rings rather than `:focus`, which keeps the UI clean for mouse users without removing visible rings for keyboard and assistive-technology users. Dialogs trap focus internally via the browser's native `<dialog>` element (via Radix primitives) and close on Escape, returning focus to the trigger element.
