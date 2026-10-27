# Designer App — CustomCollection Design Engine

## Responsibility
The `designer` app powers the interactive Fabric.js canvas editor. It persists design sessions, manages per-placement state, computes coordinate transformations between canvas pixels and physical inches (DPI 300), and handles Amazon S3 asset storage for artwork and mockups.

## Six Placements Supported
| Placement | Qikink placement_sku | Description |
|-----------|----------------------|-------------|
| Front | `fr` | Chest / Front torso print |
| Back | `bk` | Back torso print |
| Left Pocket | `lp` | Small chest / pocket print (left) |
| Right Pocket | `rp` | Small chest / pocket print (right) |
| Right Shoulder | `rs` | Sleeve / shoulder print (right) |
| Left Shoulder | `ls` | Sleeve / shoulder print (left) |

## Key Planned Models (Phase 3)
1. `DesignSession`: User-owned active session linked to `apps.catalog.Category`, `products.Color`, and `products.Size`.
2. `PlacementDesign`: Canvas state for a specific placement (`placement_sku`), storing Fabric.js canvas JSON, printable dimensions, bounding box, preview mockup URL, and high-res print file S3 key.
3. `DesignAsset`: Customer-uploaded artwork, SVGs, or AI-transferred graphics stored in S3 with MIME type and dimensions.
4. `DesignVersion`: Immutable snapshot of a design session taken when an order is finalized or manual save is triggered.

## Coordinate & Physical Dimensions Math
- Canvas display coordinates (CSS/Fabric pixels) map to physical print boundaries defined in inches.
- Export resolution: 300 DPI (`width_px = width_inches * 300`, `height_px = height_inches * 300`).
- Validates against provider limits (DTG max 16"x20", DTF max 18"x20").
