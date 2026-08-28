import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquareHeart, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function CustomerReviewSection({ storeName = 'GrabIt Supermarket' }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const handleRatingClick = (val) => {
    setRating(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      if (toast?.showToast) toast.showToast('Please select a star rating (1 to 5 stars)!');
      return;
    }
    if (!reviewText.trim()) {
      if (toast?.showToast) toast.showToast('Please write a brief review before submitting!');
      return;
    }


    try {
      const newReview = {
        id: Date.now(),
        storeName,
        rating,
        reviewText: reviewText.trim(),
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        user: (() => {
          try {
            const u = localStorage.getItem('grabit_user');
            return u ? JSON.parse(u).full_name || 'Verified Customer' : 'Verified Customer';
          } catch {
            return 'Verified Customer';
          }
        })()
      };

      const existing = JSON.parse(localStorage.getItem('grabit_user_reviews') || '[]');
      localStorage.setItem('grabit_user_reviews', JSON.stringify([newReview, ...existing]));
      window.dispatchEvent(new Event('grabit_reviews_updated'));
    } catch {}

    setSubmitted(true);
    if (toast?.showToast) toast.showToast('🎉 Thank you! Your review has been submitted successfully.');
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '24px',
      border: '1px solid #E2E8F0',
      padding: '28px 24px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
      margin: '24px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Accent Stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
        background: 'linear-gradient(90deg, #0071E3 0%, #38BDF8 50%, #F59E0B 100%)'
      }} />

      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <MessageSquareHeart size={22} color="#0071E3" />
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.3px' }}>
            Share Your Experience
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
          We value your feedback! Rate your experience with <strong>{storeName}</strong>.
        </p>
      </div>

      {submitted ? (
        <div style={{
          background: '#F0FDF4', borderRadius: '18px', border: '1px solid #BBF7D0',
          padding: '24px', textAlign: 'center', color: '#166534'
        }}>
          <CheckCircle2 size={44} color="#16A34A" style={{ marginBottom: '8px' }} />
          <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 900 }}>Thank You for Your Review! ⭐</h4>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#15803D' }}>
            Your feedback helps us keep providing 10-minute express deliveries and top-quality groceries.
          </p>
          <button
            onClick={() => { setSubmitted(false); setReviewText(''); }}
            style={{
              background: '#FFFFFF', border: '1px solid #86EFAC', color: '#15803D',
              borderRadius: '12px', padding: '8px 18px', fontSize: '12px', fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Submit Another Review
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Rate Store Row */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
              Rate {storeName}:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = (hoverRating || rating) >= starVal;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => handleRatingClick(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none', border: 'none', padding: '2px', cursor: 'pointer',
                      transition: 'transform 0.15s ease', transform: isFilled ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    <Star
                      size={28}
                      fill={isFilled ? '#F59E0B' : '#E2E8F0'}
                      color={isFilled ? '#D97706' : '#CBD5E1'}
                    />
                  </button>
                );
              })}
              <span style={{ fontSize: '13px', fontWeight: 800, color: (hoverRating || rating) > 0 ? '#F59E0B' : '#94A3B8', marginLeft: '6px' }}>
                {(hoverRating || rating) > 0 ? `${(hoverRating || rating)}.0 / 5.0` : 'Tap to rate'}
              </span>
            </div>
          </div>

          {/* Your Review Textarea */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: '#1E293B', marginBottom: '6px' }}>
              Your Review:
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with quality, packaging, or delivery speed..."
              style={{
                width: '100%',
                minHeight: '110px',
                background: '#F8FAFC',
                border: '1.5px solid #CBD5E1',
                borderRadius: '16px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#0F172A',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.15s ease',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0071E3'}
              onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                width: '100%',
                maxWidth: '220px',
                background: 'linear-gradient(135deg, #0071E3 0%, #0056B3 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '16px',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,113,227,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#005BB5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #0071E3 0%, #0056B3 100%)'}
            >
              <Send size={16} />
              Submit Review
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
