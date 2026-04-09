# EcoMarket 🌿

EcoMarket is a vibrant, sustainable marketplace connecting conscious buyers with local artisans. This platform aims to promote eco-friendly, upcycled, and handmade products while minimizing carbon footprint through local commerce.

This repository contains the full end-to-end web application built for presentation and rapid prototyping.

## Features ✨

The application provides specialized dashboards and flows for three key user roles:

### 🛍️ Buyer Experience
- **Discover:** Browse a curated marketplace of sustainable products.
- **Local Search:** Interactive map view to find sellers near you.
- **Shopping:** Persistent cart functionality to seamlessly add items and adjust quantities.
- **Checkout:** Fully functional demo checkout flow that generates verifiable orders.
- **Tracking:** View past orders and track their real-time status.

### 🏪 Seller Dashboard
- **Store Management:** Create and publish new products with images, stock counts, and eco-tags.
- **Order Fulfillment:** View incoming orders and advance their status (`Pending` → `Processing` → `Completed`).
- **Analytics:** Real-time visibility into store revenue, active products, and order volumes.

### 🛡️ Admin Panel
- **Platform Overview:** High-level metrics including total GMV, active sellers, and overall order counts.
- **Eco-Impact:** Insights into the most popular sustainability tags across the platform.
- **Order Monitoring:** Track the breakdown of all orders across the marketplace by status.

## Tech Stack 🛠️

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom warm, earthy design system (`globals.css`)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) with `localStorage` persistence
- **Icons:** [Lucide React](https://lucide.dev/)
- **Maps:** [Leaflet](https://leafletjs.com/) (Dynamic client-side rendering)

## Architecture & "Demo Mode" 🏗️

EcoMarket is intentionally designed to be **presentation-ready** immediately after cloning. 

It utilizes a robust **"Demo Mode"** architecture:
- All critical state (auth, products, cart, orders) is managed by Zustand stores and persisted to the browser's `localStorage`.
- Built-in mock users and an initial catalog of 10 sustainable products are provided out-of-the-box.
- This allows full end-to-end testing and demonstrations without requiring a backend database setup.

*Optional:* It includes plumbing for Supabase and Cloudinary integrations for moving beyond the prototype phase.

## Getting Started 🚀

### 1. Installation
Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd AsyncSquad_HimanshuVerma
npm install
```

### 2. Environment Setup (Optional)
The app works perfectly in Demo Mode without environment variables. If you wish to connect to a real backend, copy the example env file:

```bash
cp .env.example .env.local
```
Fill in your Supabase and Cloudinary credentials in `.env.local`.

### 3. Run Development Server
Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials 🔑

The app includes pre-configured functional demo accounts for immediate testing. Use the "Try a demo account" buttons on the `/login` page or enter manually:

- **Buyer:** `buyer@demo.com` (Password: `demo123`)
- **Seller:** `seller@demo.com` (Password: `demo123`)
- **Admin:** `admin@demo.com` (Password: `demo123`)

## Project Structure 📁

- `/src/app`: Next.js App Router pages (routing, layouts).
  - `/admin`, `/seller`, `/buyer`: Role-specific protected dashboards.
  - `/checkout`, `/product[id]`: E-commerce flows.
- `/src/components`: Reusable UI components (`NavBar`, `NearbyMap`, `AddToCartButton`).
- `/src/lib`: Core logic and state management.
  - `authStore.ts`: Authentication and role handling.
  - `productStore.ts`: Product catalog management.
  - `cart.ts`: Shopping cart logic.
  - `orderStore.ts`: Order generation and tracking.
- `/src/types`: TypeScript interfaces for the domain models.

## Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Creates an optimized production build.
- `npm run start` - Starts the production server.
- `npm run lint` - Runs Next.js ESLint configuration.