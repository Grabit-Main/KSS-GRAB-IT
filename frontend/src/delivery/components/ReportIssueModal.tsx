import React, { useState } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { IssueReport } from '../types/delivery';
import { AlertCircle, RotateCcw, XCircle, Camera, Trash2, X } from 'lucide-react';

export const ReportIssueModal: React.FC = () => {
  const { state, closeModal, reportIssue } = useDelivery();
  const { currentOrder } = state;

  const [reason, setReason] = useState<IssueReport['reason']>('Customer unavailable');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const reasonsList: IssueReport['reason'][] = [
    'Customer unavailable',
    'Wrong address',
    'Customer refused',
    'Package damaged',
    'Unable to contact customer',
    'Vehicle issue',
    'Other'
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = (actionTaken: 'FAILED_DELIVERY' | 'RETURNED') => {
    const report: IssueReport = {
      reason,
      notes: notes.trim() || undefined,
      photoUrl: photoUrl || undefined,
      actionTaken,
      reportedAt: new Date().toLocaleTimeString()
    };

    reportIssue(report);
  };

  return (
    <div className="modal-overlay" style={{ padding: '16px' }}>
      <div
        className="modal-content glass-strong"
        style={{
          maxWidth: '520px',
          borderRadius: '24px',
          border: '1px solid var(--glass-border-strong)',
          boxShadow: 'var(--shadow-glass-modal)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'rgba(29, 29, 31, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#FFFFFF',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 59, 48, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertCircle size={22} color="var(--color-red)" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0, color: '#FFFFFF' }}>
                Report Delivery Issue
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-soft-gray)', margin: 0 }}>
                Order {currentOrder?.orderNumber} • Incident Logging
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Reason Selector */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-graphite)', display: 'block', marginBottom: '6px' }}>
              Select Issue Reason <span style={{ color: 'var(--color-red)' }}>*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as IssueReport['reason'])}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-input)',
                border: '1px solid var(--color-border-gray)',
                backgroundColor: 'var(--color-warm-white)',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              {reasonsList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-graphite)', display: 'block', marginBottom: '6px' }}>
              Additional Remarks / Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe what happened (e.g., customer phone switched off after 3 attempts, gate locked)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-input)',
                border: '1px solid var(--color-border-gray)',
                backgroundColor: 'var(--color-warm-white)',
                resize: 'none'
              }}
            />
          </div>

          {/* Photo Attachment */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-graphite)', display: 'block', marginBottom: '6px' }}>
              Incident / Location Photo Evidence (Optional)
            </label>
            {photoUrl ? (
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-border-gray)' }}>
                <img src={photoUrl} alt="Evidence" style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                <button
                  onClick={() => setPhotoUrl(null)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(29, 29, 31, 0.8)',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    padding: '6px'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label
                style={{
                  backgroundColor: 'var(--color-warm-white)',
                  border: '1px dashed var(--color-border-gray)',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Camera size={18} color="var(--color-soft-gray)" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-graphite)' }}>
                  Attach Photo Evidence
                </span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Resolution Options Notice */}
          <div
            style={{
              backgroundColor: 'var(--bg-red-tint)',
              border: '1px solid rgba(255, 59, 48, 0.25)',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '12px',
              color: 'var(--color-graphite)'
            }}
          >
            Submitting this report will abort the current delivery, notify customer support, and release your status back to <b>Available</b>.
          </div>

          {/* Dual Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={() => handleAction('RETURNED')}
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '12px',
                justifyContent: 'center',
                border: '1px solid var(--color-blue)',
                color: 'var(--color-blue)',
                fontWeight: '700'
              }}
            >
              <RotateCcw size={17} /> Return Package to Merchant
            </button>

            <button
              onClick={() => handleAction('FAILED_DELIVERY')}
              className="btn-danger-solid"
              style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
            >
              <XCircle size={17} /> Mark Delivery as Failed
            </button>

            <button
              onClick={closeModal}
              className="btn-secondary"
              style={{ width: '100%', padding: '10px', fontSize: '13px', color: 'var(--color-soft-gray)' }}
            >
              Cancel & Continue Delivery
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
