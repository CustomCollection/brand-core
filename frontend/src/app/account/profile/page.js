'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const toast = useToast();

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [pwData, setPwData] = useState({
    old_password: '',
    new_password: '',
  });
  const [isSavingPw, setIsSavingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setIsSavingPw(true);
    try {
      await changePassword(pwData.old_password, pwData.new_password);
      toast.success('Password changed successfully.');
      setPwData({ old_password: '', new_password: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setIsSavingPw(false);
    }
  };

  return (
    <div className='space-y-12'>
      <div>
        <h1 className='text-2xl font-light uppercase tracking-widest text-text-primary mb-1'>My Profile</h1>
        <p className='text-sm text-text-muted'>Manage your personal information.</p>
      </div>

      {/* Profile form */}
      <section className='border border-border p-6'>
        <h2 className='text-sm font-semibold uppercase tracking-widest text-text-primary mb-6'>Personal Information</h2>
        <form onSubmit={handleProfileSubmit} className='space-y-5 max-w-lg'>
          <div className='grid grid-cols-2 gap-4'>
            <Input
              label='First Name'
              name='first_name'
              value={profileData.first_name}
              onChange={(e) => setProfileData((p) => ({ ...p, first_name: e.target.value }))}
            />
            <Input
              label='Last Name'
              name='last_name'
              value={profileData.last_name}
              onChange={(e) => setProfileData((p) => ({ ...p, last_name: e.target.value }))}
            />
          </div>
          <Input
            label='Email Address'
            type='email'
            value={user?.email || ''}
            disabled
            helperText='Email cannot be changed.'
          />
          <Input
            label='Phone Number'
            name='phone'
            type='tel'
            value={profileData.phone}
            onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
            placeholder='+91 98765 43210'
          />
          <Button type='submit' isLoading={isSavingProfile}>
            Save Changes
          </Button>
        </form>
      </section>

      {/* Change password */}
      <section className='border border-border p-6'>
        <h2 className='text-sm font-semibold uppercase tracking-widest text-text-primary mb-6'>Change Password</h2>
        <form onSubmit={handlePwSubmit} className='space-y-5 max-w-lg'>
          <Input
            label='Current Password'
            type='password'
            name='old_password'
            value={pwData.old_password}
            onChange={(e) => setPwData((p) => ({ ...p, old_password: e.target.value }))}
          />
          <Input
            label='New Password'
            type='password'
            name='new_password'
            value={pwData.new_password}
            onChange={(e) => setPwData((p) => ({ ...p, new_password: e.target.value }))}
            helperText='Minimum 8 characters'
          />
          <Button type='submit' isLoading={isSavingPw}>
            Change Password
          </Button>
        </form>
      </section>
    </div>
  );
}
