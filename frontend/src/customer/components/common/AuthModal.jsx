import { useState } from 'react';
import { Mail, Lock, User, Phone, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [loginTab, setLoginTab] = useState('email'); // 'email' or 'mobile'
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    remember: true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      showToast(`Logged in successfully! Welcome back.`);
    } else {
      showToast(`Account created successfully! Welcome to Grabit.`);
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '860px',
        height: '560px',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#F1F5F9', border: 'none', display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            color: '#64748B'
          }}
        >
          <X size={18} />
        </button>

        {/* ── LEFT SIDE: HIGH-QUALITY GRABIT HERO GRAPHIC (Text is baked in) ── */}
        <div style={{
          flex: '1',
          position: 'relative',
          background: `url('https://res.cloudinary.com/hmx3azp6/image/upload/v1787645053/grabit_media/login_hero.jpg') center center / cover no-repeat`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '28px'
        }}>
          {/* Bottom Glassmorphic Card matching user screenshot */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '16px 20px',
            color: 'white',
            width: '220px',
            border: '1px solid rgba(255,255,255,0.2)',
            zIndex: 2
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>
              Welcome to the community
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '10px' }}>
              {mode === 'login' ? 'Login to explore' : 'sign up to explore'}
            </div>

            {/* Slider Dots */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFFFFF' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDE: FORM AREA (Matching Screenshot 1 & 2) ── */}
        <div style={{
          flex: '1',
          padding: '40px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#FFFFFF'
        }}>
          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '20px' }}>
                Login your account!
              </h2>

              {/* Login Tabs */}
              <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #E2E8F0', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => setLoginTab('email')}
                  style={{
                    background: 'none', border: 'none', paddingBottom: '8px',
                    fontSize: '13px', fontWeight: loginTab === 'email' ? 700 : 500,
                    color: loginTab === 'email' ? '#0F172A' : '#64748B',
                    borderBottom: loginTab === 'email' ? '2px solid #0F172A' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  E-mail
                </button>

                <button
                  type="button"
                  onClick={() => setLoginTab('mobile')}
                  style={{
                    background: 'none', border: 'none', paddingBottom: '8px',
                    fontSize: '13px', fontWeight: loginTab === 'mobile' ? 700 : 500,
                    color: loginTab === 'mobile' ? '#0F172A' : '#64748B',
                    borderBottom: loginTab === 'mobile' ? '2px solid #0F172A' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  Mobile Number
                </button>
              </div>

              {/* Email Input */}
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type={loginTab === 'email' ? 'email' : 'tel'}
                  placeholder={loginTab === 'email' ? 'Email' : 'Mobile Number'}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: '100%', height: '44px', paddingLeft: '40px', paddingRight: '14px',
                    borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none'
                  }}
                />
              </div>

              {/* Password Input */}
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{
                    width: '100%', height: '44px', paddingLeft: '40px', paddingRight: '14px',
                    borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none'
                  }}
                />
              </div>

              {/* Checkbox Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={e => setFormData({ ...formData, remember: e.target.checked })}
                    style={{ accentColor: '#0066FF' }}
                  />
                  <span>Remember Me</span>
                </label>

                <a href="#forgot" onClick={(e) => e.preventDefault()} style={{ color: '#0F172A', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot password?
                </a>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                style={{
                  width: '100%', height: '44px', background: '#0066FF', color: 'white',
                  border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,102,255,0.25)'
                }}
              >
                Continue
              </button>

              {/* Social Login Section */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Sign in With</span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1877F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, cursor: 'pointer' }}>f</div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EA4335', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, cursor: 'pointer' }}>G</div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#000000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, cursor: 'pointer' }}></div>
                </div>
              </div>

              {/* Switch Mode Footer */}
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
                Dont have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  style={{ background: 'none', border: 'none', color: '#0066FF', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Sign up
                </button>
              </div>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                Create your account!
              </h2>
              <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '18px' }}>Enter your Full Details</p>

              {/* Username Input */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  required
                  style={{
                    width: '100%', height: '42px', paddingLeft: '40px', paddingRight: '14px',
                    borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none'
                  }}
                />
              </div>

              {/* Email Input */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{
                    width: '100%', height: '42px', paddingLeft: '40px', paddingRight: '14px',
                    borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none'
                  }}
                />
              </div>

              {/* Phone Input */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                  style={{
                    width: '100%', height: '42px', paddingLeft: '40px', paddingRight: '14px',
                    borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none'
                  }}
                />
              </div>

              {/* Password Input */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{
                    width: '100%', height: '42px', paddingLeft: '40px', paddingRight: '14px',
                    borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none'
                  }}
                />
              </div>

              {/* Checkbox */}
              <div style={{ marginBottom: '16px', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={e => setFormData({ ...formData, remember: e.target.checked })}
                    style={{ accentColor: '#0066FF' }}
                  />
                  <span>Remember Me</span>
                </label>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                style={{
                  width: '100%', height: '44px', background: '#0066FF', color: 'white',
                  border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,102,255,0.25)'
                }}
              >
                Continue
              </button>

              {/* Social Login */}
              <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Sign in With</span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '8px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1877F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, cursor: 'pointer' }}>f</div>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#EA4335', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, cursor: 'pointer' }}>G</div>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#000000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, cursor: 'pointer' }}></div>
                </div>
              </div>

              {/* Switch Mode Footer */}
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
                Dont have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ background: 'none', border: 'none', color: '#0066FF', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Sign up
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
