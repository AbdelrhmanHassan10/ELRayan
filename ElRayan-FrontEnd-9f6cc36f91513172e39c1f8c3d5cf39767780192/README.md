# Al Rayan E-Commerce Frontend

A complete user-facing e-commerce website built with React + Vite + TypeScript + Tailwind CSS, connected to the Al Rayan NestJS backend.

## Getting Started

### Prerequisites
- Node.js 18+
- Al Rayan backend running on port 4000

### Install & Run

```bash
cd "d:/Work/El rayan E-commerce/alrayan_frontend"
npm install
npm run dev
```

The app runs on **http://localhost:3000** and proxies API calls to `http://localhost:4000`.

## Features

| Page | Path | Auth Required |
|------|------|:---:|
| Home | `/` | No |
| Shop / Browse | `/shop` | No |
| Product Detail | `/product/:id` | No |
| Shopping Cart | `/cart` | Yes |
| Checkout | `/checkout` | Yes |
| My Orders | `/orders` | Yes |
| Order Detail | `/orders/:id` | Yes |
| Favorites / Wishlist | `/favorites` | Yes |
| My Profile | `/profile` | Yes |
| Addresses | `/addresses` | Yes |
| Notifications | `/notifications` | Yes |
| My Coupons | `/coupons` | Yes |
| Spin Wheel | `/spin-wheel` | Yes |
| Support / Complaints | `/complaints` | Yes |
| Login | `/login` | Guest only |
| Register | `/register` | Guest only |
| Verify OTP | `/verify-otp` | — |
| Forgot Password | `/forgot-password` | Guest only |
| Reset Password | `/reset-password` | — |

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** — brand colors: `#C8102E` (primary red) + `#1A1F2E` (dark navy)
- **React Router v6** — client-side routing
- **TanStack Query v5** — data fetching & caching
- **React Hook Form** — form handling
- **Axios** — API client with JWT interceptor
- **Swiper** — banner slider
- **React Hot Toast** — notifications
- **Lucide React** — icons

## API Connection

The Vite dev server proxies `/api/*` to `http://localhost:4000` so no CORS issues during development.

Token is stored in `localStorage` under key `accessToken`.
