import Link from 'next/link';

export const metadata = {
  title: 'About Us',
  description: 'Learn about CustomCollection — our story, mission, and values.',
};

export default function AboutPage() {
  return (
    <div className='bg-background pt-24'>
      <div className='mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-4'>Our Story</p>
          <h1 className='text-4xl font-light uppercase tracking-widest text-text-primary'>About CustomCollection</h1>
          <div className='mx-auto mt-6 h-px w-12 bg-accent' />
        </div>

        <div className='space-y-12 text-text-secondary leading-relaxed'>
          <p className='text-lg font-light text-text-primary'>
            CustomCollection is a premium clothing brand born from the idea that great design should be accessible to everyone — without sacrificing quality.
          </p>
          <p>
            We believe in print-on-demand clothing that is made uniquely for you. Every piece is crafted from heavy-weight 240 GSM cotton and printed with precision using the latest DTG technology.
          </p>
          <p>
            Our designs are minimal, bold, and timeless — made for those who want to express themselves without shouting.
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 border-y border-border'>
            {[
              { stat: '100%', label: 'Premium Cotton' },
              { stat: 'Made-to-Order', label: 'No excess inventory' },
              { stat: 'India-Made', label: 'Proudly crafted locally' },
            ].map((item) => (
              <div key={item.stat} className='text-center'>
                <p className='text-2xl font-light text-accent'>{item.stat}</p>
                <p className='text-sm text-text-muted uppercase tracking-wider mt-1'>{item.label}</p>
              </div>
            ))}
          </div>

          <div className='text-center'>
            <Link
              href='/products'
              className='inline-flex items-center gap-2 bg-primary text-background px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-accent hover:bg-accent transition-colors'
            >
              Shop the Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
