import React, { useState, useRef, useEffect } from 'react';
import { useDelivery } from '../context/DeliveryContext';
import { ProofOfDelivery } from '../types/delivery';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Camera,
  MapPin,
  PenTool,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Sparkles,
  X
} from 'lucide-react';

export const ProofOfDeliveryModal: React.FC = () => {
  const { state, closeModal, completeDelivery } = useDelivery();
  const { currentOrder } = state;

  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [gpsData, setGpsData] = useState<{ lat: number; lng: number; accuracy: number; capturedAt: string } | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const expectedOtp = currentOrder?.otp || '4829';

  // Initialize GPS on load
  useEffect(() => {
    handleCaptureGps();
  }, []);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1D1D1F';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureUrl(canvasRef.current.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureUrl(null);
  };

  // OTP Handling
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);
    setOtpError(null);

    // Auto focus next box
    if (val && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().slice(0, 4);
    if (/^\d+$/.test(pasted)) {
      const digits = pasted.split('').slice(0, 4);
      while (digits.length < 4) digits.push('');
      setOtpDigits(digits);
      setOtpError(null);
      otpInputsRef.current[Math.min(pasted.length, 3)]?.focus();
    }
  };

  const handleQuickFillOtp = () => {
    const digits = expectedOtp.split('');
    setOtpDigits(digits);
    setOtpError(null);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Photo Handling
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

  const handleSimulateCameraSnap = () => {
    // Generate simulated canvas image snapshot
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw background
      ctx.fillStyle = '#E5E9EE';
      ctx.fillRect(0, 0, 400, 300);

      // Draw doorstep & package
      ctx.fillStyle = '#C5CCD6';
      ctx.fillRect(50, 80, 300, 200);

      ctx.fillStyle = '#8B5A2B';
      ctx.fillRect(120, 110, 160, 120);

      ctx.fillStyle = '#A06D3B';
      ctx.fillRect(130, 120, 140, 100);

      // Tape
      ctx.fillStyle = '#E6C280';
      ctx.fillRect(190, 110, 20, 120);

      // Text watermark
      ctx.fillStyle = 'rgba(29, 29, 31, 0.85)';
      ctx.fillRect(10, 240, 380, 50);

      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`GrabIt POD: ${currentOrder?.orderNumber}`, 20, 260);
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#34C759';
      ctx.fillText(`Doorstep Verified • ${new Date().toLocaleTimeString()}`, 20, 278);

      setPhotoUrl(canvas.toDataURL('image/jpeg'));
    }
  };

  // GPS Handling
  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsData({
            lat: +pos.coords.latitude.toFixed(5),
            lng: +pos.coords.longitude.toFixed(5),
            accuracy: Math.round(pos.coords.accuracy) || 4,
            capturedAt: new Date().toLocaleTimeString()
          });
          setIsCapturingGps(false);
        },
        () => {
          // Fallback simulation coordinates
          setGpsData({
            lat: 40.7282,
            lng: -73.9942,
            accuracy: 3,
            capturedAt: new Date().toLocaleTimeString()
          });
          setIsCapturingGps(false);
        },
        { timeout: 4000 }
      );
    } else {
      setGpsData({
        lat: 40.7282,
        lng: -73.9942,
        accuracy: 3,
        capturedAt: new Date().toLocaleTimeString()
      });
      setIsCapturingGps(false);
    }
  };

  // Submission Validation & Action
  const enteredOtp = otpDigits.join('');
  const isOtpComplete = enteredOtp.length === 4;

  const handleSubmitPOD = () => {
    if (enteredOtp !== expectedOtp) {
      setOtpError(`Invalid OTP. Please enter the 4-digit code provided to ${currentOrder?.customer.name}.`);
      return;
    }

    const pod: ProofOfDelivery = {
      otpEntered: enteredOtp,
      photoUrl: photoUrl || undefined,
      signatureDataUrl: signatureUrl || undefined,
      gpsCoords: gpsData || {
        lat: 40.7282,
        lng: -73.9942,
        accuracy: 3,
        capturedAt: new Date().toLocaleTimeString()
      }
    };

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Graceful
    }

    completeDelivery(pod);
  };

  return (
    <div className="modal-overlay" style={{ padding: '16px' }}>
      <div
        className="modal-content glass-strong"
        style={{
          maxWidth: '540px',
          maxHeight: '92vh',
          borderRadius: '24px',
          border: '1px solid var(--glass-border-strong)',
          display: 'flex',
          flexDirection: 'column',
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
                backgroundColor: 'var(--color-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={22} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0, color: '#FFFFFF' }}>
                Proof of Delivery (POD)
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-soft-gray)', margin: 0 }}>
                Order {currentOrder?.orderNumber} • Handover Verification
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

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* COD Notice if applicable */}
          {currentOrder?.paymentMethod === 'COD' && (
            <div
              style={{
                backgroundColor: 'var(--bg-red-tint)',
                border: '1px solid rgba(255, 59, 48, 0.35)',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <AlertCircle size={22} color="var(--color-red)" />
              <div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-red)', display: 'block' }}>
                  CASH ON DELIVERY COLLECTION
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-graphite)' }}>
                  Please ensure you have collected <b>${currentOrder.codAmount?.toFixed(2)}</b> in cash from the customer before completing.
                </span>
              </div>
            </div>
          )}

          {/* Step 1: OTP Verification */}
          <div
            style={{
              backgroundColor: 'var(--color-warm-white)',
              border: '1px solid var(--color-border-gray)',
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-blue)' }}>1.</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-graphite)' }}>
                  Customer Delivery OTP <span style={{ color: 'var(--color-red)' }}>*</span>
                </span>
              </div>

              {/* Demo Helper Pill */}
              <button
                onClick={handleQuickFillOtp}
                title="Auto-fill OTP for testing"
                style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--bg-blue-tint)',
                  border: '1px solid rgba(0, 113, 227, 0.3)',
                  color: 'var(--color-blue)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Copy size={12} />
                <span>{copiedOtp ? 'Filled!' : `Demo OTP: ${expectedOtp}`}</span>
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--color-soft-gray)', margin: '0 0 12px' }}>
              Ask the customer for the 4-digit code sent via SMS to verify physical receipt.
            </p>

            {/* 4-Digit Input Boxes */}
            <div
              onPaste={handlePasteOtp}
              style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}
            >
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputsRef.current[idx] = el)}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  style={{
                    width: '56px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: '800',
                    borderRadius: '12px',
                    border: otpError
                      ? '2px solid var(--color-red)'
                      : digit
                      ? '2px solid var(--color-blue)'
                      : '1px solid var(--color-border-gray)',
                    backgroundColor: 'var(--color-pure-white)',
                    boxShadow: digit ? '0 2px 8px rgba(0, 113, 227, 0.15)' : 'none',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            {otpError && (
              <p style={{ fontSize: '12px', color: 'var(--color-red)', textAlign: 'center', margin: '6px 0 0', fontWeight: '600' }}>
                {otpError}
              </p>
            )}
          </div>

          {/* Step 2: Delivery Photo Capture */}
          <div
            style={{
              backgroundColor: 'var(--color-warm-white)',
              border: '1px solid var(--color-border-gray)',
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-blue)' }}>2.</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-graphite)' }}>
                  Delivery Doorstep Photo (Optional)
                </span>
              </div>
            </div>

            {photoUrl ? (
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-border-gray)' }}>
                <img src={photoUrl} alt="Delivery Proof" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                <button
                  onClick={() => setPhotoUrl(null)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(29, 29, 31, 0.75)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label
                  style={{
                    backgroundColor: 'var(--color-pure-white)',
                    border: '1px dashed var(--color-border-gray)',
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Camera size={20} color="var(--color-blue)" />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-graphite)' }}>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>

                <button
                  type="button"
                  onClick={handleSimulateCameraSnap}
                  style={{
                    backgroundColor: 'var(--color-pure-white)',
                    border: '1px dashed var(--color-border-gray)',
                    borderRadius: '10px',
                    padding: '16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={20} color="var(--color-green)" />
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-graphite)' }}>Simulate Camera Snap</span>
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Customer Signature Pad */}
          <div
            style={{
              backgroundColor: 'var(--color-warm-white)',
              border: '1px solid var(--color-border-gray)',
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-blue)' }}>3.</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-graphite)' }}>
                  Customer Signature (Optional)
                </span>
              </div>
              <button
                onClick={clearCanvas}
                style={{ fontSize: '11px', color: 'var(--color-soft-gray)', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-pure-white)',
                border: '1px solid var(--color-border-gray)',
                borderRadius: '8px',
                position: 'relative'
              }}
            >
              <canvas
                ref={canvasRef}
                width={460}
                height={100}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ width: '100%', height: '100px', display: 'block', touchAction: 'none', cursor: 'crosshair' }}
              />
              {!signatureUrl && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: 'var(--color-soft-gray)',
                    fontSize: '12px'
                  }}
                >
                  <PenTool size={14} />
                  <span>Customer signs here using finger or mouse</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: GPS Geotag Lock */}
          <div
            style={{
              backgroundColor: 'var(--color-warm-white)',
              border: '1px solid var(--color-border-gray)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={18} color="var(--color-green)" />
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-graphite)', display: 'block' }}>
                  GPS Delivery Geotag Locked
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-soft-gray)' }}>
                  {gpsData
                    ? `Lat: ${gpsData.lat}, Lng: ${gpsData.lng} (Accuracy: ±${gpsData.accuracy}m)`
                    : 'Acquiring GPS fix...'}
                </span>
              </div>
            </div>

            <button
              onClick={handleCaptureGps}
              disabled={isCapturingGps}
              style={{
                fontSize: '11px',
                color: 'var(--color-blue)',
                backgroundColor: 'var(--bg-blue-tint)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontWeight: '600'
              }}
            >
              {isCapturingGps ? 'Locking...' : 'Refresh GPS'}
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--color-pure-white)',
            borderTop: '1px solid var(--color-border-gray)',
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '12px'
          }}
        >
          <button
            onClick={closeModal}
            className="btn-secondary"
            style={{ padding: '12px' }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmitPOD}
            disabled={!isOtpComplete}
            className="btn-primary"
            style={{
              padding: '12px',
              backgroundColor: isOtpComplete ? 'var(--color-green)' : 'var(--color-blue)',
              opacity: isOtpComplete ? 1 : 0.5,
              fontWeight: '700'
            }}
          >
            <CheckCircle2 size={18} />
            Complete Delivery
          </button>
        </div>

      </div>
    </div>
  );
};
