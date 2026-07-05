# CustomCollection — Backend

The Django/DRF backend for the **CustomCollection** premium print-on-demand clothing brand e-commerce platform.

## Architecture Overview

```
backend/
├── config/                  # Django project configuration
│   ├── settings/
│   │   ├── base.py          # Shared settings
│   │   ├── development.py   # Dev-specific overrides
│   │   └── production.py    # Production-specific overrides
│   ├── urls.py              # Root URL configuration
│   ├── wsgi.py
│   └── asgi.py
├── apps/                    # All Django apps
│   ├── common/              # Shared utilities, base models, renderers
│   ├── accounts/            # User authentication & profiles
│   ├── products/            # Product catalog
│   ├── collections/         # Product collections / categories
│   ├── tags/                # Product tagging system
│   ├── cart/                # Shopping cart
│   ├── orders/              # Order management
│   ├── payments/            # Payment processing (Razorpay)
│   ├── reviews/             # Product reviews & ratings
│   ├── wishlist/            # User wishlists
│   └── cms/                 # Content management (banners, pages, etc.)
├── manage.py
├── requirements.txt
├── Dockerfile
├── entrypoint.sh
├── setup.cfg
└── pyproject.toml
```

### Design Principles

- **Thin views, fat services**: All business logic lives in `services.py`, views are thin wrappers.
- **Serializers for validation only**: Serializers handle validation and serialization, not business logic.
- **Consistent API responses**: All responses are wrapped in `{status, data, message}` format via custom renderers.
- **Print-on-Demand**: No inventory management or stock tracking — products are printed on demand.
- **Cloudinary for images**: Image files are stored on Cloudinary; only URLs are persisted in PostgreSQL.

## Getting Started

### Prerequisites

- Python 3.12+
- PostgreSQL 15+
- A Cloudinary account (for image storage)

### Local Development Setup

1. **Clone & navigate:**
   ```bash
   git clone <repo-url>
   cd brand-core/backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate    # Linux/Mac
   venv\Scripts\activate       # Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file** in the `backend/` directory (see [Environment Variables](#environment-variables) below).

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser:**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

### Docker Setup

```bash
docker build -t customcollection-backend .
docker run --env-file .env -p 8000:8000 customcollection-backend
```

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

| Variable | Description | Default |
|---|---|---|
| `DJANGO_SECRET_KEY` | Django secret key | **(required)** |
| `DJANGO_ENV` | `development` or `production` | `development` |
| `DB_NAME` | PostgreSQL database name | `brand_core` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `""` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `""` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `""` |
| `EMAIL_HOST_USER` | Gmail address for SMTP | `""` |
| `EMAIL_HOST_PASSWORD` | Gmail app password | `""` |
| `DEFAULT_FROM_EMAIL` | Sender email address | `noreply@customcollection.com` |
| `JWT_COOKIE_SECURE` | Secure flag for JWT cookies | `False` |
| `JWT_COOKIE_DOMAIN` | Domain for JWT cookies | `None` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts (production) | — |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins (production) | — |

## App Structure

Each app follows a consistent structure:

```
apps/<app_name>/
├── __init__.py
├── apps.py           # AppConfig
├── models.py         # Django models
├── serializers.py    # DRF serializers (validation only)
├── views.py          # Thin views (delegates to services)
├── urls.py           # URL routing
├── services.py       # Business logic
├── admin.py          # Admin configuration
├── permissions.py    # Custom permissions (where needed)
└── tests/
    └── __init__.py
```

## API Documentation

Once the server is running, API documentation is available at:

| URL | Description |
|---|---|
| `/api/docs/` | Swagger UI (interactive) |
| `/api/redoc/` | ReDoc (read-only) |
| `/api/schema/` | OpenAPI 3.0 JSON schema |
| `/admin/` | Django admin panel |
| `/health/` | Health check endpoint |

## API Response Format

All API responses follow a consistent envelope format:

**Success:**
```json
{
    "status": "success",
    "data": { ... },
    "message": null
}
```

**Error:**
```json
{
    "status": "error",
    "message": "Human-readable error message",
    "errors": { "field": ["Field-level error"] }
}
```

## Code Quality

This project uses:
- **black** (line-length: 99) for code formatting
- **isort** (profile: black) for import sorting
- **flake8** (max-line-length: 99) for linting

```bash
# Format code
black .
isort .

# Lint
flake8
```

## Tech Stack

- **Framework**: Django 5.1 + Django REST Framework
- **Auth**: JWT via httpOnly cookies (SimpleJWT)
- **Database**: PostgreSQL
- **Image Storage**: Cloudinary
- **Payments**: Razorpay
- **API Docs**: drf-spectacular (OpenAPI 3.0)
- **Server**: Gunicorn (production)
- **Containerization**: Docker
