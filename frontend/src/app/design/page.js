'use client';

import Link from 'next/link';
import { Palette, Sparkles, Shirt } from 'lucide-react';

/**
 * Design Engine Hub / Category Selection
 * Phase 2 & 3: Users choose a customizable product category to design.
 */
export default function DesignHubPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
          <Sparkles className="w-3.5 h-3.5" /> Design Studio
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">
          Create Your Custom Product
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-base sm:text-lg">
          Select an available garment style to design with our multi-placement editor or generate artwork with AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Manual Studio Card */}
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 bg-white dark:bg-neutral-900 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6 text-neutral-900 dark:text-neutral-100">
              <Shirt className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Interactive Product Designer</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-6">
              Customize Oversized Tees, Hoodies, and more across 6 printable placements (Front, Back, Pockets, Shoulders).
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider block mb-2">Phase 2 & 3</span>
            <button
              disabled
              className="w-full py-3 px-4 rounded-xl bg-neutral-100 text-neutral-400 text-sm font-semibold cursor-not-allowed text-center"
            >
              Interactive Canvas Initializing...
            </button>
          </div>
        </div>

        {/* AI Studio Card */}
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 bg-white dark:bg-neutral-900 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">AI Artwork Studio</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-6">
              Describe your creative idea, upload references, and generate high-resolution print-ready designs for any garment.
            </p>
          </div>
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider block mb-2">Phase 4</span>
            <Link
              href="/design/ai"
              className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold text-center block transition-colors"
            >
              Enter AI Studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
