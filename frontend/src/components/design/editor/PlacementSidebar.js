'use client';

import { Check, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLACEMENTS_METADATA = [
  { code: 'fr', label: 'Front', defaultMockup: '/mockups/front.svg' },
  { code: 'bk', label: 'Back', defaultMockup: '/mockups/back.svg' },
  { code: 'lp', label: 'Left Pocket', defaultMockup: '/mockups/left_pocket.svg' },
  { code: 'rp', label: 'Right Pocket', defaultMockup: '/mockups/right_pocket.svg' },
  { code: 'ls', label: 'Left Sleeve', defaultMockup: '/mockups/left_sleeve.svg' },
  { code: 'rs', label: 'Right Sleeve', defaultMockup: '/mockups/right_sleeve.svg' },
];

export default function PlacementSidebar({
  activePlacement,
  onSelectPlacement,
  placementsState = {},
  category = null,
  selectedColor = null,
}) {
  const colorHex = selectedColor?.hex_code || '#F5F5F0';

  return (
    <aside className="w-24 sm:w-28 flex-shrink-0 flex flex-col items-center py-2 px-1 select-none">
      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
        Views (6)
      </div>

      <div className="flex flex-col gap-3 w-full">
        {PLACEMENTS_METADATA.map((item) => {
          const isActive = activePlacement === item.code;
          const placementData = placementsState[item.code] || {};
          const hasArtwork = !!placementData.hasArtwork;

          // Check if category has a custom mockup URL for this placement
          const customMockup = category?.mockups?.[item.code];
          const mockupSrc = customMockup || item.defaultMockup;

          return (
            <button
              key={item.code}
              type="button"
              onClick={() => onSelectPlacement(item.code)}
              className={cn(
                'group relative flex flex-col items-center w-full p-1.5 rounded-xl border transition-all duration-200 cursor-pointer',
                isActive
                  ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 shadow-md ring-2 ring-orange-500/20'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
              )}
            >
              {/* Thumbnail Container */}
              <div
                className="relative w-full aspect-square rounded-lg overflow-hidden flex items-center justify-center p-1 bg-neutral-100 dark:bg-neutral-800"
                style={{
                  color: colorHex,
                }}
              >
                {/* Garment Mockup Image */}
                <img
                  src={mockupSrc}
                  alt={item.label}
                  className="w-full h-full object-contain filter drop-shadow-sm transition-transform group-hover:scale-105"
                  style={{
                    color: colorHex,
                  }}
                />

                {/* Has Artwork Active Dot */}
                {hasArtwork && (
                  <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'mt-1.5 text-[11px] font-semibold tracking-tight text-center truncate max-w-full',
                  isActive
                    ? 'text-orange-600 dark:text-orange-400 font-bold'
                    : 'text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
