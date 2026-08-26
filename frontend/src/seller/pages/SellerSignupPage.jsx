import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Mail, Lock, Phone, MapPin, FileText, AlertCircle } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useSellerAuth } from '../context/SellerAuthContext';
import { useToast } from '../context/ToastContext';
const grabitLogo = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png';

export const SellerSignupPage = () => {
  const [formData, setFormData] = useState({
    store_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    business_address: '',
    gstin: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useSellerAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.store_name.trim()) errs.store_name = 'Store name is required.';
    if (!formData.email.trim()) errs.email = 'Valid business email is required.';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
    if (!formData.password) errs.password = 'Password is required.';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirm_password) {
      errs.confirm_password = 'Passwords do not match.';
    }
    if (!formData.business_address.trim()) errs.business_address = 'Store address is required for delivery logistics.';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      await register(formData);
      showToast({ type: 'success', message: 'Seller account registered! Welcome aboard.' });
      navigate('/seller/dashboard');
    } catch (err) {
      console.error('Registration failed:', err);
      const respData = err.response?.data;
      if (respData && typeof respData === 'object') {
        const fieldErrors = {};
        for (const [k, v] of Object.entries(respData)) {
          fieldErrors[k] = Array.isArray(v) ? v.join(' ') : String(v);
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ general: 'Failed to create seller account. Please check your details.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-warm-white)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      {/* Onboarding Card */}
      <Card
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-md)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 26 }}>
          <img
            src={grabitLogo}
            alt="Grabit"
            style={{ height: 58, width: 'auto', objectFit: 'contain', marginBottom: 10 }}
          />
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-green)',
              backgroundColor: '#E8F9EE',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            New Vendor Registration
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-graphite)', letterSpacing: '-0.3px' }}>
            Register as a Grabit Seller
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', marginTop: 4 }}>
            Start delivering groceries and daily essentials in 10 minutes to customers.
          </p>
        </div>

        {errors.general && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-red-light)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-red)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={16} />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Store / Business Name"
            required
            placeholder="e.g. Fresh Daily Supermarket"
            value={formData.store_name}
            onChange={(e) => handleChange('store_name', e.target.value)}
            icon={Store}
            error={errors.store_name}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Business Email"
              type="email"
              required
              placeholder="vendor@store.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              icon={Mail}
              error={errors.email}
            />

            <Input
              label="Phone Number"
              type="tel"
              required
              placeholder="+91 9876543210"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              icon={Phone}
              error={errors.phone}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              icon={Lock}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.confirm_password}
              onChange={(e) => handleChange('confirm_password', e.target.value)}
              icon={Lock}
              error={errors.confirm_password}
            />
          </div>

          <Textarea
            label="Store / Warehouse Address"
            required
            placeholder="Complete address with landmark for delivery rider pickups..."
            value={formData.business_address}
            onChange={(e) => handleChange('business_address', e.target.value)}
            error={errors.business_address}
            rows={2}
          />

          <Input
            label="GSTIN (Optional)"
            placeholder="e.g. 29ABCDE1234F1Z5"
            value={formData.gstin}
            onChange={(e) => handleChange('gstin', e.target.value)}
            icon={FileText}
            error={errors.gstin}
          />

          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            style={{ width: '100%', marginTop: 8 }}
          >
            Create Seller Account
          </Button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '13px', color: 'var(--color-soft-gray)' }}>
          Already have a seller account?{' '}
          <Link to="/seller/login" style={{ fontWeight: 600, color: 'var(--color-blue)' }}>
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};
