# 📚 IBM AI Specialist Capstone — Online Bookstore

A full-featured, responsive e-commerce bookstore application built as the IBM AI Specialist capstone project. It covers every customer journey from browsing and searching books through to checkout, order tracking, and account management.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 18+ · Standalone Components · TypeScript |
| State Management | NgRx Signal Store (new `signalStore()` API) |
| Styling | Tailwind CSS |
| Routing | Angular Router · Lazy-loaded feature routes |
| Backend (mock) | Express + json-server hybrid REST API |
| Testing | Vitest (unit) |

> The app is **fully mock-driven** — no real payment or auth backend is required. Everything is simulated via Express custom routes and json-server data persistence.

---

## Project Status

| # | Sub-Task | Status |
|---|---|---|
| 1 | Project Scaffold & Configuration | ✅ Complete |
| 2 | Core Models & Mock Database | ✅ Complete |
| 3 | Core Services & HTTP Layer | ✅ Complete |
| 4 | NgRx Signal Stores (Application State) | ✅ Complete |
| 5 | Shared UI Component Library | ✅ Complete |
| 6 | Authentication Feature (Login & Register) | ✅ Complete |
| 7 | Home / Landing Page | ✅ Complete |
| 8 | Product Catalogue Feature | ✅ Complete |
| 9 | Product Detail Page | ✅ Complete |
| 10 | Shopping Cart Page | ✅ Complete |
| 11 | Checkout Flow (Address → Payment → Confirmation) | ✅ Complete |
| 12 | Account / Order History Feature | ✅ Complete |
| 13 | Responsive Layout, Accessibility & Polish | ✅ Complete |
| 14 | Unit Tests | ✅ Complete |

---

## Application Pages

| Route | Page |
|---|---|
| `/auth/login` | Login |
| `/auth/register` | Register |
| `/home` | Home / Landing |
| `/catalogue` | Browse all books |
| `/catalogue/:category` | Browse by category |
| `/catalogue/publisher/:id` | Browse by publisher |
| `/products/:id` | Product detail |
| `/cart` | Shopping cart |
| `/checkout/address` | Delivery address |
| `/checkout/payment` | Payment & gift points |
| `/checkout/confirmation` | Purchase confirmation |
| `/account/orders` | Order history |
| `/account/orders/:id` | Order detail |
| `/account/profile` | User profile |

> `/checkout/*` and `/account/*` require authentication. All other routes are publicly accessible.

---

## User Journeys

```
Login/Register → Home → Catalogue → Product Detail → Cart → Checkout → Confirmation
Home (recommendations) → Product Detail → Cart → ...
Account → Order History → Order Detail → Cancel / Buy Again → Cart → ...
```

---

## Architecture Overview

```
src/
├── app/
│   ├── core/
│   │   ├── models/        TypeScript interfaces (Book, Cart, Order, User…)
│   │   ├── services/      HTTP services (auth, books, cart, orders…)
│   │   ├── stores/        NgRx Signal Stores (auth, cart, catalogue…)
│   │   ├── guards/        auth.guard.ts · guest.guard.ts
│   │   ├── interceptors/  auth (JWT header) · error (toast on 4xx/5xx)
│   │   └── utils/         date, currency, delivery-date helpers
│   ├── shared/
│   │   ├── components/    Reusable UI: BookCard, CartItem, OrderSummary…
│   │   └── pipes/         truncate · currency-format · time-ago
│   └── features/
│       ├── auth/          login · register
│       ├── home/
│       ├── catalogue/     catalogue · category · publisher pages
│       ├── product-detail/
│       ├── cart/
│       ├── checkout/      address · payment · confirmation
│       └── account/       profile · order-history · order-detail
│
server/
├── index.ts               Express entry point + json-server middleware
└── db.json                json-server data store (40+ books, seed data)
scripts/
└── seed-db.ts             Populates db.json with realistic demo data
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Installation

```bash
npm install
```

### Running the App

You need both the Angular dev server and the Express mock API running together:

```bash
# Start both Angular + Express in one terminal
npm run start:all
```

Or run them separately:

```bash
# Terminal 1 — Angular dev server (http://localhost:4200)
ng serve

# Terminal 2 — Express mock API (http://localhost:3000)
npm run start:api
```

Open your browser at **http://localhost:4200**.

### Demo Account

After seeding the database, a demo account is available:

| Field | Value |
|---|---|
| Email | `demo@bookstore.com` |
| Password | `password123` |

The demo account includes pre-populated order history, saved addresses, and gift points.

### Seed the Database

```bash
npx ts-node scripts/seed-db.ts
```

This populates `server/db.json` with 40+ books across 6 categories, 8 publishers, and demo user data.

---

## Running Tests

```bash
ng test
```

For a single headless CI run:

```bash
ng test --no-progress --browsers=ChromeHeadless
```

Tests cover: all services, NgRx signal stores, route guards, interceptors, pipes, custom validators, page component logic, and domain component outputs.

---

## Building for Production

```bash
ng build
```

Output is placed in the `dist/` directory.

---

## Key Design Decisions

- **No NgModules** — the entire application uses Angular standalone components throughout.
- **Unidirectional data flow** — components never call services directly; all async operations go through NgRx Signal Stores.
- **Mock-first backend** — Express custom routes handle auth (login/register), payment simulation (1.5 s delay), delivery date estimation, and gift-points redemption. Standard CRUD for books, cart, orders, etc. is delegated to json-server's auto-generated routes.
- **Lazy loading** — every feature route is lazy-loaded to keep the initial bundle small.
- **Fully typed** — no `any` in model files; all forms use typed `FormGroup<T>`.

---

## Spec & Planning

The full architecture plan, sub-task breakdown, component inventory, data models, and routing spec live in:

```
bookstore/spec/bookstore-capstone-plan.md
```
