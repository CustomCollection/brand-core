"""
Catalog models for the CustomCollection Design Engine.

Responsible for:
- Garment categories available from fulfillment providers (e.g. Oversized T-Shirt, Classic Tee, Hoodie).
- Allowed canonical color and size mappings per category (managed via admin).
- Product variants representing valid category + color + size purchasing combinations.
- Printing methods supported by fulfillment providers (DTG, DTF, etc.).
- Design placement compatibility per category (front, back, pocket, shoulder).
- Provider SKU and product mappings (e.g., Qikink catalog SKU mappings).
"""

from apps.common.models import TimeStampedModel

# Models will be added in Phase 2
