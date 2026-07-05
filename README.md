# CustomCollection — Premium Clothing Brand

A production-grade, API-first e-commerce platform for an independent premium clothing brand operating on a **Print-on-Demand** model.

Built with **Django + DRF** (backend) and **Next.js 15** (frontend).

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Business Model](#business-model)

---

## Overview

**CustomCollection** is an independent premium clothing brand that sells high-quality T-Shirts through a Print-on-Demand workflow. Products are printed and shipped only after a customer places an order — there is no pre-held inventory.

### Key Features

- 🛍️ **Product Catalog** — Browse, filter, and search premium T-Shirts
- 🏷️ **Collections & Tags** — Organize products by fit (Oversized, Regular) and design style (Minimal, Graphic, Anime)
- 🛒 **Smart Cart** — Guest cart (localStorage) with seamless merge on login
- 💳 **Payments** — Razorpay online payments + Cash on Delivery
- 📦 **Order Tracking** — Real-time order status from Printing → Shipped → Delivered
- ❤️ **Wishlist** — Save favorite products for later
- ⭐ **Reviews** — Verified purchase reviews with admin moderation
- 🎨 **CMS** — All homepage content managed from Django Admin
- 📱 **Responsive** — Mobile-first premium design
- 🔒 **Secure** — JWT via httpOnly cookies, rate limiting, CORS protection

---

## Architecture

```
┌─────────────────┐     REST API (JSON)     ┌─────────────────────┐
│   Next.js 15    │ ◄──────────────────────► │   Django + DRF      │
│   (Frontend)    │     httpOnly Cookies     │   (Backend API)     │
│   Port 3000     │                          │   Port 8000         │
└─────────────────┘                          └─────────┬───────────┘
                                                       │
                          ┌────────────────────────────┼────────────────────────────┐
                          │                            │                            │
                  ┌───────▼───────┐           ┌───────▼───────┐           ┌────────▼────────┐
                  │  PostgreSQL   │           │  Cloudinary   │           │    Razorpay     │
                  │  (Database)   │           │  (Images)     │           │    (Payments)   │
                  └───────────────┘           └───────────────┘           └─────────────────┘
```

**Principles:**
- **API-first** — Frontend never touches the database directly
- **Service Layer** — Business logic in `services.py`, thin views
- **Admin as Operations Panel** — Django Admin for all business management
- **Dynamic CMS** — All content editable from admin, no code changes needed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5.1, Django REST Framework |
| Frontend | Next.js 15, JavaScript, TailwindCSS v4 |
| Database | PostgreSQL 16 |
| Auth | JWT (httpOnly cookies) via SimpleJWT |
| Images | Cloudinary (Django SDK) |
| Payments | Razorpay + Cash on Delivery |
| Email | Gmail SMTP |
| API Docs | drf-spectacular (OpenAPI, Swagger, ReDoc) |
| Deployment | Docker, Docker Compose |
| Code Quality | black, isort, flake8 (backend) / ESLint, Prettier (frontend) |

---

## Project Structure

```
brand-core/
├── backend/                # Django backend
│   ├── apps/               # Modular Django apps
│   │   ├── accounts/       # Auth, profiles, addresses
│   │   ├── products/       # Product catalog
│   │   ├── collections/    # Product collections (Oversized, Regular Fit)
│   │   ├── tags/           # Product tags (Minimal, Graphic, Anime)
│   │   ├── cart/           # Shopping cart
│   │   ├── orders/         # Order management
│   │   ├── payments/       # Payment processing
│   │   ├── reviews/        # Product reviews
│   │   ├── wishlist/       # User wishlist
│   │   ├── cms/            # Content management (banners, sections, config)
│   │   └── common/         # Shared utilities, base models, exceptions
│   ├── config/             # Django project configuration
│   │   └── settings/       # Split settings (base, dev, prod)
│   ├── templates/          # Email templates
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # API client, utilities, constants
│   │   └── styles/         # Additional styles
│   ├── public/             # Static assets
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Full-stack orchestration
├── .env.example            # Environment variables template
├── .gitignore
└── README.md               # This file
```

See [backend/README.md](./backend/README.md) and [frontend/README.md](./frontend/README.md) for detailed documentation.

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js 20+](https://nodejs.org/) (for local frontend development)
- [Python 3.12+](https://python.org/) (for local backend development)

### Quick Start with Docker

```bash
# 1. Clone the repository
git clone <repo-url> brand-core
cd brand-core

# 2. Create environment file
cp .env.example .env
# Edit .env with your actual credentials

# 3. Build and run
docker compose up --build

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/v1/
# Django Admin: http://localhost:8000/admin/
# Swagger UI: http://localhost:8000/api/v1/docs/
# ReDoc: http://localhost:8000/api/v1/redoc/
```

### Local Development (without Docker)

See the README files in `backend/` and `frontend/` directories for instructions on running each service locally.

---

## Environment Variables

Copy `.env.example` to `.env` and configure the following:

| Variable | Description | Required |
|---|---|---|
| `DJANGO_SECRET_KEY` | Django secret key | ✅ |
| `DJANGO_ENV` | `development` or `production` | ✅ |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | PostgreSQL connection | ✅ |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary credentials | ✅ |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay credentials | ✅ |
| `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | Gmail SMTP credentials | ✅ |
| `FRONTEND_URL` | Frontend URL for email links | ✅ |
| `NEXT_PUBLIC_API_URL` | Backend API URL for frontend | ✅ |

See `.env.example` for the complete list with defaults.

---

## API Documentation

Once the backend is running:

| Format | URL |
|---|---|
| **Swagger UI** | `http://localhost:8000/api/v1/docs/` |
| **ReDoc** | `http://localhost:8000/api/v1/redoc/` |
| **OpenAPI Schema** | `http://localhost:8000/api/v1/schema/` |

---

## Business Model

### Print-on-Demand Workflow

```
Customer browses → Adds to cart → Places order → Payment
         ↓
Admin receives order → Prints design on T-shirt → Packs → Ships
         ↓
Customer receives tracking → Delivery
```

### Order Statuses

| Status | Description |
|---|---|
| `Pending` | Order placed, awaiting confirmation |
| `Confirmed` | Order confirmed by admin |
| `Printing` | Design being printed on T-shirt |
| `Packed` | Order packed and ready for shipping |
| `Shipped` | Order shipped with tracking number |
| `Delivered` | Order delivered to customer |
| `Cancelled` | Order cancelled |
| `Returned` | Order returned by customer |

### No Inventory

Products are always available. Customers choose Size and Color as preferences. There is no stock tracking, quantity limits, or inventory management.

---

## License

Proprietary. All rights reserved.
