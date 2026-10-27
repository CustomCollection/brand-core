'use client';

import { useParams } from 'next/navigation';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * AI Design Workspace Chat Thread Page
 * Phase 4: Active conversational artwork generation, reference upload, image editing, and editor transfer.
 */
export default function AIChatThreadPage() {
  const params = useParams();
  const chatId = params?.chatId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/design/ai"
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h1 className="text-lg font-bold">AI Artwork Generator</h1>
          <span className="text-xs text-neutral-400">Thread: {chatId}</span>
        </div>
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center my-12">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-3">
          Phase 4 Development
        </span>
        <h2 className="text-base font-bold mb-1">Multi-Turn Design Chat Interface</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
          Text LLM prompt planning, text-to-image synthesis, single-reference image uploads, and editor placement actions will render here.
        </p>
      </div>
    </div>
  );
}
