'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await apiGet(ENDPOINTS.AUTH.ADDRESSES);
      setAddresses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load addresses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiPost(ENDPOINTS.AUTH.ADDRESSES, formData);
      toast.success('Address added successfully.');
      setIsFormOpen(false);
      setFormData({
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
      });
      fetchAddresses();
    } catch (error) {
      toast.error(error.message || 'Failed to add address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 border border-border bg-surface">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
        <h2 className="text-xl font-medium tracking-wide text-primary">Saved Addresses</h2>
        <Button variant={isFormOpen ? "secondary" : "primary"} size="sm" onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? 'Cancel' : 'Add New Address'}
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-surface p-6 mb-8 border border-border animate-fade-in-up">
          <h3 className="text-lg font-medium mb-4">Add New Address</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Street Address"
              name="street_address"
              value={formData.street_address}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
              <Input
                label="State / Province"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Postal Code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                required
              />
              <Input
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={isSubmitting}>
                Save Address
              </Button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-16 text-text-secondary bg-surface border border-border border-dashed">
          <p>No addresses saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {addresses.map((addr, idx) => (
            <div key={idx} className="border border-border p-6 relative group transition-colors hover:border-primary bg-background">
              <div className="text-sm space-y-1 text-text-secondary">
                <p className="font-medium text-primary mb-2">{addr.street_address}</p>
                <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                <p>{addr.country}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
