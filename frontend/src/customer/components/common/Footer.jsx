import { Link } from 'react-router-dom';
import useWindowWidth from '../../hooks/useWindowWidth';

export default function Footer() {
  const w = useWindowWidth();
  const isMobile = w <= 768;
  const isTablet = w <= 1024;

  // Footer is hidden on mobile view as requested
  if (isMobile) return null;

  return (
    <footer className="main-footer" style={{
      background: '#FFFFFF',
      borderTop: '1px solid #E2E8F0',
      paddingTop: '40px',
      paddingBottom: '24px'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* MOBILE ALIGNED FOOTER */}
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center' }}>
            
            {/* 1. Centered Brand Block */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', marginBottom: '8px' }}>
                <img src="https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png" alt="Grabit" style={{ height: '46px', width: 'auto', maxWidth: '180px', objectFit: 'contain' }} />
              </Link>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 12px', lineHeight: 1.5, maxWidth: '280px' }}>
                Your one-stop shop for everything you need, delivered fast within 5 km radius.
              </p>
              
              {/* Social Icons Centered */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                {[
                  { label: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                  { label: 'Instagram', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 7.5 22v-9A5.5 5.5 0 0 1 7.5 22' },
                  { label: 'Twitter', path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z' },
                ].map(({ label, path }) => (
                  <a key={label} href="#" aria-label={label} className="footer-social-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* 2. Symmetric 2-Column Links Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
              textAlign: 'left'
            }}>
              {/* Categories Card */}
              <div style={{
                background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '14px'
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', marginBottom: '10px' }}>Categories</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { name: 'Snacks & Munchies', slug: 'snacks-munchies' },
                    { name: 'Dairy & Bakery', slug: 'dairy-bakery' },
                    { name: 'Cold Drinks & Juices', slug: 'beverages' },
                    { name: 'Household Essentials', slug: 'household' },
                    { name: 'Personal Care', slug: 'personal-care' }
                  ].map(item => (
                    <li key={item.name}>
                      <Link to={`/category/${item.slug}`} className="footer-nav-link" style={{ fontSize: '12px' }}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Customer Service Card */}
              <div style={{
                background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '14px'
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', marginBottom: '10px' }}>Customer Service</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { name: 'Help & Support', slug: 'help-support' },
                    { name: 'Track Order', slug: 'track-order' },
                    { name: 'Return & Refund', slug: 'return-refund' },
                    { name: 'Shipping Policy', slug: 'shipping-policy' },
                    { name: 'Privacy Policy', slug: 'privacy-policy' }
                  ].map(item => (
                    <li key={item.name}>
                      <Link to={`/help/${item.slug}`} className="footer-nav-link" style={{ fontSize: '12px' }}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3. Bottom Copyright */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', fontSize: '11px', color: '#94A3B8' }}>
              © 2025 Grabit. All rights reserved.
            </div>

          </div>
        ) : (
          /* DESKTOP FOOTER */
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isTablet ? '1.4fr 1fr 1fr' : '1.4fr 1fr 1.2fr 1.2fr',
              gap: '32px', marginBottom: '32px'
            }}>

              {/* Brand */}
              <div>
                <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                  <img src="https://res.cloudinary.com/hmx3azp6/image/upload/v1787645051/grabit_media/grabit_logo.png" alt="Grabit" style={{ height: '46px', width: 'auto', maxWidth: '180px', objectFit: 'contain' }} />
                </Link>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '10px', lineHeight: 1.6, maxWidth: '280px' }}>
                  Your one-stop shop for everything you need, delivered fast within 5 km radius.
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  {[
                    { label: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                    { label: 'Instagram', path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 7.5 22v-9A5.5 5.5 0 0 1 7.5 22' },
                    { label: 'Twitter', path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z' },
                  ].map(({ label, path }) => (
                    <a key={label} href="#" aria-label={label} className="footer-social-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>Categories</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { name: 'Snacks & Munchies', slug: 'snacks-munchies' },
                    { name: 'Dairy & Bakery', slug: 'dairy-bakery' },
                    { name: 'Cold Drinks & Juices', slug: 'beverages' },
                    { name: 'Household Essentials', slug: 'household' },
                    { name: 'Personal Care', slug: 'personal-care' }
                  ].map(item => (
                    <li key={item.name}>
                      <Link to={`/category/${item.slug}`} className="footer-nav-link">{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Customer Service */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>Customer Service</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { name: 'Help & Support', slug: 'help-support' },
                    { name: 'Track Order', slug: 'track-order' },
                    { name: 'Return & Refund', slug: 'return-refund' },
                    { name: 'Shipping Policy', slug: 'shipping-policy' },
                    { name: 'Privacy Policy', slug: 'privacy-policy' }
                  ].map(item => (
                    <li key={item.name}>
                      <Link to={`/help/${item.slug}`} className="footer-nav-link">{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Download App */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1D1D1F', marginBottom: '8px' }}>
                  Download App
                </h4>
                <p style={{ fontSize: '11.5px', color: '#86868B', marginBottom: '14px', lineHeight: 1.4 }}>
                  Get the Grabit app for a better experience!
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Google Play Button */}
                  <a
                    href="https://play.google.com/store"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '10px',
                      background: '#1D1D1F', color: '#FFFFFF', textDecoration: 'none',
                      padding: '8px 14px', borderRadius: '10px', width: '175px',
                      border: '1px solid #333336', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      transition: 'transform 0.15s ease, background 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.background = '#000000'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#1D1D1F'; }}
                  >
                    <svg width="22" height="22" viewBox="0 0 512 512" fill="none">
                      <path d="M32.5 14.7L254.4 236.6 32.5 458.5c-4.4-4.8-7-11.2-7-18.4V33.1c0-7.2 2.6-13.6 7-18.4z" fill="#00E676"/>
                      <path d="M375.4 163.6L254.4 236.6 32.5 14.7C37.5 11.8 43.6 10 50.3 10c6.7 0 13.5 1.8 19.3 5.2l305.8 148.4z" fill="#00B0FF"/>
                      <path d="M375.4 309.6L69.6 458.1c-5.8 3.4-12.6 5.2-19.3 5.2-6.7 0-12.8-1.8-17.8-4.7l221.9-221.9 121 72.9z" fill="#FF3D00"/>
                      <path d="M472.9 220.8l-97.5-47.2-56.1 63 56.1 63 97.5-47.2c16.3-9.5 24.3-21.7 24.3-30.8 0-9.1-8-21.3-24.3-30.8z" fill="#FFC107"/>
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: '#A1A1A6', textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1 }}>GET IT ON</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, marginTop: '2px' }}>Google Play</span>
                    </div>
                  </a>

                  {/* App Store Button */}
                  <a
                    href="https://apps.apple.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '10px',
                      background: '#1D1D1F', color: '#FFFFFF', textDecoration: 'none',
                      padding: '8px 14px', borderRadius: '10px', width: '175px',
                      border: '1px solid #333336', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      transition: 'transform 0.15s ease, background 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.background = '#000000'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = '#1D1D1F'; }}
                  >
                    <svg width="22" height="22" viewBox="0 0 170 170" fill="currentColor">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.1-3.67-3.04-7.69-7.85-12.06-14.44-7.42-11.19-13.16-23.47-17.22-36.83-4.06-13.36-6.09-25.97-6.09-37.83 0-15.64 3.73-28.48 11.19-38.53 7.46-10.05 16.89-15.17 28.29-15.37 4.54 0 9.77 1.2 15.69 3.6 5.92 2.4 9.94 3.67 12.06 3.82 2.37.15 6.47-1.12 12.31-3.82 5.84-2.7 10.74-3.95 14.7-3.75 10.42.54 18.99 4.35 25.7 11.43-9.26 5.63-13.75 13.48-13.48 23.55.27 7.7 3.09 14.28 8.46 19.74 5.37 5.46 12 8.78 19.89 9.96-2.58 7.63-5.83 14.75-9.75 21.36zM119.22 31.78c0-7.3 2.65-14.21 7.95-20.73 5.3-6.52 11.83-10.45 19.59-11.79.27.94.4 1.83.4 2.67 0 7.35-2.73 14.36-8.19 21.03-5.46 6.67-12.04 10.59-19.75 11.77-.07-.79-.1-1.78-.1-2.95z"/>
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: '#A1A1A6', textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1 }}>Download on the</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, marginTop: '2px' }}>App Store</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>© 2025 Grabit. All rights reserved.</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { name: 'Terms', slug: 'terms' },
                  { name: 'Privacy', slug: 'privacy-policy' },
                  { name: 'Cookies', slug: 'cookies' }
                ].map(t => (
                  <Link key={t.name} to={`/help/${t.slug}`} className="footer-nav-link" style={{ fontSize: '11px' }}>{t.name}</Link>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </footer>
  );
}
