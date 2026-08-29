import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import useWindowWidth from '../../hooks/useWindowWidth';

export default function DiwaliBannerComponent() {
  const w = useWindowWidth();
  const isMobile = w <= 640;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: isMobile ? '16px' : '22px',
        overflow: 'hidden',
        aspectRatio: isMobile ? '16/9' : '16/6',
        minHeight: isMobile ? '200px' : '280px',
        background: 'linear-gradient(135deg, #FFFDF7 0%, #FFF8E8 45%, #FDF3D6 100%)',
        boxShadow: '0 16px 45px rgba(212,175,55,0.18), 0 2px 8px rgba(0,0,0,0.04)',
        border: '1.5px solid #E6C687',
        cursor: 'pointer',
        fontFamily: "'Georgia', serif",
      }}
      className="diwali-banner-root"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;600;700;900&display=swap');

        /* ─── ROOT HOVER LIFT ──────────────────────────────── */
        .diwali-banner-root {
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .diwali-banner-root:hover {
          transform: translateY(-4px) scale(1.006);
          box-shadow: 0 24px 60px rgba(212,175,55,0.28), 0 0 0 2px #D4AF37 !important;
        }

        /* ─── FLAME ANIMATIONS ─────────────────────────────── */
        @keyframes flameMain {
          0%   { transform: scaleX(1)   scaleY(1)    rotate(-1.5deg); }
          15%  { transform: scaleX(0.9) scaleY(1.08) rotate(2deg);   }
          30%  { transform: scaleX(1.1) scaleY(0.95) rotate(-2.5deg);}
          45%  { transform: scaleX(0.95)scaleY(1.05) rotate(1.5deg); }
          60%  { transform: scaleX(1.05)scaleY(0.97) rotate(-1deg);  }
          75%  { transform: scaleX(0.97)scaleY(1.03) rotate(2deg);   }
          90%  { transform: scaleX(1.02)scaleY(0.98) rotate(-1.5deg);}
          100% { transform: scaleX(1)   scaleY(1)    rotate(-1.5deg);}
        }
        @keyframes flameInner {
          0%,100%{ transform: scaleX(1) scaleY(1); opacity: 0.95; }
          25%    { transform: scaleX(0.85) scaleY(1.1); opacity: 1; }
          50%    { transform: scaleX(1.12) scaleY(0.92); opacity: 0.9; }
          75%    { transform: scaleX(0.92) scaleY(1.06); opacity: 0.95; }
        }
        @keyframes flameGlow {
          0%,100%{ opacity: 0.65; transform: translate(-50%,-50%) scale(1);   }
          50%    { opacity: 0.95; transform: translate(-50%,-50%) scale(1.18); }
        }
        @keyframes flameGlow2 {
          0%,100%{ opacity: 0.7; transform: translate(-50%,-50%) scale(1.05); }
          50%    { opacity: 1.0; transform: translate(-50%,-50%) scale(1.25); }
        }
        @keyframes ember {
          0%   { transform: translateY(0)   translateX(0)   scale(1);   opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:0.6; }
          100% { transform: translateY(-80px) translateX(var(--ex)) scale(0.3); opacity:0; }
        }
        @keyframes bokeh {
          0%,100%{ opacity:0.25; transform: translateY(0) scale(1); }
          50%    { opacity:0.65; transform: translateY(-8px) scale(1.15); }
        }
        @keyframes shimmerText {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ctaPulse {
          0%,100%{ box-shadow: 0 6px 20px rgba(0,113,227,0.35); }
          50%    { box-shadow: 0 8px 28px rgba(0,113,227,0.55); }
        }
        @keyframes dividerGlow {
          0%,100%{ opacity:0.5; }
          50%    { opacity:0.95; }
        }
      `}</style>

      {/* ── SOFT GOLDEN MANDALA BACKGROUND WATERMARK (left) ── */}
      <div style={{
        position: 'absolute',
        left: isMobile ? '-50px' : '-70px',
        bottom: '-50px',
        width: isMobile ? '220px' : '380px',
        height: isMobile ? '220px' : '380px',
        opacity: 0.12,
        pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 200 200" style={{ width:'100%', height:'100%' }}>
          {[0,30,60,90,120,150].map((r,i) => (
            <g key={i} transform={`rotate(${r} 100 100)`}>
              <ellipse cx="100" cy="30" rx="6" ry="20" fill="#B8860B" />
              <circle cx="100" cy="15" r="4" fill="#B8860B" />
            </g>
          ))}
          <circle cx="100" cy="100" r="60" fill="none" stroke="#B8860B" strokeWidth="1.5" strokeDasharray="6 4"/>
          <circle cx="100" cy="100" r="40" fill="none" stroke="#B8860B" strokeWidth="1"/>
          <circle cx="100" cy="100" r="20" fill="none" stroke="#B8860B" strokeWidth="1"/>
        </svg>
      </div>

      {/* ── SOFT GOLDEN MANDALA BACKGROUND WATERMARK (right) ─ */}
      <div style={{
        position: 'absolute',
        right: isMobile ? '-30px' : '-50px',
        top: '-40px',
        width: isMobile ? '180px' : '320px',
        height: isMobile ? '180px' : '320px',
        opacity: 0.14,
        pointerEvents: 'none',
      }}>
        <svg viewBox="0 0 200 200" style={{ width:'100%', height:'100%' }}>
          {[0,22.5,45,67.5,90,112.5,135,157.5].map((r,i) => (
            <g key={i} transform={`rotate(${r} 100 100)`}>
              <ellipse cx="100" cy="25" rx="5" ry="18" fill="#D4AF37" />
              <circle cx="100" cy="12" r="3" fill="#D4AF37" />
            </g>
          ))}
          <circle cx="100" cy="100" r="70" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4 3"/>
          <circle cx="100" cy="100" r="50" fill="none" stroke="#D4AF37" strokeWidth="0.8"/>
          <circle cx="100" cy="100" r="30" fill="none" stroke="#D4AF37" strokeWidth="0.8"/>
        </svg>
      </div>

      {/* ── BOKEH PARTICLES ───────────────────────────── */}
      {[
        {top:'20%', left:'55%', size:6, delay:'0s', dur:'3.2s'},
        {top:'65%', left:'48%', size:8, delay:'0.8s', dur:'2.8s'},
        {top:'28%', left:'72%', size:7, delay:'1.5s', dur:'3.6s'},
        {top:'72%', left:'78%', size:5, delay:'0.4s', dur:'4s'},
        {top:'18%', left:'82%', size:8, delay:'2s', dur:'2.5s'},
        {top:'52%', left:'60%', size:5, delay:'1.1s', dur:'3.1s'},
      ].map((b, i) => (
        <div key={i} style={{
          position:'absolute', top:b.top, left:b.left,
          width:`${b.size}px`, height:`${b.size}px`, borderRadius:'50%',
          background:'radial-gradient(circle, #FFD700, #FF9800)',
          boxShadow:`0 0 ${b.size*2}px #FFA000`,
          animation:`bokeh ${b.dur} ease-in-out ${b.delay} infinite`,
          pointerEvents:'none',
        }} />
      ))}

      {/* ══════════════════════════════════════════════════
          LEFT: TYPOGRAPHY (LIGHT THEME MATCHED)
         ══════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: isMobile ? '62%' : '52%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: isMobile ? '14px 12px 14px 16px' : '28px 24px 28px 40px',
        zIndex: 3,
      }}>

        {/* Grabit Logo (Dark Graphite for Light Theme) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: isMobile ? '4px' : '8px',
        }}>
          <span style={{
            fontSize: isMobile ? '18px' : '26px',
            fontWeight: 900,
            fontFamily: "'Inter', sans-serif",
            color: '#0F172A',
            letterSpacing: '-0.5px',
          }}>Grabit</span>
          <div style={{
            width: isMobile ? '14px' : '18px',
            height: isMobile ? '14px' : '18px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0071E3, #0058B3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: isMobile ? '7px' : '9px', fontWeight: 900, color: '#fff' }}>+</span>
          </div>
        </div>

        {/* Decorative divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: isMobile ? '3px' : '6px',
          animation: 'dividerGlow 2.5s ease-in-out infinite',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #B8860B)' }} />
          <span style={{ fontSize: isMobile ? '9px' : '12px', color: '#B8860B' }}>✦</span>
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #B8860B)' }} />
        </div>

        {/* HAPPY */}
        <div style={{
          fontSize: isMobile ? '9px' : '12px',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 800,
          color: '#B8860B',
          letterSpacing: isMobile ? '4px' : '7px',
          textTransform: 'uppercase',
          marginBottom: isMobile ? '1px' : '2px',
        }}>H A P P Y</div>

        {/* Diwali (Rich Gold/Bronze Gradient) */}
        <div style={{
          fontSize: isMobile ? '34px' : '62px',
          fontFamily: "'Playfair Display', 'Georgia', serif",
          fontWeight: 900,
          lineHeight: 0.95,
          background: 'linear-gradient(135deg, #996515 0%, #D4AF37 40%, #8B5A2B 75%, #B8860B 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmerText 4s linear infinite',
          marginBottom: isMobile ? '4px' : '8px',
          letterSpacing: '-1px',
        }}>Diwali</div>

        {/* Subtitle */}
        {!isMobile && (
          <div style={{
            fontSize: '12px',
            fontFamily: "'Inter', sans-serif",
            color: '#475569',
            lineHeight: 1.5,
            marginBottom: '8px',
            fontWeight: 600,
            maxWidth: '260px',
          }}>
            May this Diwali bring joy, prosperity<br />
            and happiness to you and your loved ones.
          </div>
        )}

        {/* Wishing line */}
        {!isMobile && (
          <div style={{
            fontSize: '11px',
            fontFamily: "'Inter', sans-serif",
            color: '#B8860B',
            fontStyle: 'italic',
            fontWeight: 700,
            marginBottom: '14px',
          }}>
            ✦ Wishing you a bright and beautiful Diwali! ✦
          </div>
        )}

        {/* CTA Button (Grabit Brand Blue for Light Theme) */}
        <Link to="/diwali-banner" style={{ textDecoration:'none', display:'inline-block', width:'fit-content' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0071E3 0%, #0058B3 100%)',
            color: '#FFFFFF',
            padding: isMobile ? '7px 15px' : '10px 24px',
            borderRadius: '50px',
            fontSize: isMobile ? '10px' : '12px',
            fontWeight: 900,
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.3px',
            animation: 'ctaPulse 2.5s ease-in-out infinite',
          }}>
            <Zap size={isMobile ? 11 : 13} fill="currentColor" />
            <span>SHOP DIWALI OFFERS</span>
            <ArrowRight size={isMobile ? 11 : 13} />
          </div>
        </Link>
      </div>

      {/* ══════════════════════════════════════════════════
          RIGHT: PHOTOREALISTIC 3D DIYA + ANIMATED FLAME
         ══════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        right: 0, top: 0, bottom: 0,
        width: isMobile ? '44%' : '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
      }}>

        {/* Diya container */}
        <div style={{
          position: 'relative',
          width: isMobile ? '150px' : '290px',
          height: isMobile ? '180px' : '330px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}>

          {/* ── FLAME GLOW AURA (outermost warm halo) ──── */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '70px' : '135px',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '130px' : '250px',
            height: isMobile ? '130px' : '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,200,40,0.65) 0%, rgba(255,140,0,0.35) 35%, rgba(255,80,0,0.12) 65%, transparent 85%)',
            filter: 'blur(24px)',
            pointerEvents: 'none',
            animation: 'flameGlow 2.2s ease-in-out infinite',
          }} />

          {/* ── FLAME GLOW AURA (inner tight glow) ──────── */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '72px' : '140px',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: isMobile ? '65px' : '130px',
            height: isMobile ? '65px' : '130px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,210,0.95) 0%, rgba(255,210,50,0.7) 40%, transparent 80%)',
            filter: 'blur(10px)',
            pointerEvents: 'none',
            animation: 'flameGlow2 1.8s ease-in-out infinite',
          }} />

          {/* ── RISING EMBERS ─────────────────────────── */}
          {[
            {left:'46%', delay:'0s', ex:'-8px'},
            {left:'52%', delay:'0.65s', ex:'10px'},
            {left:'49%', delay:'1.3s', ex:'-5px'},
            {left:'54%', delay:'1.9s', ex:'6px'},
            {left:'44%', delay:'0.35s', ex:'-12px'},
          ].map((e, i) => (
            <div key={i} style={{
              position:'absolute',
              bottom: isMobile ? '80px' : '155px',
              left: e.left,
              width: i%2===0 ? '3px' : '2px',
              height: i%2===0 ? '3px' : '2px',
              borderRadius:'50%',
              background: i%3===0 ? '#FFD700' : '#FF9800',
              boxShadow:`0 0 ${i%2===0?6:4}px #FF9800`,
              '--ex': e.ex,
              animation: `ember 2.2s ease-out ${e.delay} infinite`,
              zIndex: 5,
              pointerEvents: 'none',
            }} />
          ))}

          {/* ── FLAME BODY ────────────────────────────── */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '80px' : '156px',
            left: '50%',
            transform: 'translateX(-50%)',
            transformOrigin: 'center bottom',
            width: isMobile ? '24px' : '46px',
            height: isMobile ? '50px' : '100px',
            borderRadius: '50% 50% 30% 30% / 65% 65% 35% 35%',
            background: 'linear-gradient(to top, #BF360C 0%, #E64A19 15%, #FF6D00 35%, #FF9800 58%, #FFC107 78%, #FFECB3 95%, #FFFFFF 100%)',
            boxShadow: '0 0 25px #FF6D00, 0 0 50px rgba(255,109,0,0.7)',
            filter: 'drop-shadow(0 0 10px rgba(255,200,0,0.8))',
            animation: 'flameMain 1.9s ease-in-out infinite',
            zIndex: 4,
          }}>
            {/* Inner white-hot core */}
            <div style={{
              position: 'absolute',
              bottom: '6%', left: '50%',
              transform: 'translateX(-50%)',
              width: '52%',
              height: '60%',
              borderRadius: '50% 50% 40% 40% / 75% 75% 25% 25%',
              background: 'linear-gradient(to top, #FFD740 0%, #FFFF8D 50%, #FFFFFF 100%)',
              boxShadow: '0 0 14px #FFFFFF',
              animation: 'flameInner 1.5s ease-in-out infinite',
            }} />
          </div>

          {/* ── PHOTOREALISTIC 3D DIYA (SVG) ──────────── */}
          <svg
            viewBox="0 0 320 200"
            style={{
              width: '100%',
              height: 'auto',
              zIndex: 3,
              filter: 'drop-shadow(0 12px 24px rgba(184,134,11,0.25))',
              flexShrink: 0,
            }}
          >
            <defs>
              <radialGradient id="diya-body-light" cx="45%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FFE082" />
                <stop offset="35%" stopColor="#FF8F00" />
                <stop offset="70%" stopColor="#C62828" />
                <stop offset="100%" stopColor="#4A0000" />
              </radialGradient>
              <linearGradient id="gold-rim-light" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#FFF8DC" />
                <stop offset="25%"  stopColor="#FFD700" />
                <stop offset="50%"  stopColor="#B8860B" />
                <stop offset="75%"  stopColor="#FFD700" />
                <stop offset="100%" stopColor="#996515" />
              </linearGradient>
              <radialGradient id="oil-light" cx="50%" cy="40%" r="60%">
                <stop offset="0%"   stopColor="#FFC107" stopOpacity="0.8"/>
                <stop offset="60%"  stopColor="#5D4037" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#212121" stopOpacity="1"/>
              </radialGradient>
            </defs>

            {/* Ground Shadow */}
            <ellipse cx="160" cy="188" rx="125" ry="10" fill="#B8860B" opacity="0.25"/>

            {/* Main diya body */}
            <path
              d="M 30,95 C 28,62 292,62 290,95 C 290,158 222,182 160,182 C 98,182 30,158 30,95 Z"
              fill="url(#diya-body-light)"
              stroke="url(#gold-rim-light)"
              strokeWidth="3"
            />

            {/* Oil surface */}
            <ellipse cx="160" cy="96" rx="128" ry="22" fill="url(#oil-light)" stroke="url(#gold-rim-light)" strokeWidth="2.5"/>

            {/* Oil shine */}
            <ellipse cx="148" cy="93" rx="65" ry="9" fill="#FFF8DC" opacity="0.3" transform="rotate(-10 148 93)"/>

            {/* Wick */}
            <rect x="154" y="62" width="12" height="36" rx="4" fill="#212121" opacity="0.9"/>

            {/* Decorative gold band */}
            <path d="M 52,118 Q 160,150 268,118" fill="none" stroke="url(#gold-rim-light)" strokeWidth="2.5" strokeDasharray="6 4"/>

            {/* Gem dots */}
            {[75, 105, 135, 160, 185, 215, 245].map((cx, i) => {
              const cy = 118 + Math.sin((cx - 75) / 170 * Math.PI) * 22;
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r={i===3?6:4.5} fill="url(#gold-rim-light)" />
                  <circle cx={cx} cy={cy} r={i===3?3:2} fill="#FFFFFF" opacity="0.9"/>
                </g>
              );
            })}

            {/* Spout */}
            <path d="M 136,75 Q 160,60 184,75 Q 175,85 160,82 Q 145,85 136,75 Z" fill="url(#diya-body-light)" stroke="url(#gold-rim-light)" strokeWidth="1.5"/>
          </svg>
        </div>

        {/* ── HANGING DIYAS (right edge) ──────────── */}
        {!isMobile && (
          <div style={{
            position: 'absolute', right: '10px', top: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly',
            alignItems: 'center', paddingTop: '12px', paddingBottom: '12px',
          }}>
            {[
              {delay:'0s', scale:0.7},
              {delay:'0.6s', scale:0.55},
              {delay:'1.2s', scale:0.7},
            ].map((d, i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', animation:`bokeh 3s ease-in-out ${d.delay} infinite` }}>
                <div style={{ width:'1px', height:'24px', background:'linear-gradient(to bottom, #B8860B, rgba(184,134,11,0.2))' }}/>
                <div style={{ transform:`scale(${d.scale})`, transformOrigin:'top center' }}>
                  <svg viewBox="0 0 40 28" width="40" height="28">
                    <ellipse cx="20" cy="22" rx="18" ry="6" fill="#C84B00" stroke="#FFD700" strokeWidth="1.2"/>
                    <path d="M20 8 C20 8 23 13 23 16 C23 18 21.5 19 20 19 C18.5 19 17 18 17 16 C17 13 20 8 20 8Z" fill="#FF9800" style={{ animation:`flameMain 2s ease-in-out ${d.delay} infinite`, transformOrigin:'20px 19px' }}/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── GOLD BOTTOM BORDER ACCENT ─────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(to right, transparent 0%, #D4AF37 20%, #B8860B 50%, #D4AF37 80%, transparent 100%)',
      }} />
    </div>
  );
}
