# Decisions

## Why Next.js App Router

I chose Next.js 15 with the App Router over a plain Vite SPA because the brief asked for server-rendered pages with SEO-ready metadata, and the App Router gives me that without extra configuration. I can colocate `metadata` exports, route-level `loading.tsx` skeletons, and `error.tsx` boundaries in the same folder, which keeps each feature self-contained. The trade-off is that client-side state (Zustand stores) cannot be accessed during server render, so every component that reads from a store is wrapped in a `mounted` guard or marked `"use client"`.

## Data flow and state management

All persistent state lives in Zustand stores with the `persist` middleware writing to a `safeJSONStorage` wrapper that silently falls back if `localStorage` is unavailable (SSR or private browsing). I keep stores thin: they hold raw data and expose action methods, but they call pure helper functions in `src/lib/` for any real logic. This means `booking.ts`, `checkout.ts`, and `kitchenStatus.ts` are all pure functions I can unit-test without mounting a component. The availability engine is derived: base booked seats come from a seeded mock dataset, user bookings layer on top, and released seats (from cancellations or the demo simulator) subtract from the total.

## Simulated features and demo affordances

Two features are simulated client-side with no backend. Kitchen Status reads `getHours()` on the local clock and maps the hour to one of five demand tiers; it never blocks ordering. The seat-availability engine seeds from a deterministic dataset keyed by date so pages look realistic across the 14-day booking window. To let assessors exercise the waitlist flow, each waitlisted card exposes a "Demo: Simulate table opening" button that bumps released-seat counts and triggers FIFO promotion in real time. The sample-data loader and reset tool in the Profile page serve the same purpose.

## Accessibility and mobile navigation

I made two concrete decisions here. First, I replaced the mobile hamburger menu with a fixed bottom tab bar (Home, Menu, Book, Cart, Profile) because it puts all navigation one tap away without a slide-out overlay that can trap focus on slow devices. The bar hides when a text input is focused so the on-screen keyboard has full vertical space. Second, I use `:focus-visible` for all keyboard focus rings rather than `:focus`, which keeps the UI clean for mouse users without removing visible rings for keyboard and assistive-technology users. Dialogs trap focus internally via the browser's native `<dialog>` element (via Radix primitives) and close on Escape, returning focus to the trigger element.

## Recommended additional feature: Group Order Session (Shared Table Cart)

### The Chosen Feature
A real-time shared ordering session for dine-in tables and group takeaway orders. A host diner taps "Start Group Order" from the cart or table booking confirmation screen to create a lightweight room session (represented by a 4-digit code or QR share link). Table companions scan or enter the code to join the session on their own phones, allowing each person to browse the menu, select dietary options, and add items to a shared group cart in real time.

### Why I Chose This Feature
1. **Eliminates Real-World Dining Friction**: Group ordering is one of the most common paint-points in restaurant technology. Passing a single smartphone around a table of 6 people is slow and clumsy, while having each person place individual separate orders results in multiple tickets hitting the kitchen independently, causing dishes for the same table to arrive at completely different times.
2. **Kitchen & Operational Efficiency**: A single grouped ticket allows kitchen staff to synchronize firing and plating for an entire table at once. This integrates directly with our Kitchen Status demand model, maintaining smooth kitchen pacing during peak hours.
3. **Instant Itemized Bill Splitting**: Each dish in the shared cart is tagged with the initials/name of the diner who added it. At checkout, the app displays both a grand total and an exact per-person breakdown, eliminating awkward mental math and manual bill calculation after the meal.
