'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, CheckCircle2, MessageSquare, ArrowLeft } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await apiPost(ENDPOINTS.CMS.CONTACT, formData);
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setError(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-background pt-24 min-h-screen'>
      <div className='mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-text-muted hover:text-accent transition-colors'
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className='border border-border bg-surface shadow-xl p-8 sm:p-10'>
          <div className='text-center mb-8'>
            <div className='inline-flex p-3 bg-accent/10 text-accent rounded-full mb-3'>
              <MessageSquare size={24} />
            </div>
            <h1 className='text-3xl font-light uppercase tracking-widest text-text-primary'>
              Contact Us
            </h1>
            <div className='mx-auto mt-4 h-px w-12 bg-accent' />
            <p className='mt-4 text-xs font-medium text-text-muted uppercase tracking-wider'>
              Send us a message and our team will get back to you within 24 hours.
            </p>
          </div>

          {success ? (
            <div className='py-12 text-center space-y-4 animate-scale-up'>
              <CheckCircle2 size={52} className='mx-auto text-emerald-500' />
              <h2 className='text-xl font-light uppercase tracking-wider text-text-primary'>
                Thank You For Reaching Out!
              </h2>
              <p className='text-sm text-text-muted max-w-md mx-auto leading-relaxed'>
                Your message has been safely recorded. A support specialist will review your inquiry and contact you soon.
              </p>
              <div className='pt-6'>
                <button
                  onClick={() => setSuccess(false)}
                  className='px-6 py-2.5 bg-accent text-background text-xs font-semibold uppercase tracking-widest hover:bg-accent-dark transition-colors'
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-5'>
              {error && (
                <div className='p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm'>
                  {error}
                </div>
              )}

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <div>
                  <label className='block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5'>
                    Your Name <span className='text-accent'>*</span>
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder='e.g. Rahul Sharma'
                    className='w-full px-4 py-3 bg-background border border-border text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5'>
                    Email Address <span className='text-accent'>*</span>
                  </label>
                  <input
                    type='email'
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder='name@example.com'
                    className='w-full px-4 py-3 bg-background border border-border text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <div>
                  <label className='block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5'>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder='+91 98765 43210'
                    className='w-full px-4 py-3 bg-background border border-border text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5'>
                    Subject
                  </label>
                  <input
                    type='text'
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder='Order tracking, bulk order, etc.'
                    className='w-full px-4 py-3 bg-background border border-border text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5'>
                  Message <span className='text-accent'>*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder='Write your message here...'
                  className='w-full px-4 py-3 bg-background border border-border text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors resize-none'
                />
              </div>

              <div className='pt-2'>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent text-background text-xs font-semibold uppercase tracking-widest hover:bg-accent-dark transition-colors disabled:opacity-60 shadow-lg'
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
