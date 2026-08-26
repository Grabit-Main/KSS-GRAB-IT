import React from 'react';
import { useDelivery } from '../context/DeliveryContext';
import {
  Navigation,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
  Power
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { state, setAgentStatus, toggleMute, openModal } = useDelivery();
  const { agentStatus, isMuted, stats } = state;

  const isOnline = agentStatus !== 'OFFLINE';

  const handleToggleOnline = () => {
    if (agentStatus === 'ON_DELIVERY') {
      alert('Cannot go offline while on an active delivery.');
      return;
    }
    setAgentStatus(isOnline ? 'OFFLINE' : 'AVAILABLE');
  };

  return (
    <header style={{ backgroundColor: 'var(--color-graphite)', color: 'var(--color-pure-white)', borderBottom: '1px solid #2C2C2E', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '17px', fontWeight: '700', letterSpacing: '-0.3px', color: '#FFFFFF' }}>GrabIt Partner</span>
              <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '4px', color: '#FFFFFF' }}>PRO</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-soft-gray)', margin: 0 }}>Driver ID: #AG-4492 • Hub East</p>
          </div>
        </div>

        {/* Live Performance Stats (Navbar Summary) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }} className="nav-stats-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-pure-white)' }}>
            <CheckCircle2 size={15} color="var(--color-green)" />
            <span style={{ fontWeight: '600' }}>{stats.completedToday}</span>
            <span style={{ color: 'var(--color-soft-gray)', fontSize: '12px' }}>Delivered</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-pure-white)' }}>
            <Star size={14} color="#FFD60A" fill="#FFD60A" />
            <span style={{ fontWeight: '600' }}>{stats.rating.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-pure-white)' }}>
            <Clock size={14} color="var(--color-soft-gray)" />
            <span style={{ fontWeight: '600' }}>{stats.onTimePercentage}%</span>
            <span style={{ color: 'var(--color-soft-gray)', fontSize: '12px' }}>On-Time</span>
          </div>
        </div>

        {/* Status Badge & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Agent Status Badge */}
          {agentStatus === 'AVAILABLE' && (
            <div className="badge badge-green" style={{ padding: '6px 12px', fontSize: '13px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-green)', display: 'inline-block' }} />
              Available
            </div>
          )}

          {agentStatus === 'ON_DELIVERY' && (
            <div className="badge badge-blue" style={{ padding: '6px 12px', fontSize: '13px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-blue)', display: 'inline-block' }} />
              On Delivery
            </div>
          )}

          {agentStatus === 'OFFLINE' && (
            <div className="badge badge-gray" style={{ padding: '6px 12px', fontSize: '13px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-soft-gray)', display: 'inline-block' }} />
              Offline
            </div>
          )}

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute audio alerts' : 'Mute audio alerts'}
            style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', transition: 'var(--transition-smooth)' }}
          >
            {isMuted ? <VolumeX size={17} color="var(--color-soft-gray)" /> : <Volume2 size={17} color="#FFFFFF" />}
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={() => openModal('SOS')}
            title="Emergency SOS / Dispatch Support"
            style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255, 59, 48, 0.18)', border: '1px solid rgba(255, 59, 48, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-red)' }}
          >
            <AlertTriangle size={17} />
          </button>

          {/* Shift Toggle */}
          <button
            onClick={handleToggleOnline}
            disabled={agentStatus === 'ON_DELIVERY'}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: isOnline ? 'rgba(255, 255, 255, 0.12)' : 'var(--color-green)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: agentStatus === 'ON_DELIVERY' ? 0.4 : 1,
              cursor: agentStatus === 'ON_DELIVERY' ? 'not-allowed' : 'pointer'
            }}
          >
            <Power size={14} />
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>

      </div>
    </header>
  );
};
