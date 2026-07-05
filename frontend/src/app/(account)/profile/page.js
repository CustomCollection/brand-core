'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth();
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-surface rounded-sm border border-border"></div>;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-8 text-xl font-medium tracking-wide text-primary border-b border-border pb-4">
        Profile Details
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <Input
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled
          helperText="Email address cannot be changed."
        />
        
        <div className="pt-4">
          <Button type="submit" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
