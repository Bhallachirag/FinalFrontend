# VaxFlow — Frontend

React frontend for **VaxFlow**, a vaccine booking and inventory platform. Talks to the backend exclusively through the API Gateway, so the client never needs to know which microservice actually handles a request.

## Features

- **Vaccine search & browsing** — search and filter available vaccines with live inventory data pulled from the backend.
- **Cart-based booking** — add multiple vaccines to a cart and check out in one flow, backed by the Booking Service's FIFO batch pricing.
- **Auth flow** — login/signup modal wired to the Auth Service, with the session persisted client-side.
- **Order history** — a "My Orders" page showing a user's past bookings.
- **Admin page** — a separate view for managing vaccines and inventory.
- **Global notifications** — a lightweight in-app notification system for success/error feedback across the app.

## Architecture

State is split by domain into small Zustand stores instead of one global store, and each backend resource has its own service module that wraps the actual API calls:

```
src/
├── stores/            # authStore, cartStore, vaccineStore, notificationStore (Zustand)
├── services/            # authService, vaccineService, bookingService — API call wrappers
├── components/
│   ├── auth/              # AuthProvider, LoginModal
│   ├── cart/              # Cart
│   ├── vaccine/           # VaccineCard, SearchFilter
│   ├── layout/            # Header
│   └── common/            # LoadingSpinner, Notification
├── pages/               # HomePage, MyOrders, AdminPage
├── hooks/                # useApi, useLocalStorage
└── utils/                # api client, constants, validators, helpers
```

## Tech Stack

React 19 · React Router 7 · Zustand · Tailwind CSS 4 · Vite · Lucide Icons

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

### Environment

Point the frontend at your locally running API Gateway (default `http://localhost:4005`) via the API client config in `src/utils/api.js`.

## Part of the VaxFlow microservices

- **Frontend** (this repo)
- [API Gateway](https://github.com/Bhallachirag/API_Gateway)
- [Auth Service](https://github.com/Bhallachirag/Auth_Service)
- [Vaccine & Search Service](https://github.com/Bhallachirag/VaccineAndSearchService)
- [Booking Service](https://github.com/Bhallachirag/VaccineBookingService)
- [Reminder Service](https://github.com/Bhallachirag/ReminderService)

#### Author
-Chirag Bhalla
