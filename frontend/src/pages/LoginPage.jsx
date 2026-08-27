import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, UserCheck } from 'lucide-react';
import { post } from '../api';

const DOODLE_BG = 'https://res.cloudinary.com/hmx3azp6/image/upload/v1787653733/grabit_media/eu9h4icihrmbgxevh0z9.jpg';
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
      '+919999900003': { name: 'Speedy Express Delivery', role: 'delivery_agent' },
      '+919999900004': { name: 'Rahul Sharma', role: 'customer' },
    };

    const demoUser = knownDemoMap[fullPhone];
    if (demoUser) {
      let token = 'demo-token';
      try {
        await post('/auth/phone', { phone: fullPhone });
        const v = await post('/auth/verify', { phone: fullPhone, otp: '123456', full_name: demoUser.name });
        if (v?.access_token) token = v.access_token;
      } catch {}

      const userObj = {
        id: demoUser.role === 'admin' ? 1 : demoUser.role === 'seller' ? 2 : demoUser.role === 'delivery_agent' ? 3 : 4,
        role: demoUser.role,
        full_name: demoUser.name,
        name: demoUser.name,
        phone: fullPhone,
        email: `${demoUser.role}@grabit.local`,
      };

      localStorage.setItem('grabit_session', token);
      localStorage.setItem('grabit_user', JSON.stringify(userObj));
      if (demoUser.role === 'seller' || demoUser.role === 'admin') {
        localStorage.setItem('grabit_seller_access', token);
        localStorage.setItem('grabit_seller_profile', JSON.stringify(userObj));
      }

      if (demoUser.role === 'admin') navigate(getRedirectPath('admin'), { replace: true });
      else if (demoUser.role === 'seller') navigate(getRedirectPath('seller'), { replace: true });
      else if (demoUser.role === 'delivery_agent') navigate(getRedirectPath('delivery_agent'), { replace: true });
      else navigate('/', { replace: true });
      setBusy(false);
      return;
    }

    try {
      const res = await post('/auth/phone', { phone: fullPhone });
      const isReg = Boolean(res && res.registered);
      setRegistered(isReg);
      setDetectedRole(res?.role || 'customer');

      if (isReg) {
        // Existing user in database -> go straight to OTP
        if (res.user?.full_name || res.user?.name) {
          setName(res.user.full_name || res.user.name);
        }
        if (res.user?.email) {
          setEmail(res.user.email);
        }
        await requestOtpFor(fullPhone);
        setStep('otp');
      } else {
        // User not in database -> ask user to create account
        setName('');
        setEmail('');
        setStep('register');
      }
    } catch (e) {
      // If error communicating with API or user not found, prompt to create account
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
      else navigate('/', { replace: true });
    } catch (e) {
      const fallbackUser = { role: detectedRole || 'customer', name: name || 'Customer', full_name: name || 'Customer', phone: fullPhone, email: email || null };
      localStorage.setItem('grabit_session', 'demo-token');
      localStorage.setItem('grabit_user', JSON.stringify(fallbackUser));
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
      else navigate('/', { replace: true });
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

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        backgroundColor: '#EBF3FC',
        backgroundImage: `url(${DOODLE_BG})`,
        backgroundSize: '580px 580px',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Plus Jakarta Sans", "Inter", sans-serif',
        boxSizing: 'border-box',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{`
        @keyframes appleDotPulse {
          0%, 80%, 100% {
            opacity: 0.25;
            transform: scale(0.65);
          }
          40% {
            opacity: 1;
            transform: scale(1.15);
          }
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
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.50);
          border-radius: 12px;
          padding: 8px 16px;
          font-size: 12.5px;
          font-weight: 700;
          color: #0F172A;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glass-role-btn:hover {
          background: rgba(255, 255, 255, 0.55);
          color: #0071E3;
          border-color: rgba(0, 113, 227, 0.5);
          transform: translateY(-1px);
        }
      `}</style>

      {/* Transparent Lightly Blurred Laptop/Desktop Enlarged Login Section */}
      <div
        style={{
          width: '100%',
          maxWidth: '470px',
          background: 'transparent',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '32px',
          padding: '36px 32px',
          border: '1.5px solid rgba(255, 255, 255, 0.48)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.03)',
          color: '#0F172A',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Header Branding (Seamless 3D Favicon + Logo with zero enclosing background) */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <img
              src={FAVICON_3D}
              alt="GrabIt Favicon"
              style={{
                width: '66px',
                height: '66px',
                objectFit: 'contain',
                display: 'block',
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08))',
              }}
            />
            <img
              src={LOGO_PNG}
              alt="GrabIt"
              style={{
                height: '54px',
                width: 'auto',
                maxWidth: '210px',
                objectFit: 'contain',
                marginLeft: '-3px',
                display: 'block',
                filter: 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.06))',
              }}
            />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: -0.5 }}>
            {step === 'phone'
              ? 'Log In'
              : step === 'register'
              ? 'Create New Account'
              : 'Security Verification'}
          </h2>
          {step !== 'phone' && (
            <p style={{ color: '#334155', fontSize: 13, margin: '6px 0 0', fontWeight: 600 }}>
              {step === 'register'
                ? 'Enter your name to complete your profile'
                : `We sent a 6-digit code to ${fullPhone}`}
            </p>
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(255, 230, 230, 0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 100, 100, 0.4)', color: '#D32F2F', padding: '10px 14px', borderRadius: 14, fontSize: 12.5, fontWeight: 700 }}>
            {error}
          </div>
        )}

        {/* STEP 1: PHONE NUMBER */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                Mobile Number
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1.5px solid rgba(255, 255, 255, 0.60)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.20)',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                }}
              >
                <span
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.28)',
                    borderRight: '1.5px solid rgba(255, 255, 255, 0.60)',
                    fontWeight: 800,
                    fontSize: 15,
                    color: '#0F172A',
                    userSelect: 'none',
                  }}
                >
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phoneDigits}
                  onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(-10))}
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                  style={{
                    border: 0,
                    padding: '14px 16px',
                    width: '100%',
                    outline: 'none',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#0F172A',
                    background: 'transparent',
                  }}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.95) 0%, rgba(0, 91, 181, 0.95) 100%)',
                color: '#FFFFFF',
                border: 0,
                borderRadius: 16,
                padding: '15px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 113, 227, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: '52px',
                transition: 'all 0.15s ease',
              }}
            >
              {busy ? (
                <ThreeDotsLoading />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: NEW CUSTOMER REGISTRATION */}
        {step === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                Mobile Number (Verified)
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1.5px solid rgba(255, 255, 255, 0.60)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.20)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                <span style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.28)', fontWeight: 800, fontSize: 14, color: '#0F172A' }}>
                  +91
                </span>
                <input
                  disabled
                  value={phoneDigits}
                  style={{ border: 0, padding: '12px 16px', width: '100%', background: 'transparent', color: '#0F172A', fontWeight: 700, fontSize: 15 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                Full Name <span style={{ color: '#FF3B30' }}>*</span>
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
                  border: '1.5px solid rgba(255, 255, 255, 0.60)',
                  borderRadius: 16,
                  padding: '13px 16px',
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0F172A',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.20)',
                  backdropFilter: 'blur(6px)',
                }}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                Email Address <small style={{ color: '#475569' }}>(Optional)</small>
              </label>
              <input
                type="email"
                name="user_email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  border: '1.5px solid rgba(255, 255, 255, 0.60)',
                  borderRadius: 16,
                  padding: '13px 16px',
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0F172A',
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.20)',
                  backdropFilter: 'blur(6px)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.95) 0%, rgba(0, 91, 181, 0.95) 100%)',
                color: '#FFFFFF',
                border: 0,
                borderRadius: 16,
                padding: '15px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 113, 227, 0.35)',
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: '52px',
              }}
            >
              {busy ? (
                <ThreeDotsLoading />
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              style={{ background: 'none', border: 0, color: '#334155', fontSize: 13, cursor: 'pointer', fontWeight: 700, textAlign: 'center' }}
            >
              ← Back to Phone Number
            </button>
          </form>
        )}

        {/* STEP 3: OTP VERIFICATION */}
        {step === 'otp' && (
          <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                  Enter 6-Digit OTP
                </label>
                <button
                  type="button"
                  onClick={() => setOtp('123456')}
                  style={{
                    background: 'rgba(0, 113, 227, 0.12)',
                    border: '1px solid rgba(0, 113, 227, 0.35)',
                    color: '#0071E3',
                    padding: '3px 9px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
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
                  border: '1.5px solid rgba(255, 255, 255, 0.60)',
                  borderRadius: 16,
                  padding: '14px',
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: 8,
                  textAlign: 'center',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0F172A',
                  background: 'rgba(255, 255, 255, 0.24)',
                  backdropFilter: 'blur(6px)',
                }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.95) 0%, rgba(0, 91, 181, 0.95) 100%)',
                color: '#FFFFFF',
                border: 0,
                borderRadius: 16,
                padding: '15px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 113, 227, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '52px',
              }}
            >
              {busy ? <ThreeDotsLoading /> : 'Verify & Enter Portal'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
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

        {/* Transparent Role Selection Pills */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.38)', paddingTop: 14, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: 'Customer', phone: '+919999900004', name: 'Rahul Sharma', role: 'customer' },
            { label: 'Seller', phone: '+919999900002', name: 'GrabIt Supermarket', role: 'seller' },
            { label: 'Rider', phone: '+919999900003', name: 'Speedy Express Delivery', role: 'delivery_agent' },
            { label: 'Admin', phone: '+919999900001', name: 'Admin Supervisor', role: 'admin' },
          ].map((item) => {
            const isSelected = phoneDigits === item.phone.replace('+91', '');
            return (
              <button
                key={item.label}
                type="button"
                className="glass-role-btn"
                onClick={() => selectDemoRole(item.phone, item.name, item.role)}
                style={isSelected ? {
                  background: 'linear-gradient(135deg, #0071E3 0%, #005bb5 100%)',
                  color: '#FFFFFF',
                  borderColor: '#0071E3',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(0, 113, 227, 0.35)'
                } : {}}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
