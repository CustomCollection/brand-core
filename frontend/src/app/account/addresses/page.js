'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, MapPin } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

const EMPTY_FORM = {
  full_name: '', phone: '', address_line_1: '', address_line_2: '',
  city: '', state: '', pincode: '', is_default: false,
};

export default function AddressesPage() {
  const toast = useToast();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      const data = await apiGet(ENDPOINTS.AUTH.ADDRESSES);
      setAddresses(data?.results || (Array.isArray(data) ? data : []));
    } catch {
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setForm({
      full_name: address.full_name || '',
      phone: address.phone || '',
      address_line_1: address.address_line_1 || '',
      address_line_2: address.address_line_2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      is_default: address.is_default || false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingAddress) {
        await apiPut(ENDPOINTS.AUTH.ADDRESS(editingAddress.id), form);
        toast.success('Address updated.');
      } else {
        await apiPost(ENDPOINTS.AUTH.ADDRESSES, form);
        toast.success('Address added.');
      }
      setModalOpen(false);
      fetchAddresses();
    } catch (err) {
      toast.error(err.message || 'Failed to save address.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await apiDelete(ENDPOINTS.AUTH.ADDRESS(id));
      toast.success('Address deleted.');
      fetchAddresses();
    } catch {
      toast.error('Failed to delete address.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className='space-y-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-light uppercase tracking-widest text-text-primary mb-1'>Addresses</h1>
          <p className='text-sm text-text-muted'>Manage your saved delivery addresses.</p>
        </div>
        <Button onClick={openAddModal} size='sm'>
          <Plus size={14} /> Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {[1, 2].map((i) => (
            <div key={i} className='border border-border p-6 animate-pulse'>
              <div className='h-4 bg-surface w-2/3 mb-3' />
              <div className='h-3 bg-surface w-full mb-2' />
              <div className='h-3 bg-surface w-1/2' />
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className='text-center py-16 border border-dashed border-border'>
          <MapPin size={40} className='text-border mx-auto mb-4' />
          <p className='text-text-muted'>No addresses saved yet.</p>
          <button onClick={openAddModal} className='mt-4 text-xs font-semibold uppercase tracking-widest text-accent hover:underline'>
            Add your first address
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {addresses.map((addr) => (
            <div key={addr.id} className='relative border border-border p-6 hover:border-accent transition-colors'>
              {addr.is_default && (
                <span className='absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider text-accent border border-accent px-2 py-0.5'>
                  Default
                </span>
              )}
              <p className='font-medium text-sm text-text-primary'>{addr.full_name}</p>
              <p className='text-sm text-text-secondary mt-1'>{addr.phone}</p>
              <p className='text-sm text-text-secondary mt-2 leading-relaxed'>
                {addr.address_line_1}
                {addr.address_line_2 && `, ${addr.address_line_2}`}<br />
                {addr.city}, {addr.state} — {addr.pincode}
              </p>
              <div className='flex gap-3 mt-4'>
                <button
                  onClick={() => openEditModal(addr)}
                  className='flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors'
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className='flex items-center gap-1.5 text-xs font-medium text-error hover:text-error/80 transition-colors'
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAddress ? 'Edit Address' : 'Add Address'}
        size='lg'
      >
        <form onSubmit={handleSave} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <Input label='Full Name' name='full_name' required value={form.full_name} onChange={handleChange} />
            <Input label='Phone' name='phone' required value={form.phone} onChange={handleChange} />
          </div>
          <Input label='Address Line 1' name='address_line_1' required value={form.address_line_1} onChange={handleChange} />
          <Input label='Address Line 2 (Optional)' name='address_line_2' value={form.address_line_2} onChange={handleChange} />
          <div className='grid grid-cols-3 gap-4'>
            <Input label='City' name='city' required value={form.city} onChange={handleChange} />
            <Input label='State' name='state' required value={form.state} onChange={handleChange} />
            <Input label='Pincode' name='pincode' required value={form.pincode} onChange={handleChange} />
          </div>
          <label className='flex items-center gap-2 text-sm text-text-primary cursor-pointer'>
            <input type='checkbox' name='is_default' checked={form.is_default} onChange={handleChange} className='accent-accent' />
            Set as default address
          </label>
          <div className='flex gap-3 justify-end pt-2'>
            <Button type='button' variant='ghost' onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type='submit' isLoading={isSaving}>
              {editingAddress ? 'Update' : 'Add'} Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
