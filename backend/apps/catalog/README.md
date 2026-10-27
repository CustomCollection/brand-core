# Catalog App — CustomCollection Design Engine

## Responsibility
The `catalog` app is the single source of truth for customizable garment types, allowable variants, printing capabilities, and fulfillment provider mappings.

### Distinction from `collections`
- `collections` (`apps.collections`): Used for grouping predefined, ready-to-buy store products (e.g. "Oversized Fit", "Anime Collection").
- `catalog` (`apps.catalog`): Defines raw customizable blanks/garments available from print-on-demand providers (e.g. Oversized T-Shirt, Regular Tee, Hoodie) on which custom designs can be placed.

## Key Planned Models (Phase 2)
1. `Category`: Customizable product category (name, slug, base price, mockup template images for 6 placements, active status).
2. `CategoryColor`: Join table linking Category to canonical `products.Color` with category-specific availability flag.
3. `CategorySize`: Join table linking Category to canonical `products.Size` with category-specific availability flag.
4. `ProductVariant`: Canonical SKU representing valid (Category, Color, Size) combinations.
5. `PrintingMethod`: Supported printing techniques (e.g. DTG, DTF) with width/height limits and provider codes.
6. `PlacementCompatibility`: Matrix linking Category, Placement (`fr`, `bk`, `lp`, `rp`, `rs`, `ls`), and PrintingMethod with maximum printable dimensions (inches).
7. `ProviderProductMapping`: Maps canonical internal variants to provider SKUs (e.g. Qikink SKU `MVnHs-Wh-S`).

## Planned API Endpoints
- `GET /api/v1/catalog/categories/`: Active categories with thumbnail and supported placements.
- `GET /api/v1/catalog/categories/<slug>/`: Detailed category specifications, available colors, and sizes.
- `GET /api/v1/catalog/categories/<slug>/placements/`: Allowed placements, mockups, and printable boundaries.
- `GET /api/v1/catalog/printing-methods/`: Available printing methods and physical constraints.
