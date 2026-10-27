'use client';

import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Trash2, RotateCw, AlignCenter, Maximize2, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;

const FabricCanvas = forwardRef(function FabricCanvas(
  {
    activePlacement = 'fr',
    mockupUrl = '/mockups/front.svg',
    selectedColor = null,
    placementConfig = null,
    savedPlacementData = null,
    onMetricsChange = () => {},
  },
  ref
) {
  const containerRef = useRef(null);
  const canvasElRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const activeObjRef = useRef(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [isOutsidePrintArea, setIsOutsidePrintArea] = useState(false);
  const [fabricLib, setFabricLib] = useState(null);

  // Dynamic printable area box from placement configuration
  const printArea = {
    topPct: placementConfig?.print_area_top_pct ?? 24.0,
    leftPct: placementConfig?.print_area_left_pct ?? 28.0,
    widthPct: placementConfig?.print_area_width_pct ?? 44.0,
    heightPct: placementConfig?.print_area_height_pct ?? 52.0,
    maxWidthInches: placementConfig?.max_width_inches ?? 12.0,
    maxHeightInches: placementConfig?.max_height_inches ?? 16.0,
  };

  // Convert percentage to canvas pixel coordinates
  const boxTopPx = (printArea.topPct / 100) * CANVAS_HEIGHT;
  const boxLeftPx = (printArea.leftPct / 100) * CANVAS_WIDTH;
  const boxWidthPx = (printArea.widthPct / 100) * CANVAS_WIDTH;
  const boxHeightPx = (printArea.heightPct / 100) * CANVAS_HEIGHT;

  // Dynamically load Fabric.js only on client
  useEffect(() => {
    let mounted = true;
    import('fabric').then((module) => {
      if (mounted) {
        setFabricLib(module.fabric || module.default || module);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Compute live metrics from the active object
  const calculateMetrics = useCallback(
    (obj) => {
      if (!obj) {
        return {
          widthInches: 0,
          heightInches: 0,
          dpi: 300,
          qualityRating: 'Good',
          rotationAngle: 0,
          hasArtwork: false,
        };
      }

      const scaledW = obj.getScaledWidth();
      const scaledH = obj.getScaledHeight();

      // Ratio of canvas print area pixels to physical inches
      const inchesPerPixelW = printArea.maxWidthInches / boxWidthPx;
      const inchesPerPixelH = printArea.maxHeightInches / boxHeightPx;

      const widthInches = Math.max(0.1, Number((scaledW * inchesPerPixelW).toFixed(2)));
      const heightInches = Math.max(0.1, Number((scaledH * inchesPerPixelH).toFixed(2)));

      // Calculate DPI based on original source image resolution if available
      const origWidth = obj.originalWidthPx || obj.width || 1200;
      const dpi = Math.round(origWidth / Math.max(0.5, widthInches));

      let qualityRating = 'Good';
      if (dpi >= 300) qualityRating = 'Excellent';
      else if (dpi < 150) qualityRating = 'Bad';

      // Normalized angle (-180 to 180 or 0 to 360)
      let rawAngle = Math.round((obj.angle || 0) % 360);
      if (rawAngle > 180) rawAngle -= 360;

      // Check if object is overflowing printable boundary
      const objBound = obj.getBoundingRect(true);
      const isOutside =
        objBound.left < boxLeftPx - 5 ||
        objBound.top < boxTopPx - 5 ||
        objBound.left + objBound.width > boxLeftPx + boxWidthPx + 5 ||
        objBound.top + objBound.height > boxTopPx + boxHeightPx + 5;

      setIsOutsidePrintArea(isOutside);

      return {
        widthInches,
        heightInches,
        dpi,
        qualityRating,
        rotationAngle: rawAngle,
        hasArtwork: true,
      };
    },
    [boxLeftPx, boxTopPx, boxWidthPx, boxHeightPx, printArea.maxWidthInches, printArea.maxHeightInches]
  );

  // Emit updated metrics to parent
  const emitMetricsUpdate = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const artworkObj = objects.find((o) => !o.isGuideline);

    if (artworkObj) {
      const metrics = calculateMetrics(artworkObj);
      const canvasJson = canvas.toJSON(['originalWidthPx', 'originalHeightPx', 'assetUrl']);
      onMetricsChange({
        ...metrics,
        canvasJson,
        designImageUrl: artworkObj.assetUrl || '',
      });
    } else {
      setIsOutsidePrintArea(false);
      onMetricsChange({
        widthInches: 0,
        heightInches: 0,
        dpi: 300,
        qualityRating: 'Good',
        rotationAngle: 0,
        hasArtwork: false,
        canvasJson: {},
        designImageUrl: '',
      });
    }
  }, [calculateMetrics, onMetricsChange]);

  // Initialize or reconfigure canvas on placement switch
  useEffect(() => {
    if (!fabricLib || !canvasElRef.current) return;

    // Dispose old canvas if existing
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }

    const canvas = new fabricLib.Canvas(canvasElRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      selection: true,
      preserveObjectStacking: true,
      backgroundColor: 'transparent',
    });

    fabricCanvasRef.current = canvas;

    // Attach event listeners for real-time tracking
    canvas.on('object:moving', (e) => {
      activeObjRef.current = e.target;
      emitMetricsUpdate();
    });

    canvas.on('object:scaling', (e) => {
      activeObjRef.current = e.target;
      emitMetricsUpdate();
    });

    canvas.on('object:rotating', (e) => {
      activeObjRef.current = e.target;
      emitMetricsUpdate();
    });

    canvas.on('object:modified', () => {
      emitMetricsUpdate();
    });

    canvas.on('selection:created', (e) => {
      setHasSelection(true);
      activeObjRef.current = e.selected?.[0] || null;
      emitMetricsUpdate();
    });

    canvas.on('selection:updated', (e) => {
      setHasSelection(true);
      activeObjRef.current = e.selected?.[0] || null;
      emitMetricsUpdate();
    });

    canvas.on('selection:cleared', () => {
      setHasSelection(false);
      activeObjRef.current = null;
    });

    // Load saved canvas state if available for this placement
    if (savedPlacementData?.canvasJson && Object.keys(savedPlacementData.canvasJson).length > 0) {
      canvas.loadFromJSON(savedPlacementData.canvasJson, () => {
        canvas.renderAll();
        emitMetricsUpdate();
      });
    }

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [fabricLib, activePlacement]); // eslint-disable-line react-hooks/exhaustive-deps

  // Imperative handle for parent to add uploaded artwork or manipulate canvas
  useImperativeHandle(ref, () => ({
    addArtwork: (imageUrl, widthPx = 1200, heightPx = 1200) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !fabricLib) return;

      // Remove existing artwork on this placement (1 active design per placement rule)
      const existing = canvas.getObjects().filter((o) => !o.isGuideline);
      existing.forEach((o) => canvas.remove(o));

      fabricLib.Image.fromURL(
        imageUrl,
        (img) => {
          if (!img) return;

          img.set({
            crossOrigin: 'anonymous',
          });

          // Store metadata for DPI calculation
          img.originalWidthPx = widthPx;
          img.originalHeightPx = heightPx;
          img.assetUrl = imageUrl;

          // Scale image to fit comfortably within the dashed box (approx 70% of box)
          const targetW = boxWidthPx * 0.75;
          const targetH = boxHeightPx * 0.75;
          const scale = Math.min(targetW / (img.width || 1), targetH / (img.height || 1));

          img.scale(scale);

          // Center inside printable bounding box
          img.set({
            left: boxLeftPx + (boxWidthPx - img.getScaledWidth()) / 2,
            top: boxTopPx + (boxHeightPx - img.getScaledHeight()) / 2,
            cornerColor: '#f97316',
            cornerStrokeColor: '#ffffff',
            cornerSize: 10,
            transparentCorners: false,
            borderColor: '#f97316',
            padding: 4,
          });

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          setHasSelection(true);
          activeObjRef.current = img;
          emitMetricsUpdate();
        },
        { crossOrigin: 'anonymous' }
      );
    },

    deleteActiveObject: () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        canvas.remove(activeObj);
        canvas.discardActiveObject();
        canvas.renderAll();
        setHasSelection(false);
        emitMetricsUpdate();
      }
    },

    centerActiveObject: () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        activeObj.set({
          left: boxLeftPx + (boxWidthPx - activeObj.getScaledWidth()) / 2,
          top: boxTopPx + (boxHeightPx - activeObj.getScaledHeight()) / 2,
        });
        activeObj.setCoords();
        canvas.renderAll();
        emitMetricsUpdate();
      }
    },

    rotateActiveObject: (deg = 45) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const activeObj = canvas.getActiveObject();
      if (activeObj) {
        const cur = activeObj.angle || 0;
        activeObj.rotate((cur + deg) % 360);
        activeObj.setCoords();
        canvas.renderAll();
        emitMetricsUpdate();
      }
    },
  }));

  const garmentColorHex = selectedColor?.hex_code || '#F5F5F0';

  return (
    <div className="relative flex flex-col items-center justify-center p-4 select-none">
      {/* Canvas Frame Container */}
      <div
        ref={containerRef}
        className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex items-center justify-center"
        style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }}
      >
        {/* Layer 1: Garment Base Mockup with Dynamic Color Tinting */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none p-3 transition-colors duration-300"
          style={{
            color: garmentColorHex,
          }}
        >
          <img
            src={mockupUrl}
            alt="Garment Mockup"
            className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
            style={{
              color: garmentColorHex,
            }}
          />
        </div>

        {/* Layer 2: Dashed Red Printable Safe Area Box */}
        <div
          className={cn(
            'absolute border-2 border-dashed pointer-events-none transition-all duration-200 rounded-xs',
            isOutsidePrintArea
              ? 'border-red-500 bg-red-500/10 shadow-lg ring-2 ring-red-500/30'
              : 'border-red-500/70 hover:border-red-500'
          )}
          style={{
            top: `${printArea.topPct}%`,
            left: `${printArea.leftPct}%`,
            width: `${printArea.widthPct}%`,
            height: `${printArea.heightPct}%`,
          }}
        >
          {/* Print Area Label */}
          <div className="absolute top-1 left-1.5 flex items-center gap-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider shadow-xs">
            <span>Print Area</span>
            <span className="text-neutral-500 font-normal">
              ({printArea.maxWidthInches}" × {printArea.maxHeightInches}")
            </span>
          </div>

          {/* Overflow Warning Badge */}
          {isOutsidePrintArea && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md whitespace-nowrap animate-bounce">
              <AlertCircle className="w-3 h-3" /> Exceeds Safe Printable Zone
            </div>
          )}
        </div>

        {/* Layer 3: Interactive Fabric.js Canvas */}
        <canvas ref={canvasElRef} className="absolute inset-0 z-10" />
      </div>

      {/* Floating Canvas Quick Controls Bar when Object is Selected */}
      {hasSelection && (
        <div className="mt-3 flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-150 z-20">
          <span className="text-[11px] font-semibold text-neutral-500 mr-1">Controls:</span>
          <button
            type="button"
            onClick={() => ref.current?.centerActiveObject()}
            title="Center Artwork"
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => ref.current?.rotateActiveObject(45)}
            title="Rotate 45°"
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />
          <button
            type="button"
            onClick={() => ref.current?.deleteActiveObject()}
            title="Delete Artwork"
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
});

export default FabricCanvas;
