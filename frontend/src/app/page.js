import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-primary px-6">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#1a1a1a]" />

      {/* Decorative accent line */}
      <div className="absolute left-1/2 top-[20%] h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />

      {/* Main content */}
      <div className="relative z-10 text-center">
        {/* Brand wordmark */}
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-accent animate-fade-in">
          Est. 2024
        </p>

        <h1 className="mb-6 text-5xl font-light leading-tight tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl animate-fade-in-up">
          Custom
          <span className="font-semibold">Collection</span>
        </h1>

        <div className="mx-auto mb-10 h-px w-16 bg-accent animate-fade-in animate-delay-200" />

        <p className="mx-auto mb-12 max-w-md text-base font-light leading-relaxed text-white/60 sm:text-lg animate-fade-in-up animate-delay-300">
          Premium fashion, meticulously curated for the modern individual. Arriving soon.
        </p>

        {/* CTA */}
        <div className="animate-fade-in-up animate-delay-500">
          <Link
            href="/collections"
            className="group inline-flex items-center gap-2 border border-white/20 px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-white transition-all duration-300 hover:border-accent hover:bg-accent hover:text-primary"
          >
            Explore
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-[20%] left-1/2 h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent to-transparent opacity-40" />

      {/* Bottom branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center animate-fade-in animate-delay-500">
        <p className="text-[10px] font-light uppercase tracking-[0.3em] text-white/30">
          Premium Fashion &bull; Redefined
        </p>
      </div>
    </main>
  );
}
