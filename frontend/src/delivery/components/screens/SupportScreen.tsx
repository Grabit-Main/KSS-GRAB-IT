import React, { useState } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import { SupportTicket } from '../../types/delivery';
import { faqList } from '../../data/mockData';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  LifeBuoy,
  FileText
} from 'lucide-react';

export const SupportScreen: React.FC = () => {
  const { state, createSupportTicket, openModal, showAlert } = useDelivery();
  const { supportTickets } = state;

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [category, setCategory] = useState<SupportTicket['category']>('App problem');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [ticketCreatedSuccess, setTicketCreatedSuccess] = useState<string | null>(null);

  const categories: SupportTicket['category'][] = [
    'App problem',
    'Navigation problem',
    'Customer issue',
    'Pickup issue',
    'Delivery issue',
    'Other'
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    createSupportTicket({
      category,
      subject: subject.trim(),
      description: description.trim()
    });

    setTicketCreatedSuccess(`Ticket submitted successfully! Reference ID will be tracked in your portal.`);
    setSubject('');
    setDescription('');

    setTimeout(() => {
      setTicketCreatedSuccess(null);
    }, 6000);
  };

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0, letterSpacing: '-0.3px' }}>
          Partner Help & Support Desk
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)', margin: '2px 0 0' }}>
          24/7 Roadside Assistance, Dispatch Escalation & Technical Support
        </p>
      </div>

      {/* Emergency Contact Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '14px' }}>
        
        <div className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color="var(--color-red)" />
            </div>
            <div>
              <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0 }}>
                Safety & Emergency Hotline
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-soft-gray)', margin: 0 }}>
                Accident or physical threat response
              </p>
            </div>
          </div>

          <button
            onClick={() => openModal('SOS')}
            className="btn-danger"
            style={{ padding: '8px 14px', fontSize: '13px', fontWeight: '700' }}
          >
            <Phone size={14} /> SOS Call
          </button>
        </div>

        <div className="glass-card" style={{ padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(0, 113, 227, 0.1)', border: '1px solid rgba(0, 113, 227, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LifeBuoy size={20} color="var(--color-blue)" />
            </div>
            <div>
              <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0 }}>
                Live Dispatch Control Room
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-soft-gray)', margin: 0 }}>
                Merchant delays & navigation queries
              </p>
            </div>
          </div>

          <button
            onClick={() => showAlert({
              title: 'Dispatch Control Room',
              message: 'Connecting to Live Dispatcher Operator (Audio Simulated)...',
              type: 'info'
            })}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '13px', color: 'var(--color-blue)', border: '1px solid rgba(0, 113, 227, 0.35)', fontWeight: '700' }}
          >
            <MessageSquare size={14} /> Call Hub
          </button>
        </div>

      </div>

      {/* Two Column Layout: FAQs and Ticket Submission */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '20px' }}>
        
        {/* Left Column: FAQ Accordion */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <HelpCircle size={18} color="var(--color-graphite)" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0 }}>
              Frequently Asked Questions
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {faqList.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border-subtle)',
                    backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.90)' : 'rgba(255, 255, 255, 0.60)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      fontWeight: '700',
                      fontSize: '13px',
                      color: 'var(--color-graphite)'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} color="var(--color-blue)" /> : <ChevronDown size={16} color="var(--color-soft-gray)" />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 14px 14px', fontSize: '12.5px', color: 'var(--color-soft-gray)', lineHeight: '1.5' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Create Support Ticket Form */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FileText size={18} color="var(--color-graphite)" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-graphite)', margin: 0 }}>
              Create Support Ticket
            </h3>
          </div>

          {ticketCreatedSuccess && (
            <div
              style={{
                backgroundColor: 'rgba(52, 199, 89, 0.12)',
                border: '1px solid rgba(52, 199, 89, 0.4)',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
                fontSize: '13px',
                color: 'var(--color-graphite)'
              }}
            >
              <CheckCircle2 size={18} color="var(--color-green)" />
              <span>{ticketCreatedSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-graphite)', display: 'block', marginBottom: '6px' }}>
                Issue Category <span style={{ color: 'var(--color-red)' }}>*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-input)',
                  border: '1px solid var(--glass-border-subtle)',
                  backgroundColor: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-graphite)', display: 'block', marginBottom: '6px' }}>
                Subject <span style={{ color: 'var(--color-red)' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Brief summary of the issue..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-input)',
                  border: '1px solid var(--glass-border-subtle)',
                  backgroundColor: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-graphite)', display: 'block', marginBottom: '6px' }}>
                Description <span style={{ color: 'var(--color-red)' }}>*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Explain the details so our support team can assist you..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-input)',
                  border: '1px solid var(--glass-border-subtle)',
                  backgroundColor: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '13px',
                  resize: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '14.5px', fontWeight: '700' }}
            >
              <Send size={16} /> Submit Support Ticket
            </button>
          </form>
        </div>

      </div>

      {/* Submitted Support Tickets Log */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <h3 style={{ fontSize: '15.5px', fontWeight: '800', color: 'var(--color-graphite)', marginBottom: '14px' }}>
          Recent Support Tickets ({supportTickets.length})
        </h3>

        {supportTickets.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--color-soft-gray)' }}>No tickets logged yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {supportTickets.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid var(--glass-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-graphite)' }}>
                      {ticket.id}
                    </span>
                    <span className="badge badge-gray" style={{ fontSize: '11px' }}>
                      {ticket.category}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-graphite)', margin: '3px 0 1px' }}>
                    {ticket.subject}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-soft-gray)', margin: 0 }}>
                    {ticket.description}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    className={ticket.status === 'RESOLVED' ? 'badge badge-green' : 'badge badge-blue'}
                    style={{ fontSize: '11px', fontWeight: '700' }}
                  >
                    {ticket.status}
                  </span>
                  <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-soft-gray)', marginTop: '3px' }}>
                    {ticket.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
