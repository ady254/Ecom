# MINARA E-Commerce Platform

## Project Overview

MINARA is a monorepo e-commerce platform built for luxury gifting and retail. It consists of three separate apps that work together:

- **API**: The backend service providing authentication, shop catalog, orders, payments, webhooks, and admin APIs.
- **Store**: The customer-facing storefront where users browse products, place orders, and manage accounts.
- **Admin**: The merchant dashboard for managing products, orders, banners, coupons, customers, and settings.

This repository uses a monorepo architecture with workspace packages for shared configuration and types.

## Architecture

The project is organized as a monorepo with isolated apps and shared libraries:

- `apps/api`: Express-based Node API service with TypeScript, MongoDB, authentication, payment integration, and admin seeding scripts.
- `apps/store`: Next.js storefront app with server-side rendering, API integration, auth flows, and storefront UI.
- `apps/admin`: Next.js admin dashboard app with protected management pages.
- `packages/config`: Shared configuration utilities and constants.
- `packages/types`: Shared TypeScript types used by both frontend and backend.
- `packages/utils`: Shared utility functions for common tasks.

### Deployment architecture

The intended deployment model is:

- Each app is deployed as a separate Node.js application on Hostinger.
- `apps/api` serves as the backend API and webhook handler.
- `apps/store` and `apps/admin` run as standalone Next.js apps behind Node.js processes.
- The Store and Admin apps communicate with the API via `NEXT_PUBLIC_API_URL`.
- Razorpay is used for payment processing and webhooks.

## Tech Stack

### Backend

- Node.js
- Express
- TypeScript
- Mongoose / MongoDB
- Zod for validation
- JSON Web Tokens for auth
- Razorpay for payment gateway
- Nodemailer for email
- Cloudinary for image handling

### Frontend

- Next.js
- React 19
- Tailwind CSS v4
- Zustand for client state
- NextAuth for authentication
- Axios for HTTP requests
- Framer Motion for animations
- Radix UI components
- Swiper for carousels

### Tooling

- pnpm
- Turborepo for workspace orchestration
- TypeScript
- ESLint
- Prettier
- TSUP for backend bundling
- Vitest for backend tests

## Folder Structure

- `apps/api/` — Backend service.
- `apps/store/` — Customer storefront.
- `apps/admin/` — Admin dashboard.
- `packages/config/` — Shared configuration.
- `packages/types/` — Shared types.
- `packages/utils/` — Shared utility helpers.
- `DEPLOYMENT.md` — Deployments guide for Hostinger.

## Important Package Versions

- `node`: >= 20.0.0
- `pnpm`: >= 9.0.0
- `next`: 14.2.3
- `react`: 19.2.4
- `react-dom`: 19.2.4
- `turbo`: ^2.3.3

## Running Locally

### Install dependencies

```bash
pnpm install
```

### API

```bash
pnpm --filter @minara/api dev
```

### Store

```bash
pnpm --filter @minara/store dev
```

### Admin

```bash
pnpm --filter @minara/admin dev
```

### Full monorepo commands

```bash
pnpm install
pnpm dev
```

## Build Commands

### API

```bash
pnpm --filter @minara/api build
```

### Store

```bash
pnpm --filter @minara/store build
```

### Admin

```bash
pnpm --filter @minara/admin build
```

## Deployment Notes

- The repository is designed for Hostinger Node.js deployment.
- The backend app should use `apps/api/dist/server.js` as the startup file.
- Store and Admin should use their `.next/standalone/apps/<app>/server.js` startup file.
- `NEXT_PUBLIC_API_URL` must point to the deployed API endpoint.
- Hostinger shared hosting may not allow building large Next.js apps directly due to thread limits, so local build and upload of the standalone output can be required.

## Environment Variables

### API

The following environment variables are required for the API app:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `FRONTEND_URL`
- `ADMIN_URL`
- `NODE_ENV=production`
- `COOKIE_SAMESITE=none`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`

### Store / Admin

- `NEXT_PUBLIC_API_URL` (e.g. `https://api-xxxxx.hostingersite.com/api/v1`)

## Known Hostinger Build Constraints

- Hostinger SSH build may fail on Next.js due to resource limits and thread pool restrictions.
- If build fails on the server, build locally and upload the generated `.next/standalone` folder.
- Use `pnpm install` and `pnpm build` locally, then copy built files to the server.

## Helpful Commands

### Clean workspace

```bash
pnpm clean
```

### Run typecheck

```bash
pnpm --filter @minara/api typecheck
pnpm --filter @minara/store typecheck
pnpm --filter @minara/admin typecheck
```

### Run lints

```bash
pnpm --filter @minara/api lint
pnpm --filter @minara/store lint
pnpm --filter @minara/admin lint
```

## Summary

MINARA is a multi-app e-commerce platform built as a monorepo with shared packages. The architecture separates backend API, customer store, and admin dashboard. The platform uses modern tools like Next.js, Express, MongoDB, and Razorpay, with deployment optimized for Hostinger Node.js hosting.
