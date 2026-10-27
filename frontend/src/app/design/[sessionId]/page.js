'use client';

import { useParams } from 'next/navigation';
import { Palette } from 'lucide-react';

/**
 * Fabric.js Design Editor Workspace Page
 * Phase 3: Interactive canvas workspace with 6 placement slots, layer controls, and autosave.
 */
export default function DesignEditorSessionPage() {
  const params = useParams();
  const sessionId = params?.sessionId;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <Palette className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Design Canvas Studio</h1>
          <p className="text-xs text-neutral-500">Session ID: {sessionId}</p>
        </div>
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center max-w-xl mx-auto my-12">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 mb-4">
          Phase 3 Development
        </span>
        <h2 className="text-lg font-bold mb-2">Fabric.js Multi-Placement Canvas</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
          The 6-placement design editor (Front, Back, Pockets, Shoulders) with physical print-area validation will mount here.
        </p>
      </div>
    </div>
  );
}
