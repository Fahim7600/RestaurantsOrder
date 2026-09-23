# Flame & Spice — Artisanal Restaurant Web Application

A modern, high-performance restaurant web application built for a hiring technical assessment. Featuring wood-fired artisanal aesthetics, a bold spicy design system, full responsive layout, menu browsing, table reservations, and state management.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom design tokens
- **Typography**: [`next/font/google`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) using **DM Serif Display** (Display titles) and **Plus Jakarta Sans** (Body sans)
- **Icons**: [`lucide-react`](https://lucide.dev/) (Curated culinary & restaurant iconset)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Installed & scaffolded)
- **Component Utilities**: `clsx`, `tailwind-merge`, `class-variance-authority`

---

## 🎨 Design System

The application uses a dark warm charcoal base tailored for an intimate, premium restaurant experience:

- **Primary (`--primary`)**: **Chili Red** (`#C1272D`) — Used for primary CTAs, branding badges, and active highlights.
- **Secondary / Background (`--background`, `--secondary`)**: **Charcoal** (`#12100E` / `#2B2420`) — Deep warm dark mode background.
- **Accent (`--accent`)**: **Spicy Gold** (`#D4A017`) — Used for pricing, ratings, star highlights, and section accents.
- **Typography**: Confident serif headers paired with clean, highly legible body copy.

All tokens are defined in `src/app/globals.css` as CSS variables and Tailwind inline theme tokens for instant maintainability.

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

### 4. Build for Production
To test the production compilation:
```bash
npm run build
```

---

## 🚢 Deployment

This application is designed and configured for zero-config deployment on **Vercel**.

- **Deployment Target**: Vercel Platform
- **Live Preview URL**: `TBD` (Will be updated upon deployment)

---

## 📁 Repository Structure

```
RestaurantsOrder/
├── src/
│   ├── app/
│   │   ├── globals.css      # Design tokens, CSS variables & theme rules
│   │   ├── layout.tsx       # Root layout with DM Serif Display & Navbar/Footer
│   │   ├── page.tsx         # Design system showcase & component preview
│   │   ├── menu/            # Menu route
│   │   ├── book/            # Table reservation route
│   │   └── profile/         # User profile route
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.tsx   # Persistent responsive-ready Navigation Bar
│   │       └── Footer.tsx   # Persistent Footer with hours & location
│   ├── lib/
│   │   └── utils.ts        # Styling utility (cn helper)
│   └── store/
│       └── useRestaurantStore.ts  # Zustand global store setup
├── README.md                # Comprehensive documentation
├── package.json             # App dependencies & scripts
└── tsconfig.json            # TypeScript configuration
```
