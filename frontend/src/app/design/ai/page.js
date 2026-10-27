'use client';

import Link from 'next/link';
import { Sparkles, Plus, Coins, MessageSquare } from 'lucide-react';

/**
 * AI Design Studio Dashboard / Chat History Page
 * Phase 4: Lists previous AI chats, available tokens, and lets users start new generation threads.
 */
export default function AIStudioDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            AI Artwork Studio
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Create custom artwork with multi-turn AI assistance and apply directly to your garments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm font-medium">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>5 Free Daily Tokens</span>
          </div>
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-medium opacity-60 cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center max-w-md mx-auto my-12">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-500">
          <MessageSquare className="w-6 h-6" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-3">
          Phase 4 Development
        </span>
        <h2 className="text-base font-bold mb-1">AI Conversations & Asset Studio</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Conversations, reference image handling, and one-click 'Use in Editor' transfers will be integrated here.
        </p>
      </div>
    </div>
  );
}
