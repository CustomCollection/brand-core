# CustomCollection — Frontend

Premium e-commerce frontend built with **Next.js 15**, **React 19**, and **TailwindCSS v4**.

## Tech Stack

| Layer          | Technology                    |
| -------------- | ----------------------------- |
| Framework      | Next.js 15 (App Router)       |
| UI Library     | React 19                      |
| Styling        | TailwindCSS v4                |
| Language       | JavaScript (ES2022+)          |
| State          | React Context + Hooks         |
| API Client     | Native fetch (no Axios)       |
| Auth           | JWT via httpOnly cookies      |
| Guest Cart     | localStorage                  |
| Linting        | ESLint (next/core-web-vitals) |
| Formatting     | Prettier                      |
| Container      | Docker (Node 20 Alpine)       |

## Directory Structure

```
frontend/
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages & layouts
│   │   ├── globals.css      # TailwindCSS v4 + brand design tokens
│   │   ├── layout.js        # Root layout with providers
│   │   └── page.js          # Homepage
│   ├── components/
│   │   ├── ui/              # Reusable UI primitives
│   │   │   ├── Badge.js
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Modal.js
│   │   │   ├── Skeleton.js
│   │   │   ├── Spinner.js
│   │   │   └── Toast.js
│   │   ├── layout/          # Layout components
│   │   │   ├── AnnouncementBar.js
│   │   │   ├── Footer.js
│   │   │   └── Header.js
│   │   ├── product/         # Product-related components
│   │   ├── cart/            # Cart components
│   │   ├── home/            # Homepage sections
│   │   └── checkout/        # Checkout flow components
│   ├── context/             # React Context providers
│   │   ├── AuthContext.js
│   │   ├── CartContext.js
│   │   └── WishlistContext.js
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities & configuration
│   │   ├── api.js           # Centralized fetch client
│   │   ├── constants.js     # App-wide constants
│   │   ├── endpoints.js     # API endpoint definitions
│   │   └── utils.js         # Utility functions
│   └── styles/              # Additional style files
├── Dockerfile               # Multi-stage production build
├── jsconfig.json            # Path aliases (@/*)
├── next.config.mjs          # Next.js configuration
├── postcss.config.mjs       # PostCSS + TailwindCSS v4
├── eslint.config.mjs        # ESLint flat config
├── .prettierrc              # Prettier rules
└── package.json
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable              | Description                | Default                          |
| --------------------- | -------------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL       | `http://localhost:8000/api/v1`   |

### Build & Production

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t custom-collection-frontend .
docker run -p 3000:3000 custom-collection-frontend
```

### Linting & Formatting

```bash
npm run lint           # ESLint check
npm run format         # Prettier format
npm run format:check   # Prettier check only
```

## Design System

### Color Palette

| Token         | Hex       | Usage                |
| ------------- | --------- | -------------------- |
| Primary       | `#0A0A0A` | Backgrounds, CTAs    |
| Secondary     | `#F5F0EB` | Warm off-white       |
| Accent        | `#C9A96E` | Gold highlights      |
| Text Primary  | `#1A1A1A` | Main body text       |
| Text Secondary| `#6B6B6B` | Supporting text      |
| Surface       | `#FAF8F5` | Card backgrounds     |
| Border        | `#E5E1DC` | Dividers & outlines  |
| Error         | `#D64545` | Error states         |
| Success       | `#2D8A4E` | Success states       |

### Typography

- Font: **Inter** (via `next/font/google`)
- Uppercase tracking for labels and navigation
- Light weight for headings, medium for body

### Component Conventions

- All UI components live in `src/components/ui/`
- Use `classNames()` helper for conditional CSS
- Components accept `className` prop for overrides
- Use `forwardRef` for form elements
- Sizes: `sm`, `md`, `lg`
- Variants follow brand palette names

## Architecture Decisions

1. **No TypeScript** — JavaScript with JSDoc for simpler team onboarding
2. **No Axios** — Next.js 15 extended `fetch` handles caching, revalidation
3. **Context over Redux** — Sufficient for this app's state complexity
4. **httpOnly cookies** — More secure than localStorage for JWT tokens
5. **Guest cart in localStorage** — Seamless shopping without forced login
6. **TailwindCSS v4** — Uses the new `@theme` directive and CSS-first config
7. **Standalone output** — Optimized Docker images via `output: 'standalone'`
