import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useSellerAuth } from '../context/SellerAuthContext';
import { useToast } from '../context/ToastContext';
const grabitLogo = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png';

export const SellerLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useSellerAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      showToast({ type: 'success', message: 'Logged in successfully! Welcome to Grabit Seller Panel.' });
      navigate('/seller/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const detail =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Invalid email or password. Please check your credentials.';
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('seller@grabit.com');
    setPassword('password123');
    setError(null);
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
        padding: '24px 16px',
      }}
    >
      {/* Brand Logo Card Header */}
      <Card
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-md)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <img
            src={grabitLogo}
            alt="Grabit"
            style={{ height: 58, width: 'auto', objectFit: 'contain', marginBottom: 12 }}
          />
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-blue)',
              backgroundColor: '#EAF2FC',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Vendor Partner Hub
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-graphite)', letterSpacing: '-0.3px' }}>
            Seller Sign In
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', marginTop: 4 }}>
            Manage your store catalog, 10-min fast deliveries, and inventory.
          </p>
        </div>

        {error && (
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
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Business Email"
            type="email"
            placeholder="vendor@store.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            style={{ width: '100%', marginTop: 8 }}
          >
            Sign In to Seller Panel
          </Button>
        </form>

        {/* Demo Fast Login Helper */}
        <div
          style={{
            marginTop: 20,
            padding: '12px',
            backgroundColor: '#F5F5F7',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--color-soft-gray)', marginBottom: 6 }}>
            Need a test account?
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            onClick={handleDemoFill}
            style={{ width: '100%', fontSize: '12px' }}
          >
            Auto-Fill Demo Vendor (seller@grabit.com)
          </Button>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '13px', color: 'var(--color-soft-gray)' }}>
          New to Grabit?{' '}
          <Link to="/seller/signup" style={{ fontWeight: 600, color: 'var(--color-blue)' }}>
            Register your store
          </Link>
        </div>
      </Card>
    </div>
  );
};
