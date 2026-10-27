'use client';

import { useState, useRef } from 'react';
import { Upload, Sparkles, Check, AlertTriangle, ShieldCheck, ChevronRight, Save, ShoppingBag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DesignMetricsPanel({
  category,
  selectedColor,
  onSelectColor,
  selectedSize,
  onSelectSize,
  selectedPrintingMethod,
  onSelectPrintingMethod,
  metrics,
  activePlacement,
  onAddArtwork,
  onSave,
  isSaving,
  saveStatus,
}) {
  const [activeTab, setActiveTab] = useState('design'); // 'design' | 'details'
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Available options from category
  const colors = category?.colors || [];
  const sizes = category?.sizes || [];
  const printingMethods = category?.printing_methods || [];

  // File picker handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onAddArtwork(file);
    } catch (err) {
      alert(err.message || 'Failed to upload artwork.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Compute live price
  const basePrice = Number(category?.base_price || 349);
  const printAddon = Number(selectedPrintingMethod?.additional_cost || 0);
  const totalPrice = basePrice + printAddon;

  // Placement label
  const placementLabels = {
    fr: 'Front Placement',
    bk: 'Back Placement',
    lp: 'Left Pocket Placement',
    rp: 'Right Pocket Placement',
    ls: 'Left Sleeve Placement',
    rs: 'Right Sleeve Placement',
  };

  return (
    <aside className="w-full lg:w-96 flex flex-col bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Top Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40">
        <button
          type="button"
          onClick={() => setActiveTab('design')}
          className={cn(
            'flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center',
            activeTab === 'design'
              ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 bg-white dark:bg-neutral-900'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          )}
        >
          Design
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={cn(
            'flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center',
            activeTab === 'details'
              ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 bg-white dark:bg-neutral-900'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          )}
        >
          Product Details
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {activeTab === 'design' ? (
          <>
            {/* Active Placement Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Active View
              </span>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-full">
                {placementLabels[activePlacement] || activePlacement}
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* "Add Your Design" Button (Orange button matching reference image 1 & 3) */}
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Artwork...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Add Your Design</span>
                </>
              )}
            </button>

            {/* Live Design Metrics Box (Matching Reference Image 3) */}
            <div className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                Design Position & Resolution
              </div>

              {/* Width */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-200/60 dark:border-neutral-700/50">
                <span className="text-neutral-500 font-medium">Width</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {metrics?.widthInches ? `${metrics.widthInches.toFixed(2)} in` : '0.00 in'}
                </span>
              </div>

              {/* Height */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-200/60 dark:border-neutral-700/50">
                <span className="text-neutral-500 font-medium">Height</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {metrics?.heightInches ? `${metrics.heightInches.toFixed(2)} in` : '0.00 in'}
                </span>
              </div>

              {/* Image DPI */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-200/60 dark:border-neutral-700/50">
                <span className="text-neutral-500 font-medium">Image DPI</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {metrics?.hasArtwork ? `${metrics.dpi} DPI` : '—'}
                </span>
              </div>

              {/* Design File Quality Rating */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-200/60 dark:border-neutral-700/50">
                <span className="text-neutral-500 font-medium">Design File</span>
                <div>
                  {!metrics?.hasArtwork ? (
                    <span className="text-neutral-400 text-[11px]">No Design Placed</span>
                  ) : metrics?.qualityRating === 'Excellent' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" /> Excellent (300+ DPI)
                    </span>
                  ) : metrics?.qualityRating === 'Good' ? (
                    <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full text-[11px]">
                      Good (Printable)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" /> Low DPI
                    </span>
                  )}
                </div>
              </div>

              {/* Design Angle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-neutral-500 font-medium">Design Angle</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                  {metrics?.rotationAngle ? `${metrics.rotationAngle.toFixed(1)}°` : '0.0°'}
                </span>
              </div>
            </div>

            {/* Printing Options Radio List (Dynamically loaded from DB) */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Printing Options
              </div>
              <div className="space-y-1.5">
                {printingMethods.map((method) => {
                  const isSelected = selectedPrintingMethod?.id === method.id;
                  return (
                    <label
                      key={method.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-xs',
                        isSelected
                          ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-950/20 text-orange-900 dark:text-orange-200'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="printing_method"
                          checked={isSelected}
                          onChange={() => onSelectPrintingMethod(method)}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-neutral-300"
                        />
                        <span className="font-semibold">{method.name}</span>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        {method.additional_cost > 0 ? `+₹${method.additional_cost}` : 'Included'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Product Colors Swatches (Matching Reference Image 1 & 3) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Product Colors
                </span>
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {selectedColor?.name || 'Select Color'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {colors.map((color) => {
                  const isSelected = selectedColor?.id === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      title={color.name}
                      onClick={() => onSelectColor(color)}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all cursor-pointer relative shadow-xs hover:scale-110 flex items-center justify-center',
                        isSelected
                          ? 'border-orange-500 ring-2 ring-orange-500/30 scale-110'
                          : 'border-neutral-300 dark:border-neutral-700'
                      )}
                      style={{ backgroundColor: color.hex_code }}
                    >
                      {isSelected && (
                        <Check
                          className={cn(
                            'w-4 h-4',
                            color.hex_code?.toLowerCase() === '#ffffff' ||
                              color.hex_code?.toLowerCase() === '#f5f5f0' ||
                              color.hex_code?.toLowerCase() === '#e6e6fa'
                              ? 'text-neutral-900'
                              : 'text-white'
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Available Sizes Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Available Sizes
                </span>
                <span className="text-xs font-semibold text-neutral-500">
                  {sizes.length} Sizes
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => onSelectSize(size)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer',
                        isSelected
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm'
                          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                      )}
                    >
                      {size.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Product Details Tab */
          <div className="space-y-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
            <div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 mb-1">
                {category?.name}
              </h4>
              <p>{category?.description || category?.short_description}</p>
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-2">
              <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                Specifications:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-neutral-500 dark:text-neutral-400">
                <li>100% Super Combed Cotton</li>
                <li>Bio-washed & Pre-shrunk fabric</li>
                <li>Ribbed crew neckline & double stitching</li>
                <li>Supported for DTG and DTF high-resolution prints</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/50 space-y-3">
        {/* Total Price Display */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
              Total Estimate
            </span>
            <span className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">
              ₹{totalPrice.toFixed(2)}
            </span>
          </div>

          {/* Save Status Feedback */}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> Saved to Cloud
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
            </span>
          )}
        </div>

        {/* Buttons Row */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="py-3 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Product</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            className="py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Proceed to Order</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
