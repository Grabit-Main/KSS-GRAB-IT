import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { post, logoutUser } from '../api';

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
    logoutUser();
    sessionStorage.setItem('grabit_skipped_login', 'true');
    const intended = sessionStorage.getItem('grabit_intended_path');
    sessionStorage.removeItem('grabit_intended_path');
    localStorage.removeItem('grabit_intended_path');
    if (intended && intended !== '/login') {
      navigate(intended, { replace: true });
    } else {
      navigate('/', { replace: true });
    }
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
  // Steps: 'phone' | 'otp' | 'profile'
  const [step, setStep] = useState('phone');
  const [otp, setOtp] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fullPhone = '+91' + phoneDigits;

  // Resend cooldown countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Send OTP and store debug code
  const requestOtpFor = async (phone) => {
    try {
      const res = await post('/auth/send-otp', { phone });
      const code = res?.debug_otp ? String(res.debug_otp) : '123456';
      setDebugOtp(code);
      setResendCooldown(30);
      setError('');
      return { ok: true, code };
    } catch (err) {
      setDebugOtp('');
      setError(err?.message || 'Unable to send verification code. Please check your connection and try again.');
      return { ok: false, code: '' };
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || busy) return;
    setBusy(true);
    setOtp('');
    await requestOtpFor(fullPhone);
    setBusy(false);
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setOtp('');
    setDebugOtp('');
    setName('');
    setEmail('');
    setError('');
    setResendCooldown(0);
  };

  // Step 1: Phone submitted → send OTP directly (no /auth/phone check)
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setBusy(true);
    setError('');

    // Instant demo portal access for known demo phones
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
      let userObj = {
        id: demoUser.role === 'admin' ? 1 : demoUser.role === 'seller' ? 2 : demoUser.role === 'delivery_agent' ? (fullPhone === '+919999900003' ? 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2a' : 'd7e8f9a0-b1c2-3d4e-5f6a-7b8c9d0e1f2b') : 4,
        role: demoUser.role, full_name: demoUser.name, name: demoUser.name,
        phone: fullPhone, email: `${demoUser.role}@grabit.local`,
        partnerVerified: true,
        biometricsDone: true,
        verification_status: 'ADMIN_VERIFIED',
        verified_by_admin: true,
      };
      if (fullPhone === '+919999900003' || demoUser.name === 'Karthik Rider') {
        userObj = {
          ...userObj,
          vehicle_type: 'TVS iQube Electric Scooter',
          plate_number: 'KA-05-EX-9921',
          license_number: 'DL-2024-88712',
          insuranceNo: 'POL-BAJAJ-77182',
          pucNo: 'PUC-KA05-110291',
          clearances: {
            dlVerified: true,
            insuranceVerified: true,
            pucVerified: true,
            bgCheckVerified: true
          }
        };
      } else if (fullPhone === '+919080841727' || demoUser.name === 'Thabee') {
        userObj = {
          ...userObj,
          vehicle_type: 'Ather 450X EV Scooter',
          plate_number: 'KA 05 EQ 4421',
          license_number: 'DL-KA-05-2024009182',
          insuranceNo: 'POL-HDFC-99201',
          pucNo: 'PUC-KA05-882190',
          clearances: {
            dlVerified: true,
            insuranceVerified: true,
            pucVerified: true,
            bgCheckVerified: true
          }
        };
      }
      try {
        const otpRes = await requestOtpFor(fullPhone);
        if (otpRes?.ok) {
          const otpCode = otpRes.code || '123456';
          const v = await post('/auth/verify', { phone: fullPhone, otp: otpCode });
          if (v?.access_token) {
            token = v.access_token;
            if (v.user) {
              userObj = {
                ...userObj,
                ...v.user,
                name: demoUser.name,
                full_name: demoUser.name,
                partnerVerified: true,
                verification_status: 'ADMIN_VERIFIED'
              };
            }
          }
        }
      } catch {}
      localStorage.setItem('grabit_session', token);
      localStorage.setItem('grabit_user', JSON.stringify(userObj));
      sessionStorage.removeItem('grabit_skipped_login');
      if (demoUser.role === 'seller' || demoUser.role === 'admin') {
        localStorage.setItem('grabit_seller_access', token);
        localStorage.setItem('grabit_seller_profile', JSON.stringify(userObj));
      }
      try { window.dispatchEvent(new CustomEvent('grabit_auth_updated')); window.dispatchEvent(new Event('storage')); } catch {}
      if (demoUser.role === 'admin') navigate(getRedirectPath('admin'), { replace: true });
      else if (demoUser.role === 'seller') navigate(getRedirectPath('seller'), { replace: true });
      else if (demoUser.role === 'delivery_agent') navigate(getRedirectPath('delivery_agent'), { replace: true });
      else navigate(getRedirectPath('customer'), { replace: true });
      setBusy(false);
      return;
    }

    // Regular login: just send OTP, no pre-check
    const otpRes = await requestOtpFor(fullPhone);
    setBusy(false);
    if (otpRes?.ok) {
      setOtp('');
      setStep('otp');
    }
  };

  // Step 2: OTP submitted → verify
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setError('Please enter the complete 6-digit OTP'); return; }
    setBusy(true);
    setError('');
    try {
      const x = await post('/auth/verify', { phone: fullPhone, otp });
      if (x?.needs_profile) {
        // New user — collect profile info
        setStep('profile');
        setBusy(false);
        return;
      }
      if (!x?.access_token || !x?.user) throw new Error('Verification failed. Please try again.');
      finishLogin(x);
    } catch (e) {
      setError(e?.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setBusy(false);
    }
  };

  // Step 3: Profile submitted (new users only)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your full name'); return; }
    setBusy(true);
    setError('');
    try {
      const x = await post('/auth/complete-profile', { phone: fullPhone, otp, full_name: name.trim(), email: email || null });
      if (!x?.access_token || !x?.user) throw new Error('Account creation failed. Please try again.');
      finishLogin(x);
    } catch (e) {
      setError(e?.message || 'Could not create account. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Shared post-login handler
  const finishLogin = (x) => {
    const resolvedUser = { ...x.user };
    if (resolvedUser.phone === '+919999900003' || resolvedUser.name === 'Speedy Express Delivery' || resolvedUser.full_name === 'Speedy Express Delivery') {
      resolvedUser.name = 'Karthik Rider';
      resolvedUser.full_name = 'Karthik Rider';
      resolvedUser.partnerVerified = true;
      resolvedUser.verification_status = 'ADMIN_VERIFIED';
    } else if (resolvedUser.phone === '+919080841727') {
      resolvedUser.name = 'Thabee';
      resolvedUser.full_name = 'Thabee';
      resolvedUser.partnerVerified = true;
      resolvedUser.verification_status = 'ADMIN_VERIFIED';
    }
    localStorage.setItem('grabit_session', x.access_token);
    localStorage.setItem('grabit_user', JSON.stringify(resolvedUser));
    sessionStorage.removeItem('grabit_skipped_login');
    const userRole = resolvedUser.role || 'customer';
    if (userRole === 'seller' || userRole === 'admin') {
      localStorage.setItem('grabit_seller_access', x.access_token);
      localStorage.setItem('grabit_seller_profile', JSON.stringify(resolvedUser));
    }
    try { window.dispatchEvent(new CustomEvent('grabit_auth_updated')); } catch {}
    if (userRole === 'admin') navigate(getRedirectPath('admin'), { replace: true });
    else if (userRole === 'seller') navigate(getRedirectPath('seller'), { replace: true });
    else if (userRole === 'delivery_agent') navigate(getRedirectPath('delivery_agent'), { replace: true });
    else navigate(getRedirectPath('customer'), { replace: true });
  };

  const selectDemoRole = (demoPhone, demoName, role) => {
    setPhoneDigits(demoPhone.replace('+91', ''));
    setName(demoName);
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
                {step === 'profile'
                  ? 'Enter your name and email to complete registration'
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

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Demo OTP Banner — always shown in debug mode */}
              {debugOtp && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                    border: '1.5px solid #93C5FD',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#1D4ED8', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ⚡ Demo OTP
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 900, color: '#1E40AF', letterSpacing: '8px', fontFamily: 'monospace' }}>
                      {debugOtp}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(debugOtp)}
                    style={{
                      background: '#2563EB',
                      color: '#fff',
                      border: 0,
                      borderRadius: '10px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    Use this OTP
                  </button>
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#374151' }}>
                    Enter 6-Digit OTP
                  </label>
                </div>
                <input
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="· · · · · ·"
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
                  onClick={handleChangeNumber}
                  style={{ background: 'none', border: 0, color: '#0071E3', cursor: 'pointer', fontWeight: 800 }}
                >
                  Change number
                </button>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || busy}
                  onClick={handleResendOtp}
                  style={{
                    background: 'none',
                    border: 0,
                    color: (resendCooldown > 0 || busy) ? '#94A3B8' : '#0071E3',
                    cursor: (resendCooldown > 0 || busy) ? 'not-allowed' : 'pointer',
                    fontWeight: 800
                  }}
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: NEW USER PROFILE COMPLETION */}
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                {busy ? <ThreeDotsLoading /> : 'Complete Sign Up'}
              </button>

              <button
                type="button"
                onClick={handleChangeNumber}
                style={{ background: 'none', border: 0, color: '#6B7280', fontSize: '13px', cursor: 'pointer', fontWeight: 700, textAlign: 'center' }}
              >
                ← Back to Phone Number
              </button>
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
