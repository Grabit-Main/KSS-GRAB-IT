import React, { useState } from 'react';
import { Store, Mail, Phone, MapPin, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useSellerAuth } from '../context/SellerAuthContext';
import { useToast } from '../context/ToastContext';

export const SellerProfilePage = () => {
  const { seller, updateProfile } = useSellerAuth();
  const { showToast } = useToast();

  const [storeName, setStoreName] = useState(seller?.store_name || '');
  const [phone, setPhone] = useState(seller?.phone || '');
  const [address, setAddress] = useState(seller?.business_address || '');
  const [gstin, setGstin] = useState(seller?.gstin || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        store_name: storeName,
        phone: phone,
        business_address: address,
        gstin: gstin,
      });
      showToast({ type: 'success', message: 'Store profile updated successfully.' });
    } catch (err) {
      console.error('Failed to update profile:', err);
      showToast({ type: 'error', message: 'Failed to update store profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-graphite)', letterSpacing: '-0.4px' }}>
          Store Settings & Profile
        </h2>
        <p style={{ color: 'var(--color-soft-gray)', fontSize: '14px', marginTop: 4 }}>
          Manage your business information and vendor settings visible on Grabit.
        </p>
      </div>

      <Card style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-border-gray)' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-graphite)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 700,
            }}
          >
            {seller?.store_name ? seller.store_name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-graphite)' }}>
              {seller?.store_name || 'My Store'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: '13px', color: 'var(--color-soft-gray)' }}>{seller?.email}</span>
              <Badge variant="active" size="sm">
                <ShieldCheck size={12} style={{ verticalAlign: -1, marginRight: 2 }} /> Verified Vendor
              </Badge>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <Input
            label="Store Name"
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            icon={Store}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Business Email (Non-editable)"
              value={seller?.email || ''}
              disabled
              icon={Mail}
            />
            <Input
              label="Contact Phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={Phone}
            />
          </div>

          <Textarea
            label="Store / Warehouse Pickup Address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
          />

          <Input
            label="GSTIN Number"
            placeholder="e.g. 29ABCDE1234F1Z5"
            value={gstin}
            onChange={(e) => setGstin(e.target.value)}
            icon={FileText}
          />

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="primary" loading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
