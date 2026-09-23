# Flame & Spice — Artisanal Restaurant Web Application

A modern, high-performance restaurant web application built for a hiring technical assessment. Featuring wood-fired artisanal aesthetics, a bold spicy design system, full responsive layout, menu browsing, table reservations, state management, and Vitest test suite.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens
- **Typography**: [`next/font/google`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) using **DM Serif Display** (Display titles) and **Plus Jakarta Sans** (Body sans)
- **Icons**: [`lucide-react`](https://lucide.dev/) (Curated culinary & restaurant iconset)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with `safeJSONStorage` local persistence & migration
- **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🎨 Design System

The application uses a dark warm charcoal base tailored for an intimate, premium restaurant experience:

- **Primary (`--primary`)**: **Chili Red** (`#C1272D`) — Used for primary CTAs, branding badges, and active highlights.
- **Secondary / Background (`--background`, `--secondary`)**: **Charcoal** (`#12100E` / `#2B2420`) — Deep warm dark mode background.
- **Accent (`--accent`)**: **Spicy Gold** (`#D4A017`) — Used for pricing, ratings, star highlights, and section accents.
- **Typography**: Confident serif headers paired with clean, highly legible body copy.

All tokens are defined in `src/app/globals.css` as CSS variables and Tailwind inline theme tokens for instant maintainability.

---

## 📅 Table Booking System & Rules

The application includes a complete, rule-enforced table reservation system:

### Reservation Rules Matrix

| Rule Parameter | Configuration Value | Description |
| :--- | :--- | :--- |
| **Online Party Limit** | `1 – 12 Guests` | Stepper supports 1 to 30. Parties > 12 display Large Group Card to call host. |
| **Booking Window** | `14 Days` | Reservations open 14 days ahead (`today` to `today + 13`). |
| **Lead Time Cutoff** | `60 Minutes` | Slots starting in < 60 minutes are marked disabled ("Needs 60 min notice"). |
| **Opening Hours** | `11:00 AM – 11:00 PM` | Grouped into Lunch (11:30–15:00) and Dinner (18:00–23:00) slots. |
| **Duplicate Prevention** | `Strict` | 1 active booking or waitlist entry per date & time slot per guest. |
| **Capacity Evaluation** | `Dynamic` | Evaluates base booked + confirmed user seats - released seats. |

### Waitlist Behavior & FIFO Promotion
- When a slot is fully booked or has insufficient seats for a requested party size, guests can join the **Priority Waitlist**.
- Waitlisting provides up to 3 alternative bookable slot suggestions.
- When a table is cancelled or seats open up, the system executes **FIFO (First-In, First-Out)** promotion based on `joinedWaitlistAt` timestamps.
- Promoted guests receive a **Table Offer Banner** allowing one-tap confirmation.

### 🧪 Demo Seat Simulation Tool
Each waitlisted card in *"Your Reservations"* includes a **"Demo: Simulate table opening"** button:
- Clicking this bumps released seats for that date & time.
- Triggers FIFO waitlist evaluation, promoting the waitlisted reservation to `"Offered"` state in real time.

---

## 🛠️ Getting Started & Setup Instructions

Follow these steps to run the application locally:

### 1. Clone the Repository
```bash
git clone https://github.com/Fahim7600/RestaurantsOrder.git
cd RestaurantsOrder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Run Unit Tests (Vitest)
```bash
npm test
```

### 5. Build for Production
To test production compilation:
```bash
npm run build
```

---

## 🚢 Deployment

This application is designed and configured for zero-config deployment on **Vercel**.

- **Deployment Target**: Vercel Platform
- **Live Preview URL**: `TBD` (Will be updated upon deployment)
