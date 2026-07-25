export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the CustomCollection team.',
};

export default function ContactPage() {
  return (
    <div className='bg-background pt-24'>
      <div className='mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-4'>Get in Touch</p>
          <h1 className='text-4xl font-light uppercase tracking-widest text-text-primary'>Contact Us</h1>
          <div className='mx-auto mt-6 h-px w-12 bg-accent' />
        </div>

        <div className='grid sm:grid-cols-2 gap-8 mb-12'>
          <div className='border border-border p-8'>
            <h2 className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-3'>Email</h2>
            <a
              href='mailto:hello@customcollection.in'
              className='text-sm text-accent hover:underline'
            >
              hello@customcollection.in
            </a>
            <p className='text-xs text-text-muted mt-2'>We reply within 24 hours on business days.</p>
          </div>
          <div className='border border-border p-8'>
            <h2 className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-3'>Orders & Returns</h2>
            <p className='text-sm text-text-secondary'>
              For order-related queries, please reference your order number in the email subject line.
            </p>
          </div>
        </div>

        <div className='bg-surface border border-border p-8 text-center'>
          <p className='text-sm text-text-secondary'>
            We typically respond within 24–48 hours. For urgent queries, please mention "URGENT" in the subject line.
          </p>
        </div>
      </div>
    </div>
  );
}
