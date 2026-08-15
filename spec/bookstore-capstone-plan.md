# IBM AI Specialist Capstone — Online Bookstore Architecture Plan

> **Plan file location:** `bookstore/spec/bookstore-capstone-plan.md`

## Top-Level Overview

Build a responsive Angular 18+ online bookstore e-commerce application covering every customer journey listed in the capstone brief.
Tech stack: Angular 18+ standalone components (no NgModules), NgRx Signal Store (new API), Tailwind CSS, Angular Router with lazy-loaded feature routes, Angular HttpClient against an **Express + json-server hybrid mock REST API**.

All application state is managed centrally via NgRx Signal Stores scoped to feature domains.
The app is **fully mock-driven** — no real payment or auth backend is required; everything is simulated via Express custom routes and json-server data persistence.

### Backend Strategy
- **Express** is used as the API server (`server/index.ts`)
- **json-server** is used as the database router (`server/db.json`) and mounted as Express middleware via `json-server.router()`
- Custom Express routes handle logic json-server cannot express natively: auth (login/register with password comparison), payment simulation (1.5 s delay + always-success), delivery date estimation, gift-points redemption balance check
- Standard CRUD for books, categories, publishers, cart, addresses, orders, recommendations, reviews is delegated directly to json-server's auto-generated REST routes
- `/home` and all catalogue/product routes are **publicly accessible** — no authentication required
- Only `/checkout/*` and `/account/*` routes require authentication (Angular `AuthGuard`)

---

## Required Application Pages

| Route | Page | Customer Journey |
|---|---|---|
| `/auth/login` | Login page | Login / User authentication |
| `/auth/register` | Register page | User authentication |
| `/` | Home / Landing | Home page, book availability, recommendations |
| `/catalogue` | Product catalogue | Browse all books |
| `/catalogue/:category` | Category browse | Select product category |
| `/catalogue/publisher/:id` | Publisher/brand browse | Browse brands/publishers |
| `/products/:id` | Product detail | Select a product, delivery date, related products |
| `/cart` | Shopping cart | Add to cart, view basket |
| `/checkout/address` | Delivery address | Select delivery address |
| `/checkout/payment` | Payment | Initiate payment, redeem gift points |
| `/checkout/confirmation` | Purchase confirmation | Payment & purchase confirmation |
| `/account/orders` | Order history | Order history |
| `/account/orders/:id` | Order detail | View / cancel an order |
| `/account/profile` | User profile | Manage account |
| `/**` | 404 Not found | Fallback |

---

## Required User Journeys (Route Flows)

```
Login/Register → Home → Catalogue (filter/browse) → Product Detail → Cart → Checkout Address → Checkout Payment → Confirmation
Home (recommendations) → Product Detail → Cart → ...
Account → Order History → Order Detail → Cancel / Buy Again → Cart → ...
```

---

## Required Reusable Components (Shared Library)

### Layout
- `AppShellComponent` — top-level shell with header, nav, footer slots
- `HeaderComponent` — logo, search bar, cart icon badge, user menu
- `FooterComponent` — links, copyright
- `BreadcrumbComponent` — dynamic trail from router state
- `SidebarFilterComponent` — category + price + publisher filter panel

### UI Primitives
- `ButtonComponent` — primary / secondary / ghost / danger variants
- `InputComponent` — label, validation message, error state wrapper
- `BadgeComponent` — numeric badge (cart count, gift points)
- `SpinnerComponent` — loading indicator
- `ToastComponent` / `ToastContainerComponent` — notification system
- `ModalComponent` — generic overlay with content projection
- `StarRatingComponent` — display-only star rating
- `ProgressStepperComponent` — checkout multi-step progress indicator
- `EmptyStateComponent` — icon + message + action CTA for empty lists
- `ErrorStateComponent` — error message + retry CTA

### Domain Components
- `BookCardComponent` — thumbnail, title, author, price, rating, add-to-cart button
- `BookGridComponent` — responsive grid of `BookCard`
- `BookListItemComponent` — horizontal list variant of book card
- `CategoryChipComponent` — pill/chip for category selection
- `PublisherLogoComponent` — publisher logo + name tile
- `CartItemComponent` — line item in cart (qty stepper, remove)
- `OrderSummaryComponent` — price breakdown (subtotal, shipping, gift points, total)
- `DeliveryDateBadgeComponent` — computed tentative delivery date display
- `RelatedBooksComponent` — horizontal scroll carousel of related books
- `RecommendedBooksComponent` — personalised recommendation strip
- `OrderHistoryItemComponent` — condensed order card in order list
- `GiftPointsRedeemComponent` — redeem gift points inline form
- `PaymentMethodSelectorComponent` — credit card / PayPal / gift points selection
- `AddressCardComponent` — saved address tile with select/edit actions
- `CancelOrderDialogComponent` — confirm cancel within 48 h modal

---

## Required TypeScript Models / Interfaces

```
src/app/core/models/
  user.model.ts          — User, AuthTokens, LoginRequest, RegisterRequest
  book.model.ts          — Book, BookSummary, BookCategory, Publisher
  cart.model.ts          — Cart, CartItem
  order.model.ts         — Order, OrderItem, OrderStatus, DeliveryInfo
  address.model.ts       — Address
  payment.model.ts       — PaymentMethod, PaymentRequest, PaymentResult
  gift-points.model.ts   — GiftPointsBalance, GiftPointsRedemption
  recommendation.model.ts — Recommendation
  catalogue.model.ts     — CatalogueFilter, CataloguePage, SortOption
  review.model.ts        — Review, Rating
```

### Key Shape Notes
- `Book` — id, title, author, publisherId, categoryId, price, stock, imageUrl, rating, reviewCount, description, isbn, publishedDate, tags[]
- `Order` — id, userId, items: OrderItem[], status: OrderStatus, placedAt: Date, deliveryAddress: Address, paymentMethod, giftPointsUsed, totalAmount, deliveryDate
- `OrderStatus` — `'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'`
- `Cart` — userId, items: CartItem[], updatedAt
- `User` — id, email, name, addresses: Address[], giftPointsBalance, orderHistory: string[] (ids)

---

## Required Services

All services use `HttpClient` and point to the Express server at `http://localhost:3000`.

```
src/app/core/services/
  auth.service.ts           — login(), register(), logout(), getCurrentUser(), refreshToken()
  book.service.ts           — getBooks(filter), getBook(id), getByCategory(cat), getByPublisher(pub), searchBooks(query)
  cart.service.ts           — getCart(), addItem(), updateQty(), removeItem(), clearCart()
  order.service.ts          — placeOrder(), getOrders(), getOrder(id), cancelOrder(id), reorder(id)
  payment.service.ts        — initiatePayment(), confirmPayment(), getPaymentMethods()
  recommendation.service.ts — getRecommendations(userId), getTrending()
  address.service.ts        — getAddresses(), addAddress(), updateAddress(), deleteAddress()
  gift-points.service.ts    — getBalance(), redeem(amount)
  category.service.ts       — getCategories()
  publisher.service.ts      — getPublishers(), getPublisher(id)
  delivery.service.ts       — estimateDeliveryDate(bookId, addressId)
  toast.service.ts          — show(msg, type), dismiss() — no HTTP, pure UI state
```

---

## Required Routing Structure

```
AppRoutes (app.routes.ts)
├── '' → redirect → '/home'
├── 'auth' → lazy → AuthRoutes
│   ├── 'login'    → LoginPageComponent
│   └── 'register' → RegisterPageComponent
├── 'home' → lazy → HomePageComponent         (public — no guard)
├── 'catalogue' → lazy → CatalogueRoutes      (public — no guard)
│   ├── ''                    → CataloguePageComponent
│   ├── ':category'           → CategoryPageComponent
│   └── 'publisher/:id'       → PublisherPageComponent
├── 'products/:id' → lazy → ProductDetailPageComponent  (public — no guard)
├── 'cart' → lazy → CartPageComponent         (public — no guard, but checkout requires auth)
├── 'checkout' → lazy → CheckoutRoutes (guard: AuthGuard)
│   ├── 'address'      → CheckoutAddressPageComponent
│   ├── 'payment'      → CheckoutPaymentPageComponent
│   └── 'confirmation' → CheckoutConfirmationPageComponent
├── 'account' → lazy → AccountRoutes (guard: AuthGuard)
│   ├── 'profile' → ProfilePageComponent
│   ├── 'orders'  → OrderHistoryPageComponent
│   └── 'orders/:id' → OrderDetailPageComponent
└── '**' → NotFoundPageComponent
```

Route Guards:
- `AuthGuard` (functional guard) — redirects unauthenticated users to `/auth/login`
- `GuestGuard` — prevents authenticated users revisiting `/auth/login`

---

## Required Mock Data (Express + json-server `server/db.json`)

```json
{
  "users": [],
  "books": [],         // 40+ books across 5+ categories
  "categories": [],    // Fiction, Non-Fiction, Science, History, Tech, Children
  "publishers": [],    // 8+ publishers
  "carts": [],
  "orders": [],
  "addresses": [],
  "recommendations": [],
  "reviews": [],
  "giftPointsBalances": [],
  "paymentMethods": []
}
```

A seed script (`scripts/seed-db.ts`) will populate realistic data for books, publishers, categories, and one demo user account.

---

## Required Application State (NgRx Signal Stores)

```
src/app/core/stores/
  auth.store.ts           — currentUser, isAuthenticated, isLoading, error
  cart.store.ts           — items, itemCount (computed), totalPrice (computed), isLoading
  order.store.ts          — orders, selectedOrder, isLoading, error
  catalogue.store.ts      — books, filter, pagination, sortOption, isLoading, error
  recommendation.store.ts — recommended, trending, isLoading
  gift-points.store.ts    — balance, pendingRedemption, isLoading
  checkout.store.ts       — address, paymentMethod, giftPointsToRedeem, orderSummary
  toast.store.ts          — toasts[] (id, message, type, timestamp)
```

Each store exposes:
- Signals for state slices
- Computed signals for derived values
- Methods (withMethods) for state mutations and async operations

---

## Required Validation States

| Context | Validations |
|---|---|
| Login form | email required + valid format; password required min 8 chars |
| Register form | all login validations + name required; password confirmation match |
| Checkout address | name, line1, city, postcode required; postcode format |
| Payment form | card number (Luhn or mock 16-digit), expiry (future date), CVV (3-4 digits) |
| Gift points redeem | amount > 0; amount ≤ balance; amount ≤ order total |
| Cancel order | can only cancel if `status === 'pending' | 'processing'` AND placedAt within 48 hours |
| Add to cart | qty > 0; qty ≤ stock |
| Search | minimum 2 characters before API call |

All form validation uses Angular Reactive Forms with typed `FormGroup<T>` and custom validators where needed.

---

## Required Loading / Empty / Error States

Every data-fetching view must handle all three states:

| State | Component Used | Behaviour |
|---|---|---|
| Loading | `SpinnerComponent` | Skeleton or spinner overlaid on content area |
| Empty | `EmptyStateComponent` | Friendly message + relevant CTA (e.g. "Browse catalogue") |
| Error | `ErrorStateComponent` | Error message + retry button that re-triggers the fetch |

Specific instances:
- Home recommendations — loading skeleton, empty = "No recommendations yet"
- Catalogue grid — spinner, empty = "No books match your filters", error = "Could not load books"
- Cart — empty = "Your cart is empty" + Browse CTA
- Order history — empty = "No orders yet" + Shop Now CTA
- Product detail — full-page error if book not found (404 redirect)

---

## Required Application Architecture

```
src/
├── app/
│   ├── core/
│   │   ├── models/          (TypeScript interfaces — see above)
│   │   ├── services/        (HTTP services — see above)
│   │   ├── stores/          (NgRx Signal Stores — see above)
│   │   ├── guards/          (auth.guard.ts, guest.guard.ts)
│   │   ├── interceptors/    (auth.interceptor.ts — JWT header, error.interceptor.ts — toast on 4xx/5xx)
│   │   └── utils/           (date.utils.ts, currency.utils.ts, delivery-date.util.ts)
│   │
│   ├── shared/
│   │   ├── components/      (all reusable UI components — see above)
│   │   └── pipes/           (truncate.pipe.ts, currency-format.pipe.ts, time-ago.pipe.ts)
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/       (login-page.component.ts)
│   │   │   └── register/    (register-page.component.ts)
│   │   ├── home/            (home-page.component.ts)
│   │   ├── catalogue/
│   │   │   ├── catalogue-page/
│   │   │   ├── category-page/
│   │   │   └── publisher-page/
│   │   ├── product-detail/  (product-detail-page.component.ts)
│   │   ├── cart/            (cart-page.component.ts)
│   │   ├── checkout/
│   │   │   ├── address/
│   │   │   ├── payment/
│   │   │   └── confirmation/
│   │   └── account/
│   │       ├── profile/
│   │       ├── order-history/
│   │       └── order-detail/
│   │
│   ├── app.component.ts     (AppShell — router-outlet only)
│   ├── app.routes.ts        (root route config)
│   └── app.config.ts        (provideRouter, provideHttpClient, provideAnimations)
│
├── environments/
│   ├── environment.ts       (apiUrl: 'http://localhost:3000')
│   └── environment.prod.ts
│
server/
├── index.ts                 (Express entry point — custom routes + json-server middleware)
└── db.json                  (json-server data store)
scripts/
└── seed-db.ts               (data seeder — writes to server/db.json)
proxy.conf.json              (Angular dev proxy: /api/* → http://localhost:3000)
```

---

## Sub-Tasks

---

### Sub-Task 1 — Project Scaffold & Configuration ✅

**Intent**
Bootstrap the Angular 18+ project with all tooling configured: Tailwind CSS, NgRx Signal Store, Express + json-server backend, routing skeleton, and environment files. This is the foundation every subsequent sub-task builds on.

**Expected Outcomes**
- `ng new` project created with standalone component defaults
- Tailwind CSS installed and configured (`tailwind.config.js`, `styles.css`)
- NgRx Signal Store installed (`@ngrx/signals`)
- `express`, `json-server`, `cors`, `ts-node` installed as devDependencies
- `concurrently` installed to run Angular dev server and Express server together
- Express server scaffolded at `server/index.ts` with json-server mounted as middleware
- `server/db.json` created with empty top-level arrays for all resource types
- `app.config.ts` wired with `provideRouter`, `provideHttpClient(withFetch())`, `provideAnimations`
- Environments configured with `apiUrl: 'http://localhost:3000'`
- `app.routes.ts` stub with all lazy-loaded route placeholders
- `proxy.conf.json` forwarding `/api/*` to `http://localhost:3000` (removes `/api` prefix via pathRewrite)
- `angular.json` `serve` options updated to reference `proxy.conf.json`

**Todo List**
1. Generate Angular project: `ng new bookstore --standalone --routing --style=css`
2. Install Tailwind CSS and configure `tailwind.config.js` with content paths
3. Install `@ngrx/signals` and verify peer deps
4. Install `express`, `json-server`, `cors`, `@types/express`, `@types/cors`, `ts-node`, `concurrently` as devDependencies
5. Create `server/db.json` with empty top-level arrays for all resource types
6. Scaffold `server/index.ts`: import Express, mount json-server router on `/`, add CORS middleware, listen on port 3000
7. Write `scripts/seed-db.ts` placeholder (outputs to `server/db.json`)
8. Configure `app.config.ts` with all providers
9. Configure `proxy.conf.json` and update `angular.json` `serve` options
10. Set up `environments/environment.ts` (`apiUrl: 'http://localhost:3000'`) and `environment.prod.ts`
11. Create the full `app.routes.ts` with lazy route stubs pointing at placeholder components
12. Add `start:api` (`ts-node server/index.ts`) and `start:all` (`concurrently ...`) scripts to `package.json`

**Relevant Context**
- Angular 18 docs: standalone bootstrap via `bootstrapApplication`
- Tailwind v3 setup with Angular: PostCSS config in project root
- NgRx Signal Store: `signalStore()` new API from `@ngrx/signals`
- Express + json-server integration: `const router = jsonServer.router('server/db.json'); app.use(router);`

**Status** — `[x] completed`

---

### Sub-Task 2 — Core Models & Mock Database ✅

**Intent**  
Define all TypeScript interfaces and populate `db.json` with realistic seed data so every page has data to display from day one. No data shape changes should be needed after this sub-task.

**Expected Outcomes**
- All model files created under `src/app/core/models/`
- `db.json` seeded with: 40+ books, 6 categories, 8 publishers, 2 demo users, 10+ orders, 5+ addresses, reviews, gift point balances, recommendations
- `scripts/seed-db.ts` runnable via `npx ts-node scripts/seed-db.ts`
- All model interfaces are strict (no `any`)

**Todo List**
1. Create `user.model.ts`, `book.model.ts`, `cart.model.ts`, `order.model.ts`, `address.model.ts`, `payment.model.ts`, `gift-points.model.ts`, `recommendation.model.ts`, `catalogue.model.ts`, `review.model.ts`
2. Write `scripts/seed-db.ts` generating realistic book data (titles, authors, ISBNs, prices, stock levels, categories, publishers)
3. Include demo user: `demo@bookstore.com / password123` with order history, gift points, saved addresses
4. Populate `db.json` by running the seed script
5. Verify all json-server routes resolve correctly with `curl` or browser

**Relevant Context**
- `src/app/core/models/` directory (to be created)
- `db.json` at project root
- `OrderStatus` union type must align with cancel-within-48h business rule

**Status** — `[x] completed`

---

### Sub-Task 3 — Core Services & HTTP Layer

**Intent**
Implement all HTTP services, interceptors, and route guards so every feature page can call real (mock) API endpoints. This is the data layer the entire application depends on.

**Expected Outcomes**
- All services in `src/app/core/services/` implemented with correct HTTP calls to the Express server
- `AuthInterceptor` attaches JWT token from localStorage to all outgoing requests
- `ErrorInterceptor` catches 4xx/5xx and triggers toast notifications
- `AuthGuard` and `GuestGuard` functional guards implemented
- All services are `providedIn: 'root'`
- Custom Express routes added to `server/index.ts` for auth, payment, and gift-points endpoints

**Todo List**
1. Add custom Express routes to `server/index.ts`:
   - `POST /auth/login` — find user by email, compare password (plain text for mock), return mock JWT
   - `POST /auth/register` — create user, return mock JWT
   - `POST /payments` — wait 1.5 s (`setTimeout`), return `{ success: true, transactionId }`
   - `POST /gift-points/redeem` — validate amount ≤ balance, update balance, return new balance
   - `GET /delivery/estimate?bookId=&stock=` — return `{ estimatedDate }` based on stock level
2. Implement `auth.service.ts` — POST `/auth/login`, POST `/auth/register`, store userId + mock JWT in `localStorage`, expose `getCurrentUser()`
3. Implement `book.service.ts` — GET `/books` with query params (`_page`, `_limit`, `_sort`, `q`, `categoryId`, `publisherId`), GET `/books/:id`
4. Implement `cart.service.ts` — GET/POST/PATCH/DELETE `/carts` using userId as key
5. Implement `order.service.ts` — GET/POST `/orders`, PATCH `/orders/:id` for status updates (cancel)
6. Implement `payment.service.ts` — POST `/payments` (1.5 s mock delay already on server)
7. Implement `recommendation.service.ts` — GET `/recommendations?userId=`
8. Implement `address.service.ts` — full CRUD on `/addresses`
9. Implement `gift-points.service.ts` — GET `/giftPointsBalances?userId=`, POST `/gift-points/redeem`
10. Implement `category.service.ts` and `publisher.service.ts`
11. Implement `delivery.service.ts` — calls GET `/delivery/estimate` or computes locally (no HTTP needed for pure date calculation)
12. Implement `toast.service.ts` — signals-based, no HTTP
13. Create `auth.interceptor.ts` and `error.interceptor.ts`, register in `app.config.ts` via `withInterceptors([...])`
14. Create `auth.guard.ts` (blocks `/checkout/*` and `/account/*`) and `guest.guard.ts` (blocks `/auth/*` when already logged in)

**Relevant Context**
- `server/index.ts` — Express entry point; custom routes must be registered **before** `app.use(router)` (json-server catch-all)
- json-server supports `_page`, `_limit`, `_sort`, `_order`, `q` query params natively on all resource routes
- Auth is simulated: store `{ userId, token: 'mock-jwt-<userId>' }` in `localStorage`
- `/checkout/*` and `/account/*` are the **only** protected Angular routes

**Status** — `[x] completed`

---

### Sub-Task 4 — NgRx Signal Stores (Application State)

**Intent**  
Implement all NgRx Signal Stores so that components never call services directly — all async interactions go through the store. This enforces a predictable unidirectional data flow.

**Expected Outcomes**
- All 8 stores created with correct state shape, computed signals, and methods
- Stores injected via Angular DI (no global singletons exposed outside DI)
- Each store handles its own loading/error flags
- `CartStore` `itemCount` and `totalPrice` are computed signals
- `CheckoutStore` accumulates address + payment + gift-points state across the multi-step flow
- `AuthStore` hydrates from localStorage on app init

**Todo List**
1. Create `auth.store.ts` — state: currentUser, isAuthenticated, isLoading, error; methods: login, logout, register, hydrate
2. Create `cart.store.ts` — state: items, isLoading; computed: itemCount, totalPrice; methods: loadCart, addItem, updateQty, removeItem, clearCart
3. Create `catalogue.store.ts` — state: books, filter, page, pageSize, totalCount, sortOption, isLoading, error; computed: filteredBooks; methods: loadBooks, setFilter, setPage, setSort
4. Create `order.store.ts` — state: orders, selectedOrder, isLoading, error; methods: loadOrders, loadOrder, placeOrder, cancelOrder
5. Create `recommendation.store.ts` — state: recommended, trending, isLoading; methods: loadRecommendations
6. Create `gift-points.store.ts` — state: balance, pendingRedemption, isLoading; methods: loadBalance, setRedemption
7. Create `checkout.store.ts` — state: selectedAddress, paymentMethod, giftPointsToRedeem, isLoading; methods: setAddress, setPaymentMethod, setGiftPoints, submitOrder
8. Create `toast.store.ts` — state: toasts[]; methods: add, remove, clear
9. Provide all stores in `app.config.ts` or at feature level as appropriate

**Relevant Context**
- NgRx Signal Store API: `signalStore({ state, computed, methods })` pattern
- `withHooks` for `onInit` hydration in `AuthStore`
- `CheckoutStore` spans 3 pages — must be provided at the `checkout` route level (not root)

**Status** — `[x] complete`

---

### Sub-Task 5 — Shared UI Component Library

**Intent**  
Build all reusable presentational components so that every feature page assembles from a consistent, tested component palette rather than writing bespoke markup.

**Expected Outcomes**
- All shared components created in `src/app/shared/components/`
- Components are purely presentational (no store injection — accept inputs/emit outputs)
- Tailwind CSS used for all styling (no separate `.css` files except where `@apply` is needed)
- `LoadingState`, `EmptyState`, `ErrorState` components handle all three non-data states
- `BookCardComponent` emits `addToCart` output; parent page connects to `CartStore`
- Pipes: `TruncatePipe`, `CurrencyFormatPipe`, `TimeAgoPipe`

**Todo List**
1. Build layout components: `HeaderComponent`, `FooterComponent`, `BreadcrumbComponent`, `SidebarFilterComponent`
2. Build UI primitives: `ButtonComponent`, `InputComponent`, `BadgeComponent`, `SpinnerComponent`, `ToastContainerComponent`, `ModalComponent`, `StarRatingComponent`, `ProgressStepperComponent`, `EmptyStateComponent`, `ErrorStateComponent`
3. Build domain components: `BookCardComponent`, `BookGridComponent`, `CategoryChipComponent`, `PublisherLogoComponent`, `CartItemComponent`, `OrderSummaryComponent`, `DeliveryDateBadgeComponent`, `RelatedBooksComponent`, `RecommendedBooksComponent`, `OrderHistoryItemComponent`, `GiftPointsRedeemComponent`, `PaymentMethodSelectorComponent`, `AddressCardComponent`, `CancelOrderDialogComponent`
4. Create `TruncatePipe`, `CurrencyFormatPipe`, `TimeAgoPipe`
5. Create `AppShellComponent` that wraps `Header`, `router-outlet`, `Footer`, `ToastContainer`

**Relevant Context**
- All shared components are standalone (no shared NgModule)
- `BookCardComponent` input: `book: BookSummary`; output: `addToCart: EventEmitter<Book>`
- `ModalComponent` uses `ng-content` projection for body and footer slots

**Status** — `[ ] pending`

---

### Sub-Task 6 — Authentication Feature (Login & Register)

**Intent**  
Implement the login and register pages with full form validation, error handling, and navigation to the intended destination after successful auth. This gates the entire authenticated portion of the application.

**Expected Outcomes**
- `/auth/login` — reactive form, email + password validation, error display, links to register
- `/auth/register` — reactive form, all fields validated, password confirm match
- Successful login stores token in localStorage and navigates to `/home` or redirect URL
- `AuthStore` updated on login/logout
- Header shows user name and logout button when authenticated
- `AuthGuard` blocks unauthenticated access to `/checkout` and `/account`
- `GuestGuard` redirects authenticated users away from `/auth/login`

**Todo List**
1. Create `login-page.component.ts` with `FormGroup<LoginForm>` and validation
2. Create `register-page.component.ts` with `FormGroup<RegisterForm>` and custom password-match validator
3. Connect both forms to `AuthStore.login()` / `AuthStore.register()`
4. Display loading spinner while `AuthStore.isLoading` is true
5. Display error from `AuthStore.error` below the submit button
6. Add logout action to `HeaderComponent` wired to `AuthStore.logout()`
7. Implement redirect-after-login using `ActivatedRoute` `returnUrl` query param

**Relevant Context**
- `src/app/features/auth/`
- `auth.store.ts` — login(), register(), isLoading, error signals
- `guest.guard.ts` — applied to `/auth/login` and `/auth/register` routes

**Status** — `[ ] pending`

---

### Sub-Task 7 — Home / Landing Page

**Intent**  
Build the home page that is the first thing an authenticated (or guest) user sees: featured books, categories strip, top publishers, and personalised recommendations based on order history.

**Expected Outcomes**
- Hero banner with featured/promoted books (hardcoded selection)
- Category chips linking to `/catalogue/:category`
- `RecommendedBooksComponent` loaded from `RecommendationStore`
- Trending books section (fetched independently)
- Publisher logos strip linking to `/catalogue/publisher/:id`
- Page shows loading skeleton, empty, and error states correctly

**Todo List**
1. Create `home-page.component.ts` — inject `RecommendationStore`, `CatalogueStore`, `AuthStore`
2. Load trending books on init (first 8 books sorted by rating)
3. Load recommendations for current user on init
4. Render `BookGridComponent` for both trending and recommended sections
5. Render `CategoryChipComponent` strip for all categories
6. Render `PublisherLogoComponent` strip for all publishers
7. Hero banner with a call-to-action button linking to `/catalogue`
8. All data sections individually handle loading/empty/error states

**Relevant Context**
- `src/app/features/home/`
- `recommendation.store.ts`, `catalogue.store.ts`
- Home is a public route — recommendations fallback to trending for unauthenticated users

**Status** — `[ ] pending`

---

### Sub-Task 8 — Product Catalogue Feature

**Intent**  
Implement the full catalogue browsing experience: grid view with filter sidebar, category browsing, publisher browsing, search, sort, and pagination.

**Expected Outcomes**
- `/catalogue` — full grid with `SidebarFilterComponent` (category, price range, publisher, rating)
- `/catalogue/:category` — pre-filtered grid for selected category
- `/catalogue/publisher/:id` — pre-filtered grid for selected publisher
- URL query params reflect active filters (shareable/bookmarkable links)
- Sort by price (asc/desc), rating, newest
- Pagination with page size selector
- Each `BookCardComponent` has "Add to Cart" directly on the card
- Loading, empty, error states all handled

**Todo List**
1. Create `catalogue-page.component.ts` — inject `CatalogueStore`; read filters from query params on init
2. Create `category-page.component.ts` — reads `:category` param, sets store filter on init
3. Create `publisher-page.component.ts` — reads `:id` param, sets publisher filter on init
4. `SidebarFilterComponent` emits filter change events; catalogue page updates `CatalogueStore.setFilter()`
5. Sync active filters back to URL query params using `Router.navigate` with `queryParams`
6. Implement sort controls wired to `CatalogueStore.setSort()`
7. Implement pagination controls wired to `CatalogueStore.setPage()`
8. Wire `BookCardComponent.addToCart` output to `CartStore.addItem()`

**Relevant Context**
- `src/app/features/catalogue/`
- `catalogue.store.ts` — filter, page, sort signals + loadBooks method
- json-server supports `_page`, `_limit`, `_sort`, `q` natively

**Status** — `[ ] pending`

---

### Sub-Task 9 — Product Detail Page

**Intent**  
Build the individual product page showing full book details, computed delivery date, customer reviews, and a related books carousel. This is where the purchase decision is made.

**Expected Outcomes**
- `/products/:id` — full book detail: image, title, author, publisher, category, price, stock indicator, description, reviews with star ratings
- `DeliveryDateBadgeComponent` shows tentative delivery (today + 3–7 days)
- "Add to Cart" button adds the book via `CartStore`, disabled when out of stock
- `RelatedBooksComponent` shows books in the same category (excluding current)
- 404 redirect if book ID does not exist
- Breadcrumb: Home > Catalogue > Category > Title

**Todo List**
1. Create `product-detail-page.component.ts` — reads `:id` param, calls `BookService.getBook(id)`
2. Render book image gallery (single image initially), full description, metadata
3. Integrate `DeliveryDateBadgeComponent` using `DeliveryService.estimateDeliveryDate()`
4. Inject `CartStore`, wire "Add to Cart" button, show feedback toast on add
5. Load related books: `BookService.getBooks({ categoryId, exclude: id, limit: 6 })`
6. Render `RelatedBooksComponent` as horizontal scroll row
7. Render reviews section with `StarRatingComponent` and review list
8. Handle book-not-found: navigate to `/catalogue` with error toast
9. Update `BreadcrumbComponent` based on book's category

**Relevant Context**
- `src/app/features/product-detail/`
- `delivery.service.ts` — pure date calculation, no HTTP needed
- `cart.store.ts` — addItem method

**Status** — `[ ] pending`

---

### Sub-Task 10 — Shopping Cart Page

**Intent**  
Build the cart page where users review selected items, adjust quantities, remove items, and see the order subtotal before proceeding to checkout.

**Expected Outcomes**
- `/cart` — list of `CartItemComponent` instances with qty steppers
- Qty stepper increments/decrements clamped between 1 and available stock
- Remove item button (with confirm on last item)
- `OrderSummaryComponent` in sidebar showing subtotal, estimated shipping, total
- "Proceed to Checkout" button navigates to `/checkout/address`
- Empty cart state with "Browse Catalogue" CTA
- Cart item count badge in header is always in sync with `CartStore.itemCount`

**Todo List**
1. Create `cart-page.component.ts` — inject `CartStore`, load cart on init
2. Render `CartItemComponent` list wired to `CartStore.updateQty()` and `CartStore.removeItem()`
3. Render `OrderSummaryComponent` bound to `CartStore` derived values
4. Add "Proceed to Checkout" button, disable if cart is empty
5. Add `EmptyStateComponent` when `CartStore.itemCount === 0`
6. Ensure header cart badge reflects `CartStore.itemCount` computed signal

**Relevant Context**
- `src/app/features/cart/`
- `cart.store.ts` — items, itemCount, totalPrice

**Status** — `[ ] pending`

---

### Sub-Task 11 — Checkout Flow (Address → Payment → Confirmation)

**Intent**  
Implement the full three-step checkout: delivery address selection/entry, payment method selection with gift-points redemption, and a final purchase confirmation screen.

**Expected Outcomes**
- `ProgressStepperComponent` visible on all three checkout steps
- **Step 1 — Address** (`/checkout/address`): list saved addresses with select, add-new form with validation; `CheckoutStore.setAddress()` on continue
- **Step 2 — Payment** (`/checkout/payment`): payment method selector (card / PayPal / wallet), gift points redemption widget, order summary panel; `CheckoutStore.setPaymentMethod()` and `CheckoutStore.setGiftPoints()` on continue; mock payment initiated
- **Step 3 — Confirmation** (`/checkout/confirmation`): order ID, book list, total paid, delivery date, "Continue Shopping" CTA; `CartStore.clearCart()` called on arrival; `OrderStore.placeOrder()` called
- Back navigation between steps preserves entered data via `CheckoutStore`
- Unauthenticated access redirected to login via `AuthGuard`

**Todo List**
1. Create `checkout-address-page.component.ts` — load addresses from `AddressService`, render `AddressCardComponent` list, add-new form with validation, wire to `CheckoutStore.setAddress()`
2. Create `checkout-payment-page.component.ts` — render `PaymentMethodSelectorComponent`, `GiftPointsRedeemComponent`, `OrderSummaryComponent`, call `PaymentService.initiatePayment()` on submit
3. Create `checkout-confirmation-page.component.ts` — show confirmed order summary; call `OrderStore.placeOrder()` and `CartStore.clearCart()` on init; guard against direct navigation (redirect to home if no pending order)
4. Create `CheckoutStore` and provide it at the `checkout` route level using `providers` in route config
5. Implement `GiftPointsRedeemComponent` with balance display, amount input validated against balance and order total
6. Implement `PaymentMethodSelectorComponent` with credit-card mock form and PayPal button (always resolves)
7. Wire `ProgressStepperComponent` to display active step

**Relevant Context**
- `src/app/features/checkout/`
- `checkout.store.ts` — spans all three pages
- `gift-points.store.ts` — balance, setRedemption
- `order.store.ts` — placeOrder method
- Payment is fully mocked — simulate 1.5s network delay then success

**Status** — `[ ] pending`

---

### Sub-Task 12 — Account / Order History Feature

**Intent**  
Implement the user account area: profile page, full order history list with statuses, individual order detail with tracking info, and the ability to cancel an order within 48 hours or "Buy Again" by re-adding items to cart.

**Expected Outcomes**
- `/account/orders` — list of all past orders using `OrderHistoryItemComponent`, sorted newest first
- `/account/orders/:id` — full order detail: items, prices, address, payment method, status badge, delivery date
- **Cancel order**: only shown if `placedAt` within 48 hours AND status is `pending/processing`; confirmation dialog before calling `OrderStore.cancelOrder(id)`
- **Buy Again**: button re-adds all order items to `CartStore`, then navigates to `/cart`
- Empty state if no orders; loading and error states
- `/account/profile` — view/edit name and email

**Todo List**
1. Create `order-history-page.component.ts` — inject `OrderStore`, load orders on init
2. Render `OrderHistoryItemComponent` list with status badges and "View Details" link
3. Create `order-detail-page.component.ts` — load single order from `OrderStore.loadOrder(id)`
4. Implement cancel button visibility logic: within 48 h AND cancellable status
5. Wire `CancelOrderDialogComponent` to `OrderStore.cancelOrder(id)`
6. Implement "Buy Again" — iterate order items, call `CartStore.addItem()` for each, navigate to `/cart`
7. Create `profile-page.component.ts` — simple form to update name/email via `AuthService`
8. Handle empty, loading, error states on all three pages

**Relevant Context**
- `src/app/features/account/`
- `order.store.ts` — orders, selectedOrder, cancelOrder, loadOrders
- 48 h cancel window: `(Date.now() - order.placedAt.getTime()) < 48 * 60 * 60 * 1000`

**Status** — `[ ] pending`

---

### Sub-Task 13 — Responsive Layout, Accessibility & Polish

**Intent**  
Ensure the application is fully responsive across mobile, tablet, and desktop breakpoints, passes basic accessibility checks, and has consistent visual polish throughout.

**Expected Outcomes**
- All pages usable on 320px (mobile) through 1440px (desktop) without horizontal scroll
- Header collapses to hamburger menu on mobile
- Catalogue sidebar becomes a bottom sheet/drawer on mobile
- Checkout stepper is compact on mobile
- Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) used consistently
- All interactive elements have focus rings and ARIA labels
- Images have meaningful `alt` text
- Color contrast meets WCAG AA minimum
- Toast notifications auto-dismiss after 4 seconds
- Page titles updated via Angular `Title` service on each route

**Todo List**
1. Audit every page at 320px, 768px, and 1440px using browser dev tools
2. Implement mobile hamburger nav in `HeaderComponent`
3. Convert catalogue sidebar to drawer on mobile using a responsive Tailwind breakpoint
4. Verify all form inputs have associated `<label>` elements
5. Add `aria-label` to icon-only buttons (cart, close, remove)
6. Set page title in each page component using Angular `Title` service
7. Configure toast auto-dismiss in `ToastStore` (remove after 4000ms)
8. Final visual consistency pass — spacing, typography scale, color palette coherence

**Relevant Context**
- `src/app/shared/components/header/` and `sidebar-filter/`
- Tailwind breakpoints: `sm:640px md:768px lg:1024px xl:1280px`
- Angular `Title` service: inject in each page component

**Status** — `[ ] pending`

---

### Sub-Task 14 — Unit Tests

**Intent**
Write unit tests for every piece of logic in the application. Tests cover correctness of business rules, state transitions, HTTP interactions, routing guards, and pipe transformations. HTML templates and model/interface files are explicitly excluded — only TypeScript logic files get specs.

**Scope — What Gets Tested**

| Category | Files | What to test |
|---|---|---|
| **Services** | `auth.service.ts`, `book.service.ts`, `cart.service.ts`, `order.service.ts`, `payment.service.ts`, `recommendation.service.ts`, `address.service.ts`, `gift-points.service.ts`, `category.service.ts`, `publisher.service.ts`, `delivery.service.ts`, `toast.service.ts` | Correct HTTP method + URL called; query params built correctly; localStorage read/write for auth; mock delay behaviour for payment; pure date calculation for delivery |
| **NgRx Signal Stores** | `auth.store.ts`, `cart.store.ts`, `catalogue.store.ts`, `order.store.ts`, `recommendation.store.ts`, `gift-points.store.ts`, `checkout.store.ts`, `toast.store.ts` | Initial state shape; computed signal values (itemCount, totalPrice, isAuthenticated); state transitions after each method call; loading/error flags set and cleared correctly |
| **Guards** | `auth.guard.ts`, `guest.guard.ts` | Authenticated user passes AuthGuard; unauthenticated user is redirected to `/auth/login` with `returnUrl`; authenticated user is redirected away from `/auth/*` by GuestGuard |
| **Interceptors** | `auth.interceptor.ts`, `error.interceptor.ts` | JWT header is attached when token exists; no header added when no token; 401/403/500 responses trigger toast; request passes through on 2xx |
| **Pipes** | `truncate.pipe.ts`, `currency-format.pipe.ts`, `time-ago.pipe.ts` | Truncation at boundary; currency symbol and decimal formatting; relative time strings (just now, X mins ago, X days ago) |
| **Validators** | Custom `passwordMatchValidator`, gift-points amount validator, card number validator | Valid inputs pass; each invalid case returns the correct error key |
| **Page Components (logic only)** | All page components (`login-page`, `register-page`, `home-page`, `catalogue-page`, `product-detail-page`, `cart-page`, `checkout-*-page`, `order-history-page`, `order-detail-page`, `profile-page`) | Component initialises and injects the correct stores; `ngOnInit` triggers the expected store method; form submission dispatches the correct store action; cancel-within-48h visibility logic; buy-again iterates items and calls addItem; redirect-after-login uses returnUrl |
| **Domain Components (logic only)** | `BookCardComponent`, `CartItemComponent`, `GiftPointsRedeemComponent`, `PaymentMethodSelectorComponent`, `CancelOrderDialogComponent`, `OrderSummaryComponent` | Output events emitted on user interaction; quantity clamping logic; gift-points validation (amount ≤ balance); payment method selection state |

**Scope — What is NOT Tested**
- `*.model.ts` / `*.interface.ts` files — pure type declarations, no runtime logic
- `*.component.html` templates — no DOM/template tests
- `*.component.css` / `*.scss` — no style tests
- `app.config.ts`, `app.routes.ts` — bootstrapping config, not logic
- `environment.ts` / `environment.prod.ts` — constants only
- `server/index.ts` — Express server is backend code, tested manually via API calls during Sub-Task 3
- `scripts/seed-db.ts` — data generation script, not application logic

**Testing Tools & Configuration**
- **Test runner:** Jasmine + Karma (Angular default, already configured by `ng new`)
- **HTTP mocking:** `HttpClientTestingModule` + `HttpTestingController` for all service specs
- **Store testing:** instantiate the signal store with `TestBed`, call methods, assert signal values
- **Guard testing:** use `RouterTestingHarness` or mock `ActivatedRouteSnapshot` + `RouterStateSnapshot`
- **Component testing:** `TestBed.createComponent()` with store and service spies injected; assert component properties and emitted outputs — no template assertions
- One `.spec.ts` file per source `.ts` file being tested, co-located alongside the source file

**Expected Outcomes**
- Every service has a `.spec.ts` covering happy path and at least one error/edge case per method
- Every store has a `.spec.ts` covering: initial state, each method's state mutation, each computed signal, loading/error flag lifecycle
- Every guard has a `.spec.ts` with both the allow and redirect scenarios
- Every interceptor has a `.spec.ts` with token-present and token-absent cases, and error response handling
- Every pipe has a `.spec.ts` covering boundary values and edge cases
- Every custom validator function has a `.spec.ts` covering valid and each invalid case
- Every page component has a `.spec.ts` covering `ngOnInit` store dispatch and key logic methods
- `ng test --no-progress --browsers=ChromeHeadless` passes with zero failures

**Todo List**
1. Verify Karma + Jasmine config in `angular.json` and `karma.conf.js`; confirm `ChromeHeadless` is set as default browser for CI
2. Write specs for all 12 services — use `HttpClientTestingModule` and `HttpTestingController`; verify URL, method, and query params for each service method
3. Write specs for all 8 NgRx Signal Stores — instantiate via `TestBed`, test initial state, each state-mutating method, and all computed signals
4. Write specs for `auth.guard.ts` and `guest.guard.ts` — mock `AuthStore.isAuthenticated` signal, assert `UrlTree` redirect vs `true`
5. Write specs for `auth.interceptor.ts` and `error.interceptor.ts` — use `HttpClientTestingModule`, assert request headers modified and toast triggered on error
6. Write specs for `TruncatePipe`, `CurrencyFormatPipe`, `TimeAgoPipe` — instantiate pipe class directly, no `TestBed` needed
7. Write specs for custom validators (`passwordMatchValidator`, gift-points validator, card validator) — call validator function directly with `AbstractControl` mocks
8. Write specs for all page components — use `TestBed.createComponent()`, provide mock store/service spies, test `ngOnInit` and key logic methods only (no template assertions)
9. Write specs for logic-bearing domain components (`BookCardComponent`, `CartItemComponent`, `GiftPointsRedeemComponent`, `PaymentMethodSelectorComponent`, `CancelOrderDialogComponent`) — test `@Output` emissions and validation logic
10. Run `ng test --no-progress --browsers=ChromeHeadless` and fix any failures
11. Confirm all spec files are co-located with their source file (e.g. `auth.service.spec.ts` next to `auth.service.ts`)

**Relevant Context**
- Angular testing guide: `TestBed`, `HttpClientTestingModule`, `RouterTestingModule`
- NgRx Signal Store testing: provide store in `TestBed.configureTestingModule({ providers: [MyStore] })`, then inject and call methods
- Cancel-within-48h logic is pure TypeScript — test it as a standalone utility function extracted to `src/app/core/utils/order.utils.ts` so it can be unit-tested without a component
- The `delivery.service.ts` date calculation should also be extracted to `src/app/core/utils/delivery-date.util.ts` if not already — makes it trivially testable

**Status** — `[ ] pending`

---

## Dependency Order for Implementation

```
Sub-Task 1 (Scaffold) ✅
  → Sub-Task 2 (Models + Mock Data) ✅
    → Sub-Task 3 (Services) ✅
      → Sub-Task 4 (Signal Stores)
        → Sub-Task 5 (Shared Components)
          → Sub-Tasks 6–12 (Feature Pages, in parallel after Sub-Task 5)
            → Sub-Task 13 (Responsive Polish)
              → Sub-Task 14 (Unit Tests)
```

Sub-Tasks 6 through 12 are largely independent of each other once Sub-Tasks 1–5 are complete and can be implemented in any order.

**Unit-testing note:** Sub-Task 14 is sequenced after all features are built so specs can be written against finalised implementations. However, specs for Sub-Tasks 3–5 (services, stores, pipes) can be written incrementally as each sub-task completes — the todo list in Sub-Task 14 groups them for clarity but they do not all need to wait.
