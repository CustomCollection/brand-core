'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Shirt, Palette, ChevronRight, Layers, Check, Loader2 } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { DESIGN_ENDPOINTS } from '@/lib/designEndpoints';

export default function DesignHubPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startingSlug, setStartingSlug] = useState(null);

  useEffect(() => {
    apiGet(DESIGN_ENDPOINTS.CATALOG.CATEGORIES)
      .then((data) => {
        // ApiRenderer unwraps data.results or data
        const items = data?.results || (Array.isArray(data) ? data : []);
        setCategories(items);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleStartDesigning = async (slug) => {
    setStartingSlug(slug);
    try {
      const res = await apiPost(DESIGN_ENDPOINTS.DESIGNER.SESSIONS, {
        category_slug: slug,
      });
      if (res?.id) {
        router.push(`/design/${res.id}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to start design session');
      setStartingSlug(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
          <Palette className="w-3.5 h-3.5 text-orange-600" /> Interactive Product Designer
        </span>
        <h1 className="text-3xl sm:text-5xl font-black mt-3 tracking-tight text-neutral-900 dark:text-neutral-100">
          Design Your Own Apparel
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-base sm:text-lg">
          Choose a premium garment blank, upload artwork across 6 placements (Front, Back, Pockets, Sleeves), and inspect physical print dimensions in real time.
        </p>
      </div>

      {/* Garments Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
          <p className="text-sm font-semibold text-neutral-500">Loading customizable blanks...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8">
          <Shirt className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">No Categories Configured</h3>
          <p className="text-xs text-neutral-500">
            Please add customizable categories in Django Admin under Catalog &gt; Categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const isStarting = startingSlug === cat.slug;
            return (
              <div
                key={cat.id}
                className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Mockup Preview Area */}
                  <div className="relative aspect-square w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex items-center justify-center p-6 mb-5">
                    <img
                      src={cat.front_mockup || '/mockups/front.svg'}
                      alt={cat.name}
                      className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 shadow-xs flex items-center gap-1">
                      <Layers className="w-3 h-3 text-orange-500" /> 6 Placements
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-extrabold text-neutral-900 dark:text-neutral-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {cat.short_description || 'Premium customizable garment ready for DTG/DTF printing.'}
                  </p>

                  {/* Metadata Chips */}
                  <div className="flex items-center gap-3 mt-4 text-[11px] font-semibold text-neutral-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {cat.colors_count || 10} Colors
                    </span>
                    <span>•</span>
                    <span>{cat.sizes_count || 7} Sizes</span>
                    <span>•</span>
                    <span className="text-neutral-700 dark:text-neutral-300 font-bold">
                      From ₹{parseFloat(cat.base_price).toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Start Designing Action */}
                <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    disabled={isStarting}
                    onClick={() => handleStartDesigning(cat.slug)}
                    className="w-full py-3.5 px-4 rounded-xl bg-neutral-900 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Initializing Studio...</span>
                      </>
                    ) : (
                      <>
                        <span>Start Designing</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
