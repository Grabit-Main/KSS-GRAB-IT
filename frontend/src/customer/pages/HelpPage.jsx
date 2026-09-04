import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, HelpCircle, FileText, Phone, MessageSquare, ChevronRight, ChevronDown, CheckCircle2, Search, ArrowLeft } from 'lucide-react';
import useWindowWidth from '../hooks/useWindowWidth';

const POLICY_DATA = {
  'help-support': {
    title: 'Help & 24x7 Customer Support',
    subtitle: 'We are here to assist you anytime. Instant resolution within minutes!',
    icon: HelpCircle,
    color: '#0066FF',
    faqs: [
      { q: 'How fast will my Grabit order be delivered?', a: 'Our hyper-local dark stores deliver all grocery & daily essential orders within 20 to 30 minutes in a 5 km radius.' },
      { q: 'What if an item is missing or damaged in my order?', a: 'You can request an instant 1-tap refund or replacement via the App under My Orders -> Issue Report. Refunds are processed in under 10 minutes.' },
      { q: 'How can I contact Grabit Live Support?', a: 'You can reach our 24x7 support team via Live Chat below or call our helpline toll-free at 1800-419-4722.' }
    ]
  },
  'track-order': {
    title: 'Track Your Live Order',
    subtitle: 'Real-time GPS tracking for express 25-min delivery',
    icon: Truck,
    color: '#FF6B00',
    content: 'Enter your 8-digit Order ID below to track your delivery rider in real time.'
  },
  'return-refund': {
    title: 'Return & 100% Refund Policy',
    subtitle: 'Zero questions asked returns on fresh produce & groceries',
    icon: RotateCcw,
    color: '#10B981',
    faqs: [
      { q: 'Can I return fresh fruits and vegetables?', a: 'Yes! If you are unsatisfied with the freshness or quality of any fresh item, you can return it at the time of delivery or report it within 6 hours for an instant refund.' },
      { q: 'When will I receive my refund?', a: 'Refunds to Grabit Wallet are credited instantly. Bank/UPI refunds are processed within 1 to 2 business hours.' }
    ]
  },
  'shipping-policy': {
    title: 'Express Shipping & Delivery Policy',
    subtitle: 'Superfast 25-30 minute delivery within 5 km radius',
    icon: Truck,
    color: '#8B5CF6',
    details: [
      '⚡ 5 KM Delivery Radius: Dedicated micro-fulfillment dark stores ensure lightning-fast delivery.',
      '📦 Delivery Charges: FREE delivery on orders above ₹199. Nominal flat fee of ₹15 on smaller orders.',
      '🌧️ Weather SLA Guarantee: Waterproof gear ensures safe deliveries during heavy rains.'
    ]
  },
  'privacy-policy': {
    title: 'Privacy & Data Protection Policy',
    subtitle: 'Your personal data and payments are secured with 256-bit encryption',
    icon: ShieldCheck,
    color: '#00838F',
    details: [
      '🔒 Data Encryption: Personal details and payment information are encrypted end-to-end.',
      '🛡️ Zero Spam Promise: We NEVER sell or share your phone number or email.',
      '💳 PCI-DSS Compliant: RBI-certified gateway partners for all transactions.'
    ]
  },
  'terms': {
    title: 'Terms of Service',
    subtitle: 'User agreement and terms of operating on Grabit Quick-Commerce Platform',
    icon: FileText,
    color: '#475569',
    details: [
      '1. Acceptance: By accessing Grabit platform, you agree to comply with service terms.',
      '2. Product Availability: Subject to real-time inventory in your nearest dark store.',
      '3. Pricing: All prices listed include applicable GST taxes.'
    ]
  },
  'cookies': {
    title: 'Cookie Preferences & Policy',
    subtitle: 'How we use cookies to deliver a fast, personalized shopping experience',
    icon: FileText,
    color: '#64748B',
    details: [
      'Session Cookies: Used to save your active cart items and profile preferences.',
      'Location Cookies: Enables precise 5 km dark store routing for sub-30 minute delivery.'
    ]
  }
};

export default function HelpPage() {
  const navigate = useNavigate();
  const { tab = 'help-support' } = useParams();
  const w = useWindowWidth();
  const isMobile = w <= 640;

  const VALID_TABS = Object.keys(POLICY_DATA);
  const isValidTab = VALID_TABS.includes(tab);

  const [activeTab, setActiveTab] = useState(isValidTab ? tab : 'help-support');
  const [orderQuery, setOrderQuery] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(0);

  useEffect(() => {
    if (isValidTab) {
      setActiveTab(tab);
    }
  }, [tab, isValidTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    navigate(`/help/${newTab}`);
  };

  const activePolicy = isValidTab
    ? (POLICY_DATA[activeTab] || POLICY_DATA['help-support'])
    : {
        title: 'Help Topic Not Found',
        subtitle: `No articles or support pages found matching "${tab}".`,
        icon: HelpCircle,
        color: '#DC2626',
      };
  const IconComp = activePolicy.icon;

  const handleTrackSearch = (e) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    setTrackedOrder({
      id: orderQuery.toUpperCase(),
      status: 'Out for Delivery 🛵',
      eta: '12 Mins Away',
      rider: 'Ramesh Kumar (Grabit Rider #402)',
      phone: '+91 98765 43210',
      items: '3 items (Lay\'s, Amul Butter, Milk)'
    });
  };

  return (
    <div style={{
      background: '#F8FAFC', minHeight: '100vh',
      padding: isMobile ? '28px 12px 90px' : '40px 24px 60px'
    }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* 👑 NATIVE APP HERO BANNER */}
        <div style={{
          marginTop: isMobile ? '12px' : '16px',
          background: `linear-gradient(135deg, ${activePolicy.color} 0%, #0F172A 100%)`,
          borderRadius: isMobile ? '16px' : '20px',
          padding: isMobile ? '16px 18px' : '32px 40px',
          color: '#FFFFFF', marginBottom: isMobile ? '14px' : '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{
              width: isMobile ? '34px' : '44px', height: isMobile ? '34px' : '44px',
              borderRadius: '10px', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}>
              <IconComp size={isMobile ? 18 : 24} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.85)' }}>
              Grabit Help &amp; Support Hub
            </span>
          </div>

          <h1 style={{ fontSize: isMobile ? '18px' : '30px', fontWeight: 900, margin: '4px 0 4px', color: '#FFFFFF' }}>
            {activePolicy.title}
          </h1>
          <p style={{ fontSize: isMobile ? '12px' : '15px', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.4 }}>
            {activePolicy.subtitle}
          </p>
        </div>

        {/* 📱 NATIVE APP SUPPORT CATEGORIES GRID FOR MOBILE */}
        {isMobile && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
            marginBottom: '16px'
          }}>
            {[
              { id: 'help-support', label: '24x7 Help', icon: HelpCircle, color: '#0066FF' },
              { id: 'track-order', label: 'Track Order', icon: Truck, color: '#FF6B00' },
              { id: 'return-refund', label: 'Refunds', icon: RotateCcw, color: '#10B981' },
              { id: 'shipping-policy', label: 'Shipping', icon: Truck, color: '#8B5CF6' },
              { id: 'privacy-policy', label: 'Privacy', icon: ShieldCheck, color: '#00838F' },
              { id: 'terms', label: 'Terms', icon: FileText, color: '#475569' },
            ].map(item => {
              const ItemIcon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  style={{
                    background: isActive ? '#FFFFFF' : '#FFFFFF',
                    border: isActive ? `2px solid ${item.color}` : '1px solid #E2E8F0',
                    borderRadius: '12px', padding: '10px 6px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', gap: '6px', cursor: 'pointer',
                    boxShadow: isActive ? `0 4px 14px ${item.color}25` : '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '8px',
                    background: isActive ? `${item.color}15` : '#F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <ItemIcon size={16} color={isActive ? item.color : '#64748B'} />
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: isActive ? 900 : 700,
                    color: isActive ? item.color : '#475569', textAlign: 'center',
                    lineHeight: 1.2
                  }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: isMobile ? '12px' : '24px' }}>
          
          {/* DESKTOP SIDEBAR MENU */}
          {!isMobile && (
            <div style={{
              background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0',
              padding: '12px', height: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '8px 12px' }}>
                Support Menu
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { id: 'help-support', label: 'Help & Support', icon: HelpCircle },
                  { id: 'track-order', label: 'Track Order', icon: Truck },
                  { id: 'return-refund', label: 'Return & Refund', icon: RotateCcw },
                  { id: 'shipping-policy', label: 'Shipping Policy', icon: Truck },
                  { id: 'privacy-policy', label: 'Privacy Policy', icon: ShieldCheck },
                  { id: 'terms', label: 'Terms of Service', icon: FileText },
                  { id: 'cookies', label: 'Cookie Policy', icon: FileText },
                ].map(item => {
                  const ItemIcon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px', borderRadius: '10px', border: 'none',
                        background: isActive ? 'linear-gradient(135deg, #0066FF 0%, #0043A8 100%)' : 'transparent',
                        color: isActive ? '#FFFFFF' : '#475569',
                        fontSize: '13px', fontWeight: isActive ? 800 : 600, cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ItemIcon size={16} color={isActive ? '#FFFFFF' : '#64748B'} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={14} color={isActive ? '#FFFFFF' : '#CBD5E1'} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MAIN CONTENT AREA */}
          <div style={{
            background: '#FFFFFF', borderRadius: isMobile ? '14px' : '16px',
            border: '1px solid #E2E8F0', padding: isMobile ? '14px' : '28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>

            {!isValidTab ? (
              <div style={{ textAlign: 'center', padding: isMobile ? '20px 8px' : '40px 16px' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: '#FEE2E2', color: '#DC2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <HelpCircle size={30} />
                </div>
                <h3 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
                  Help Topic "{tab}" Not Found
                </h3>
                <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '440px', margin: '0 auto 24px', lineHeight: 1.5 }}>
                  The help topic or policy section you requested does not exist. Please browse our official help topics below or get in touch with 24x7 support.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleTabChange('help-support')}
                    style={{
                      background: '#0066FF', color: '#FFFFFF', border: 'none',
                      borderRadius: '12px', padding: '12px 20px', fontSize: '13px',
                      fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,102,255,0.2)'
                    }}
                  >
                    Go to 24x7 Help &amp; Support
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTabChange('track-order')}
                    style={{
                      background: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1',
                      borderRadius: '12px', padding: '12px 20px', fontSize: '13px',
                      fontWeight: 800, cursor: 'pointer'
                    }}
                  >
                    Track Live Order
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* TRACK ORDER SECTION */}
            {activeTab === 'track-order' && (
              <div>
                <h3 style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                  🛵 Live GPS Order Tracking
                </h3>
                <form onSubmit={handleTrackSearch} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Enter Order ID (e.g. GBT-1002)"
                    value={orderQuery}
                    onChange={e => setOrderQuery(e.target.value)}
                    style={{
                      flex: 1, padding: isMobile ? '10px 12px' : '12px 16px',
                      borderRadius: '10px', border: '1.5px solid #CBD5E1',
                      fontSize: '13px', outline: 'none'
                    }}
                  />
                  <button type="submit" style={{
                    background: '#FF6B00', color: '#FFFFFF',
                    padding: isMobile ? '10px 14px' : '12px 24px',
                    borderRadius: '10px', border: 'none', fontWeight: 800,
                    fontSize: '13px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '4px', flexShrink: 0
                  }}>
                    <Search size={14} /> Track
                  </button>
                </form>

                {trackedOrder ? (
                  <div style={{ background: '#FFF7ED', border: '1.5px solid #FFEDD5', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 900, color: '#C2410C', fontSize: '15px' }}>Order {trackedOrder.id}</span>
                      <span style={{ background: '#22C55E', color: '#FFFFFF', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>
                        {trackedOrder.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                      <div><strong>Estimated Arrival:</strong> <span style={{ color: '#0066FF', fontWeight: 800 }}>{trackedOrder.eta}</span></div>
                      <div><strong>Rider Assigned:</strong> {trackedOrder.rider}</div>
                      <div><strong>Rider Phone:</strong> {trackedOrder.phone}</div>
                      <div><strong>Items:</strong> {trackedOrder.items}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '14px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
                    💡 Enter <strong>GBT-1002</strong> to test live tracking simulation!
                  </div>
                )}
              </div>
            )}

            {/* EXPANDABLE ACCORDION FAQS */}
            {activePolicy.faqs && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  Frequently Asked Questions
                </h3>
                {activePolicy.faqs.map((faq, i) => {
                  const isOpen = expandedFaq === i;
                  return (
                    <div
                      key={i}
                      onClick={() => setExpandedFaq(isOpen ? -1 : i)}
                      style={{
                        background: '#F8FAFC', border: '1px solid #E2E8F0',
                        borderRadius: '12px', padding: '14px', cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        fontSize: isMobile ? '13px' : '14px', fontWeight: 800,
                        color: '#0F172A', display: 'flex', alignItems: 'center',
                        justify: 'space-between', gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={16} color="#0066FF" style={{ flexShrink: 0 }} />
                          <span>{faq.q}</span>
                        </div>
                        <ChevronDown
                          size={16} color="#64748B"
                          style={{
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease', flexShrink: 0
                          }}
                        />
                      </div>

                      {isOpen && (
                        <div style={{
                          fontSize: isMobile ? '12px' : '13px', color: '#475569',
                          lineHeight: 1.6, marginTop: '10px', paddingTop: '10px',
                          borderTop: '1px stroke #E2E8F0'
                        }}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* DETAILS BULLET LIST */}
            {activePolicy.details && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activePolicy.details.map((detail, i) => (
                  <div key={i} style={{
                    fontSize: isMobile ? '12px' : '13px', color: '#334155', lineHeight: 1.6,
                    background: '#F8FAFC', borderLeft: `4px solid ${activePolicy.color}`,
                    padding: '10px 14px', borderRadius: '0 10px 10px 0'
                  }}>
                    {detail}
                  </div>
                ))}
              </div>
            )}

            {/* DESKTOP CONTACT SUPPORT */}
            {!isMobile && (
              <div style={{
                marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #E2E8F0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>Need further assistance?</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Our support agents are active 24x7 to help you.</div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <a href="tel:18004194722" style={{
                    background: '#F1F5F9', color: '#0F172A', padding: '8px 14px', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <Phone size={14} color="#0066FF" /> Call Support
                  </a>
                  <button onClick={() => alert("Connecting to Grabit Live Chat Assistant...")} style={{
                    background: '#0066FF', color: '#FFFFFF', padding: '8px 14px', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <MessageSquare size={14} /> Live Chat
                  </button>
                </div>
              </div>
            )}
              </>
            )}
          </div>

        </div>

        {/* 📱 MOBILE FLOATING GLASSMORPHISM BOTTOM ACTION BAR */}
        {isMobile && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(12px)',
            borderTop: '1px solid #E2E8F0', padding: '10px 14px',
            display: 'flex', gap: '10px', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
          }}>
            <a href="tel:18004194722" style={{
              flex: 1, background: '#F1F5F9', color: '#0F172A', padding: '10px',
              borderRadius: '10px', fontSize: '12px', fontWeight: 800, textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
              <Phone size={15} color="#0066FF" /> Call Support
            </a>
            <button onClick={() => alert("Connecting to Grabit 24x7 Live Chat Assistant...")} style={{
              flex: 1.2, background: 'linear-gradient(135deg, #0066FF 0%, #0043A8 100%)',
              color: '#FFFFFF', padding: '10px', borderRadius: '10px',
              fontSize: '12px', fontWeight: 800, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: '0 4px 12px rgba(0,102,255,0.3)'
            }}>
              <MessageSquare size={15} /> Live Chat 24x7
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
