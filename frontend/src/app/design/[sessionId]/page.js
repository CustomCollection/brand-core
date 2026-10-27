'use client';

import { use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import useDesignSession from '@/hooks/useDesignSession';
import PlacementSidebar from '@/components/design/editor/PlacementSidebar';
import FabricCanvas from '@/components/design/editor/FabricCanvas';
import DesignMetricsPanel from '@/components/design/editor/DesignMetricsPanel';

export default function DesignEditorSessionPage({ params }) {
  // In Next.js 15 App Router, dynamic params can be a Promise
  const resolvedParams = use(params);
  const sessionId = resolvedParams?.sessionId;
  const router = useRouter();
  const canvasRef = useRef(null);

  const {
    session,
    category,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedPrintingMethod,
    setSelectedPrintingMethod,
    activePlacement,
    setActivePlacement,
    placementsState,
    activeMetrics,
    updatePlacementMetrics,
    isLoading,
    isSaving,
    saveStatus,
    error,
    saveSession,
    uploadArtworkFile,
  } = useDesignSession(sessionId);

  // Active placement configuration
  const activePlacementConfig = category?.placements?.find(
    (p) => p.placement === activePlacement
  ) || {
    placement: activePlacement,
    max_width_inches: 12.0,
    max_height_inches: 16.0,
    print_area_top_pct: 24.0,
    print_area_left_pct: 28.0,
    print_area_width_pct: 44.0,
    print_area_height_pct: 52.0,
  };

  // Active mockup URL
  const activeMockupUrl =
    activePlacementConfig?.mockup_url ||
    category?.mockups?.[activePlacement] ||
    `/mockups/${activePlacement === 'fr' ? 'front' : activePlacement === 'bk' ? 'back' : activePlacement === 'lp' ? 'left_pocket' : activePlacement === 'rp' ? 'right_pocket' : activePlacement === 'ls' ? 'left_sleeve' : 'right_sleeve'}.svg`;

  // Handle artwork addition from file picker
  const handleAddArtwork = async (file) => {
    // 1. Upload to backend
    const asset = await uploadArtworkFile(file);

    // 2. Add to active Fabric.js canvas
    if (canvasRef.current && asset?.image_url) {
      canvasRef.current.addArtwork(
        asset.image_url,
        asset.width_px || 1200,
        asset.height_px || 1200
      );
    }
  };

  // Metrics update from canvas
  const handleCanvasMetricsChange = (metrics) => {
    updatePlacementMetrics(activePlacement, metrics);
  };

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-8">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
        <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
          Loading Custom Design Studio...
        </p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold mb-2">Design Session Not Found</h2>
        <p className="text-xs text-neutral-500 mb-6">{error}</p>
        <Link
          href="/design"
          className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider"
        >
          Return to Garment Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100/60 dark:bg-neutral-950 pb-16">
      {/* Top Header Bar matching user's reference image 1 */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Back button & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <Link
              href="/design"
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
              <span>Choose Blanks</span>
              <span>›</span>
              <span className="text-neutral-700 dark:text-neutral-200 font-semibold truncate max-w-[200px]">
                {category?.name}
              </span>
              <span>›</span>
              <span className="text-orange-600 dark:text-orange-400 font-bold">
                Custom Studio
              </span>
            </div>
          </div>

          {/* Center: Garment Name & Active Color */}
          <div className="text-center truncate hidden sm:block">
            <h1 className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100 truncate">
              {category?.name || 'Custom Garment'}
            </h1>
            <span className="text-[11px] text-neutral-400 font-medium">
              Color: {selectedColor?.name || 'Default'}
            </span>
          </div>

          {/* Right: Quick Save Action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={saveSession}
              className="py-2 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Body: 3-column layout */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Column 1: Placement Sidebar (6 placements) */}
          <PlacementSidebar
            activePlacement={activePlacement}
            onSelectPlacement={setActivePlacement}
            placementsState={placementsState}
            category={category}
            selectedColor={selectedColor}
          />

          {/* Column 2: Center Interactive Fabric.js Canvas */}
          <div className="flex-1 flex flex-col items-center w-full">
            <FabricCanvas
              ref={canvasRef}
              activePlacement={activePlacement}
              mockupUrl={activeMockupUrl}
              selectedColor={selectedColor}
              placementConfig={activePlacementConfig}
              savedPlacementData={placementsState[activePlacement]}
              onMetricsChange={handleCanvasMetricsChange}
            />
          </div>

          {/* Column 3: Right Design Metrics Panel */}
          <DesignMetricsPanel
            category={category}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
            selectedPrintingMethod={selectedPrintingMethod}
            onSelectPrintingMethod={setSelectedPrintingMethod}
            metrics={activeMetrics}
            activePlacement={activePlacement}
            onAddArtwork={handleAddArtwork}
            onSave={saveSession}
            isSaving={isSaving}
            saveStatus={saveStatus}
          />
        </div>
      </main>
    </div>
  );
}
