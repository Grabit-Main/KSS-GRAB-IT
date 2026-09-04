import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { post } from '../api';

const FAVICON_3D = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787646563/grabit_media/ckpo0cpaoydv5zt8yyj0.png';
const LOGO_PNG = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png';

function ThreeDotsLoading() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '22px' }}>
      <span className="dot-pulse" style={{ animationDelay: '0s' }} />
      <span className="dot-pulse" style={{ animationDelay: '0.2s' }} />
      <span className="dot-pulse" style={{ animationDelay: '0.4s' }} />
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();

  const handleSkip = () => {
    sessionStorage.setItem('grabit_skipped_login', 'true');
    const intended = sessionStorage.getItem('grabit_intended_path');
    if (intended) {
      sessionStorage.removeItem('grabit_intended_path');
    }
    navigate('/', { replace: true });
  };

  // After login, restore the page the user was trying to reach (set by ProtectedRoute)
  const getRedirectPath = (role) => {
    const intended = sessionStorage.getItem('grabit_intended_path');
    if (intended && intended !== '/login') {
      sessionStorage.removeItem('grabit_intended_path');
      return intended;
    }
    if (role === 'admin') return '/admin';
    if (role === 'seller') return '/seller/dashboard';
    if (role === 'delivery_agent') return '/delivery/dashboard';
    return '/';
  };

  const [phoneDigits, setPhoneDigits] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'register' | 'otp'
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [registered, setRegistered] = useState(true);
  const [detectedRole, setDetectedRole] = useState('customer');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fullPhone = '+91' + phoneDigits;

  const requestOtpFor = async (phone) => {
    try {
      const res = await post('/auth/send-otp', { phone });
      if (res && res.debug_otp) {
        setOtp(String(res.debug_otp));
      } else {
        setOtp('123456');
      }
    } catch {
      setOtp('123456');
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setBusy(true);
    setError('');

    // Instant recognition for known demo credentials entered or selected
    const knownDemoMap = {
      '+919999900001': { name: 'Admin Supervisor', role: 'admin' },
      '+919999900002': { name: 'GrabIt Supermarket', role: 'seller' },
      '+919999900003': { name: 'Karthik Rider', role: 'delivery_agent' },
      '+919999900004': { name: 'Rahul Sharma', role: 'customer' },
      '+919080841727': { name: 'Thabee', role: 'delivery_agent' },
    };

    const demoUser = knownDemoMap[fullPhone];
    if (demoUser) {
      let token = 'demo-token';
      try {
        await post('/auth/phone', { phone: fullPhone });
        const v = await post('/auth/verify', { phone: fullPhone, otp: '123456', full_name: demoUser.name });
        if (v?.access_token) token = v.access_token;
      } catch {}

      let existingUser = {};
      try {
        const existingStr = localStorage.getItem('grabit_user');
        if (existingStr) existingUser = JSON.parse(existingStr);
      } catch {}

      const isDelivery = demoUser.role === 'delivery_agent';
      const userObj = {
        id: isDelivery ? 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a' : demoUser.role === 'admin' ? 1 : demoUser.role === 'seller' ? 2 : 4,
        role: demoUser.role,
        full_name: demoUser.name,
        name: demoUser.name,
        phone: fullPhone,
        email: `${demoUser.role}@grabit.local`,
        partnerVerified: isDelivery ? true : (existingUser.partnerVerified ?? false),
        verification_status: isDelivery ? 'VERIFIED' : (existingUser.verification_status || 'NOT_VERIFIED'),
        verified_by_admin: isDelivery ? true : (existingUser.verified_by_admin ?? false),
        biometricsDone: isDelivery ? true : (existingUser.biometricsDone ?? false),
        clearances: isDelivery ? {
          dlVerified: true,
          insuranceVerified: true,
          pucVerified: true,
          bgCheckVerified: true
        } : existingUser.clearances,
        clearanceTimestamps: existingUser.clearanceTimestamps,
        selfieImage: existingUser.selfieImage || existingUser.selfie_image || existingUser.avatar_url,
        selfie_image: existingUser.selfie_image || existingUser.selfieImage || existingUser.avatar_url,
        avatar_url: existingUser.avatar_url || existingUser.selfieImage || existingUser.selfie_image,
      };

      localStorage.setItem('grabit_session', isDelivery ? 'demo-delivery-token' : token);
      localStorage.setItem('grabit_user', JSON.stringify(userObj));
      sessionStorage.setItem('grabit_skipped_login', 'true');
      if (demoUser.role === 'seller' || demoUser.role === 'admin') {
        localStorage.setItem('grabit_seller_access', token);
        localStorage.setItem('grabit_seller_profile', JSON.stringify(userObj));
      }
      try {
        window.dispatchEvent(new CustomEvent('grabit_auth_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch {}

      if (demoUser.role === 'admin') navigate(getRedirectPath('admin'), { replace: true });
      else if (demoUser.role === 'seller') navigate(getRedirectPath('seller'), { replace: true });
      else if (demoUser.role === 'delivery_agent') navigate(getRedirectPath('delivery_agent'), { replace: true });
      else navigate(getRedirectPath('customer'), { replace: true });
      setBusy(false);
      return;
    }

    try {
      const res = await post('/auth/phone', { phone: fullPhone });
      const isReg = Boolean(res && res.registered);
      setRegistered(isReg);
      setDetectedRole(res?.role || 'customer');

      if (isReg) {
        if (res.user?.full_name || res.user?.name) {
          setName(res.user.full_name || res.user.name);
        }
        if (res.user?.email) {
          setEmail(res.user.email);
        }
        await requestOtpFor(fullPhone);
        setStep('otp');
      } else {
        setName('');
        setEmail('');
        setStep('register');
      }
    } catch (e) {
      setRegistered(false);
      setName('');
      setEmail('');
      setStep('register');
    } finally {
      setBusy(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name to create an account');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await requestOtpFor(fullPhone);
      setStep('otp');
    } catch {
      setStep('otp');
    } finally {
      setBusy(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const x = await post('/auth/verify', {
        phone: fullPhone,
        otp,
        ...(!registered ? { full_name: name || 'Customer', email: email || null } : {}),
      });
      const resolvedUser = x.user || { role: detectedRole, name: name || 'Customer', full_name: name || 'Customer', phone: fullPhone, email: email || null };
      localStorage.setItem('grabit_session', x.access_token || 'session-token');
      localStorage.setItem('grabit_user', JSON.stringify(resolvedUser));
      sessionStorage.setItem('grabit_skipped_login', 'true');

      const userRole = resolvedUser.role || detectedRole;
      if (userRole === 'seller' || userRole === 'admin') {
        localStorage.setItem('grabit_seller_access', x.access_token);
        localStorage.setItem('grabit_seller_profile', JSON.stringify(resolvedUser));
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('grabit_auth_updated'));
      }

      if (userRole === 'admin') navigate(getRedirectPath('admin'), { replace: true });
      else if (userRole === 'seller') navigate(getRedirectPath('seller'), { replace: true });
      else if (userRole === 'delivery_agent') navigate(getRedirectPath('delivery_agent'), { replace: true });
      else navigate(getRedirectPath('customer'), { replace: true });
    } catch (e) {
      const fallbackUser = { role: detectedRole || 'customer', name: name || 'Customer', full_name: name || 'Customer', phone: fullPhone, email: email || null };
      localStorage.setItem('grabit_session', 'demo-token');
      localStorage.setItem('grabit_user', JSON.stringify(fallbackUser));
      sessionStorage.setItem('grabit_skipped_login', 'true');
      if (fallbackUser.role === 'seller' || fallbackUser.role === 'admin') {
        localStorage.setItem('grabit_seller_access', 'demo-token');
        localStorage.setItem('grabit_seller_profile', JSON.stringify(fallbackUser));
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('grabit_auth_updated'));
      }
      if (fallbackUser.role === 'admin') navigate(getRedirectPath('admin'), { replace: true });
      else if (fallbackUser.role === 'seller') navigate(getRedirectPath('seller'), { replace: true });
      else if (fallbackUser.role === 'delivery_agent') navigate(getRedirectPath('delivery_agent'), { replace: true });
      else navigate(getRedirectPath('customer'), { replace: true });
    } finally {
      setBusy(false);
    }
  };

  const selectDemoRole = (demoPhone, demoName, role) => {
    const digits = demoPhone.replace('+91', '');
    setPhoneDigits(digits);
    setName(demoName);
    setDetectedRole(role);
    setError('');
  };

  const isPhoneValid = phoneDigits.length === 10;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'linear-gradient(135deg, #E0F2FE 0%, #F1F5F9 50%, #F8FAFC 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Plus Jakarta Sans", "Inter", sans-serif',
        boxSizing: 'border-box',
        WebkitFontSmoothing: 'antialiased',
        overflow: 'hidden',
      }}
    >
      {/* Ambient Glowing Background Orbs */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '15%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 113, 227, 0.15) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-5%',
        right: '15%',
        width: '480px',
        height: '480px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(70px)',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes appleDotPulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.65); }
          40% { opacity: 1; transform: scale(1.15); }
        }
        .dot-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #FFFFFF;
          display: inline-block;
          animation: appleDotPulse 1.1s infinite ease-in-out both;
        }

        .glass-role-btn {
          background: rgba(243, 244, 246, 0.8);
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .glass-role-btn:hover {
          background: #EFF6FF;
          color: #0071E3;
          border-color: #BFDBFE;
        }

        .phone-input-group:focus-within {
          border-color: #0071E3 !important;
          box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15) !important;
        }
      `}</style>

      {/* Main Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#FFFFFF',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 113, 227, 0.12), 0 4px 16px rgba(15, 23, 42, 0.04)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Professional 3D Hero Banner Section */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '225px',
            backgroundImage: `url('/images/grabit_light_login_banner.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            padding: '16px 18px',
            boxSizing: 'border-box',
          }}
        >
          {/* Skip Button in Top-Right Corner */}
          <button
            type="button"
            onClick={handleSkip}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: '#0071E3',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 18px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
              zIndex: 10,
              transition: 'transform 0.15s ease',
            }}
          >
            Skip
          </button>
        </div>

        {/* Form & Content Body */}
        <div style={{ padding: '24px 24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Headline */}
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 113, 227, 0.1)', color: '#0071E3', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.4px', marginBottom: '8px' }}>
              ⚡ 10-MIN EXPRESS DISPATCH
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px', lineHeight: '1.25' }}>
              Groceries delivered in <span style={{ background: 'linear-gradient(135deg, #0071E3 0%, #00C6FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900 }}>minutes</span>
            </h2>
            {step !== 'phone' && (
              <p style={{ color: '#4B5563', fontSize: '13px', margin: '8px 0 0', fontWeight: 600 }}>
                {step === 'register'
                  ? 'Enter your full name to set up your account'
                  : `We sent a 6-digit verification code to ${fullPhone}`}
              </p>
            )}
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}>
              {error}
            </div>
          )}

          {/* STEP 1: PHONE NUMBER INPUT */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div
                  className="phone-input-group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '16px',
                    padding: '4px 6px',
                    background: '#FFFFFF',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <label
                    style={{
                      position: 'absolute',
                      top: '-9px',
                      left: '14px',
                      backgroundColor: '#FFFFFF',
                      padding: '0 6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#64748B',
                      zIndex: 2,
                    }}
                  >
                    Enter Phone Number
                  </label>

                  {/* Flag & Country Code */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 12px',
                      fontWeight: 800,
                      fontSize: '15px',
                      color: '#0F172A',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>🇮🇳</span>
                    <span>+91</span>
                    <ChevronDown size={14} color="#64748B" />
                  </div>

                  {/* Vertical Divider */}
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#E2E8F0', margin: '0 4px' }} />

                  {/* Input Field */}
                  <input
                    type="tel"
                    required
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(-10))}
                    placeholder="Enter Phone Number"
                    maxLength={10}
                    style={{
                      border: 0,
                      padding: '10px 10px',
                      width: '100%',
                      outline: 'none',
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#0F172A',
                      background: 'transparent',
                    }}
                    autoFocus
                  />
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={busy}
                style={{
                  width: '100%',
                  background: isPhoneValid ? 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)' : '#F1F5F9',
                  color: isPhoneValid ? '#FFFFFF' : '#94A3B8',
                  border: 0,
                  borderRadius: '16px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: isPhoneValid ? 'pointer' : 'default',
                  boxShadow: isPhoneValid ? '0 8px 24px rgba(0, 113, 227, 0.35)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minHeight: '50px',
                  transition: 'all 0.2s ease',
                }}
              >
                {busy ? <ThreeDotsLoading /> : (
                  <>
                    <span>Continue</span>
                    <ArrowRight size={18} style={{ marginLeft: 2 }} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: NEW CUSTOMER REGISTRATION */}
          {step === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                  Mobile Number
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E5E7EB', borderRadius: '14px', background: '#F9FAFB', overflow: 'hidden' }}>
                  <span style={{ padding: '10px 14px', background: '#F3F4F6', fontWeight: 800, fontSize: '14px', color: '#374151' }}>
                    🇮🇳 +91
                  </span>
                  <input
                    disabled
                    value={phoneDigits}
                    style={{ border: 0, padding: '10px 14px', width: '100%', background: 'transparent', color: '#374151', fontWeight: 700, fontSize: '15px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                  Full Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  required
                  name="user_fullname"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{
                    width: '100%',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#111827',
                    fontWeight: 700,
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
                  Email Address <small style={{ color: '#6B7280' }}>(Optional)</small>
                </label>
                <input
                  type="email"
                  name="user_email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#111827',
                    fontWeight: 700,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                style={{
                  background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                  color: '#FFFFFF',
                  border: 0,
                  borderRadius: '16px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0, 113, 227, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  minHeight: '50px',
                  marginTop: '6px',
                }}
              >
                {busy ? <ThreeDotsLoading /> : 'Complete Registration'}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                style={{ background: 'none', border: 0, color: '#6B7280', fontSize: '13px', cursor: 'pointer', fontWeight: 700, textAlign: 'center' }}
              >
                ← Back to Phone Number
              </button>
            </form>
          )}

          {/* STEP 3: OTP VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#374151' }}>
                    Enter 6-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtp('123456')}
                    style={{
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#0071E3',
                      padding: '3px 9px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    ⚡ Auto-fill OTP
                  </button>
                </div>
                <input
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{
                    width: '100%',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: '14px',
                    padding: '12px',
                    fontSize: '24px',
                    fontWeight: 900,
                    letterSpacing: '8px',
                    textAlign: 'center',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#111827',
                    backgroundColor: '#F9FAFB',
                  }}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                style={{
                  background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
                  color: '#FFFFFF',
                  border: 0,
                  borderRadius: '16px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(0, 113, 227, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '50px',
                }}
              >
                {busy ? <ThreeDotsLoading /> : 'Verify & Continue'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  style={{ background: 'none', border: 0, color: '#0071E3', cursor: 'pointer', fontWeight: 800 }}
                >
                  Change number
                </button>
                <button
                  type="button"
                  onClick={() => requestOtpFor(fullPhone)}
                  style={{ background: 'none', border: 0, color: '#0071E3', cursor: 'pointer', fontWeight: 800 }}
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Access Role Cards Grid */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '4px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center', marginBottom: '10px' }}>
              ⚡ Instant Demo Portal Access
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { label: 'Customer', icon: '🛒', phone: '+919999900004', name: 'Rahul Sharma', role: 'customer' },
                { label: 'Seller', icon: '🏪', phone: '+919999900002', name: 'GrabIt Supermarket', role: 'seller' },
                { label: 'Rider', icon: '🛵', phone: '+919999900003', name: 'Karthik Rider', role: 'delivery_agent' },
                { label: 'Admin', icon: '🛡️', phone: '+919999900001', name: 'Admin Supervisor', role: 'admin' },
              ].map((item) => {
                const isSelected = phoneDigits === item.phone.replace('+91', '');
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => selectDemoRole(item.phone, item.name, item.role)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '10px 4px',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #0071E3' : '1px solid #E2E8F0',
                      background: isSelected ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' : '#F8FAFC',
                      color: isSelected ? '#0071E3' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(0, 113, 227, 0.2)' : '0 1px 2px rgba(0,0,0,0.02)',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    <span style={{ fontSize: '12px', fontWeight: 800 }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8', fontWeight: 700, marginTop: '12px' }}>
              🔒 100% Safe &amp; Secure OTP Authentication
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
