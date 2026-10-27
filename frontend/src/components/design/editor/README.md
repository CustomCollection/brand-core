# Fabric.js Design Editor Components (`src/components/design/editor/`)

## Purpose
This directory houses the manual canvas components built using **Fabric.js** for the custom product editor.

## Key Planned Components (Phase 3)
- `FabricCanvasWrapper.js`: Manages the `<canvas>` element lifecycle, initialization, event handlers, and resize observers.
- `PlacementTabBar.js`: Navigation for the 6 placement views (`fr`, `bk`, `lp`, `rp`, `rs`, `ls`) with visual indicators of active artwork.
- `DesignToolbar.js`: Tool palette for uploading custom artwork, adding text, shapes, aligning, centering, and layer reordering.
- `ObjectPropertyInspector.js`: Controls for selected canvas object (scale, rotation, opacity, color tinting, delete).
- `PrintBoundaryOverlay.js`: Visual boundary guide showing the maximum printable area (in inches / DPI) for the active placement and print type.
- `MockupPreviewViewer.js`: High-fidelity garment preview rendering the canvas design on top of real garment placement photos.
- `SessionHeader.js`: Title, autosave status indicator ("Saving...", "Saved"), garment color/size selector, and "Proceed to Order" action.
