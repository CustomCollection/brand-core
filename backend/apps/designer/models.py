"""
Design editor models for the CustomCollection Design Engine.

Responsible for:
- User design sessions (active garment selection, selected color/size, session state).
- Independent placement canvas states (JSON representation of Fabric.js canvas for fr, bk, lp, rp, rs, ls).
- Design versioning and snapshot immutability for completed orders.
- Artwork and rendered preview assets stored in Amazon S3.
- Physical print area boundaries and pixel-to-inch dimension tracking.
"""

from apps.common.models import TimeStampedModel

# Models will be added in Phase 3
