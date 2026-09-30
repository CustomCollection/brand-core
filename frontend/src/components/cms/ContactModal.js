'use client';

import { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

export default function ContactModal({ isOpen, onClose }) {
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

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSuccess(false);
      setError('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
      <div
        className='relative w-full max-w-lg bg-surface border border-border shadow-2xl overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-border p-6 bg-surface-hover/30'>
          <div className='flex items-center gap-2.5'>
            <div className='p-2 bg-accent/10 text-accent rounded-sm'>
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className='text-base font-medium uppercase tracking-wider text-text-primary'>
                Contact Us
              </h3>
              <p className='text-xs text-text-muted mt-0.5'>
                Have questions or need assistance? Send us a message.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors'
            aria-label='Close modal'
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className='p-6'>
          {success ? (
            <div className='py-12 text-center space-y-3'>
              <CheckCircle2 size={44} className='mx-auto text-emerald-500 animate-scale-up' />
              <h4 className='text-lg font-light uppercase tracking-wider text-text-primary'>
                Message Sent Successfully
              </h4>
              <p className='text-sm text-text-muted max-w-sm mx-auto'>
                Thank you for reaching out! Our team will review your inquiry and get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              {error && (
                <div className='p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm'>
                  {error}
                </div>
              )}

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
                    className='w-full px-3.5 py-2.5 bg-background border border-border text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors'
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
                    className='w-full px-3.5 py-2.5 bg-background border border-border text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5'>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder='+91 98765 43210'
                    className='w-full px-3.5 py-2.5 bg-background border border-border text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors'
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
                    placeholder='Order inquiry, bulk order, etc.'
                    className='w-full px-3.5 py-2.5 bg-background border border-border text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5'>
                  Message <span className='text-accent'>*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder='How can we help you today?'
                  className='w-full px-3.5 py-2.5 bg-background border border-border text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent transition-colors resize-none'
                />
              </div>

              <div className='pt-2 flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={onClose}
                  className='px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-background text-xs font-semibold uppercase tracking-widest hover:bg-accent-dark transition-colors disabled:opacity-60'
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send size={13} />
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
