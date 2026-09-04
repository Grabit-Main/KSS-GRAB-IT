import React, { useState, useEffect } from 'react';
import { get } from '../../../api';
import { useDelivery, formatActiveTime } from '../../context/DeliveryContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Umbrella,
  Info
} from 'lucide-react';

interface AttendanceDay {
  date: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE' | 'UPCOMING' | 'BEFORE_JOIN';
  color: 'green' | 'yellow' | 'red' | 'purple' | 'neutral';
  leave_type?: 'WEEKOFF' | 'HOLIDAY' | 'LEAVE' | null;
  detail: string;
  note?: string | null;
}

interface AttendanceSummary {
  present: number;
  late: number;
  absent: number;
  leave: number;
  total_days: number;
}

const C = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  graphite: '#1D1D1F',
  gray: '#8E8E93',
  border: '#E5E5EA',
  blue: '#0071E3',
  green: '#10B981',
  greenBg: '#ECFDF5',
  greenBorder: '#A7F3D0',
  yellow: '#D97706',
  yellowBg: '#FEF3C7',
  yellowBorder: '#FDE68A',
  red: '#EF4444',
  redBg: '#FEE2E2',
  redBorder: '#FCA5A5',
  purple: '#8B5CF6',
  purpleBg: '#F3E8FF',
  purpleBorder: '#DDD6FE',
  neutral: '#64748B',
  neutralBg: '#F1F5F9',
};

export const AttendanceScreen: React.FC = () => {
  const { state } = useDelivery();
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const isRiderActive = state.agentStatus === 'AVAILABLE' || state.agentStatus === 'ON_DELIVERY' || state.activeShiftSeconds > 0;
  
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [attendanceData, setAttendanceData] = useState<{ summary: AttendanceSummary; days: AttendanceDay[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<AttendanceDay | null>(null);

  const fetchAttendance = async (monthStr: string) => {
    setLoading(true);
    try {
      const res: any = await get(`/delivery/attendance?month=${monthStr}`);
      if (res && res.days) {
        setAttendanceData(res);
      }
    } catch (err) {
      console.warn('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedMonth);
    
    const handleUpdate = () => fetchAttendance(selectedMonth);
    window.addEventListener('grabit_global_leave_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('grabit_global_leave_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [selectedMonth, state.agentStatus, state.isUnavailable]);

  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(prevStr);
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    if (nextDate > now) return; // Prevent going into future months
    const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(nextStr);
    setSelectedDay(null);
  };

  const isNextDisabled = (() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    return nextDate > now;
  })();

  const formatMonthTitle = (monthStr: string) => {
    try {
      const [y, m] = monthStr.split('-').map(Number);
      const d = new Date(y, m - 1, 1);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  const days: AttendanceDay[] = React.useMemo(() => {
    const rawDays = attendanceData?.days || [];
    if (rawDays.length > 0) {
      return rawDays.map((day) => {
        if (day.date === todayStr) {
          if (!isRiderActive && day.status !== 'LEAVE') {
            return {
              ...day,
              status: 'UPCOMING',
              color: 'neutral',
              detail: 'Shift Not Started Yet • Tap Go Active to start today’s shift'
            };
          } else if (isRiderActive) {
            const isLate = Boolean(state.arrivedLateToday);
            const shiftDurStr = formatActiveTime(state.activeShiftSeconds);
            const periodDetail = shiftDurStr && shiftDurStr !== '0 mins' ? ` • Still Active (${shiftDurStr})` : '';
            return {
              ...day,
              status: isLate ? 'LATE' : 'PRESENT',
              color: isLate ? 'yellow' : 'green',
              detail: isLate
                ? `Late — Active shift started after grace window${periodDetail}`
                : `Present — Shift started on time${periodDetail}`
            };
          }
        }
        return day;
      });
    }

    // Fallback: Generate days of selected month dynamically so calendar grid is ALWAYS rendered
    const [y, m] = selectedMonth.split('-').map(Number);
    const numDays = new Date(y, m, 0).getDate();
    const generated: AttendanceDay[] = [];

    for (let dayNum = 1; dayNum <= numDays; dayNum++) {
      const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
      const dObj = new Date(y, m - 1, dayNum);
      const isSunday = dObj.getDay() === 0;
      const isToday = dateStr === todayStr;
      const isFuture = dObj > now;

      let status: AttendanceDay['status'] = 'UPCOMING';
      let color: AttendanceDay['color'] = 'neutral';
      let detail = 'Upcoming day';

      if (isToday) {
        if (isRiderActive) {
          const isLate = Boolean(state.arrivedLateToday);
          const shiftDurStr = formatActiveTime(state.activeShiftSeconds);
          const periodDetail = shiftDurStr && shiftDurStr !== '0 mins' ? ` • Still Active (${shiftDurStr})` : '';
          status = isLate ? 'LATE' : 'PRESENT';
          color = isLate ? 'yellow' : 'green';
          detail = isLate
            ? `Late — Active shift started after grace window${periodDetail}`
            : `Present — Shift started on time${periodDetail}`;
        } else if (state.isLeaveToday) {
          status = 'LEAVE';
          color = 'purple';
          detail = `Leave — ${state.leaveTodayTitle || 'Scheduled Leave / Week Off Today'}`;
        } else if (isSunday) {
          status = 'LEAVE';
          color = 'purple';
          detail = 'Sunday Weekly Off';
        } else {
          status = 'UPCOMING';
          color = 'neutral';
          detail = 'Shift Not Started Yet • Tap Go Active to start today’s shift';
        }
      } else if (isFuture) {
        if (isSunday) {
          status = 'LEAVE';
          color = 'purple';
          detail = 'Sunday Weekly Off';
        } else {
          status = 'UPCOMING';
          color = 'neutral';
          detail = 'Upcoming day';
        }
      } else {
        if (isSunday) {
          status = 'LEAVE';
          color = 'purple';
          detail = 'Sunday Weekly Off';
        } else {
          status = 'ABSENT';
          color = 'red';
          detail = 'Absent — Store open, no shift recorded';
        }
      }

      generated.push({
        date: dateStr,
        status,
        color,
        detail,
        leave_type: status === 'LEAVE' ? 'WEEKOFF' : null,
        note: null
      });
    }

    return generated;
  }, [attendanceData, selectedMonth, todayStr, isRiderActive, state.arrivedLateToday, state.activeShiftSeconds, state.isLeaveToday, state.leaveTodayTitle, now]);

  const summary: AttendanceSummary = React.useMemo(() => {
    if (!days.length) {
      return attendanceData?.summary || { present: 0, late: 0, absent: 0, leave: 0, total_days: 0 };
    }
    let p = 0, l = 0, a = 0, lv = 0;
    days.forEach((d) => {
      if (d.status === 'PRESENT') p++;
      else if (d.status === 'LATE') l++;
      else if (d.status === 'ABSENT') a++;
      else if (d.status === 'LEAVE') lv++;
    });
    return { present: p, late: l, absent: a, leave: lv, total_days: days.length };
  }, [days, attendanceData]);

  // Generate calendar grid alignment (first day offset)
  const [yNum, mNum] = selectedMonth.split('-').map(Number);
  const firstDayOfWeek = new Date(yNum, mNum - 1, 1).getDay(); // 0 = Sun
  const padOffset = (firstDayOfWeek + 6) % 7; // Convert to Mon=0

  return (
    <div
      className="page-enter attendance-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: C.bg,
        minHeight: '100%',
      }}
    >
      {/* Header */}
      <div style={{ backgroundColor: C.card, borderRadius: '22px', padding: '20px 22px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: C.graphite, margin: '0 0 2px' }}>
              Attendance &amp; Shifts
            </h1>
            <p style={{ fontSize: '13px', color: C.gray, margin: 0 }}>
              Live calendar log of completed shifts, arrival times, and approved leave.
            </p>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${C.blue}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarIcon size={22} color={C.blue} />
          </div>
        </div>

        {/* Month Selector Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '14px', borderTop: `1px solid ${C.border}` }}>
          <button
            type="button"
            onClick={handlePrevMonth}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '6px 14px', borderRadius: '12px', background: '#F1F5F9', border: '1px solid #E2E8F0',
              fontSize: '12.5px', fontWeight: '700', color: C.graphite, cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} /> Prev Month
          </button>
          <span style={{ fontSize: '15px', fontWeight: '800', color: C.graphite }}>
            {formatMonthTitle(selectedMonth)}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            disabled={isNextDisabled}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '6px 14px', borderRadius: '12px', background: isNextDisabled ? '#F8FAFC' : '#F1F5F9',
              border: '1px solid #E2E8F0', fontSize: '12.5px', fontWeight: '700',
              color: isNextDisabled ? '#CBD5E1' : C.graphite, cursor: isNextDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            Next Month <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Monthly Summary Breakdown Bar */}
      <div style={{ backgroundColor: C.card, borderRadius: '20px', padding: '16px 18px', boxShadow: '0 2px 14px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '12px', fontWeight: '800', color: C.gray, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          Monthly Summary ({formatMonthTitle(selectedMonth)})
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
          <div style={{ background: C.greenBg, border: `1px solid ${C.greenBorder}`, padding: '10px 6px', borderRadius: '12px' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: C.green }}>{summary.present}</div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: C.green }}>Present</div>
          </div>
          <div style={{ background: C.yellowBg, border: `1px solid ${C.yellowBorder}`, padding: '10px 6px', borderRadius: '12px' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: C.yellow }}>{summary.late}</div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: C.yellow }}>Late</div>
          </div>
          <div style={{ background: C.redBg, border: `1px solid ${C.redBorder}`, padding: '10px 6px', borderRadius: '12px' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: C.red }}>{summary.absent}</div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: C.red }}>Absent</div>
          </div>
          <div style={{ background: C.purpleBg, border: `1px solid ${C.purpleBorder}`, padding: '10px 6px', borderRadius: '12px' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: C.purple }}>{summary.leave}</div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: C.purple }}>Week Off / Leave</div>
          </div>
        </div>
      </div>

      {/* Attendance Month Grid Calendar */}
      <div style={{ backgroundColor: C.card, borderRadius: '22px', padding: '18px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        {/* Days of week header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '10px' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
            <div key={dayName} style={{ fontSize: '11.5px', fontWeight: '800', color: C.gray }}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Day Cells Grid */}
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: C.gray, fontSize: '13px', fontWeight: '600' }}>
            Loading attendance records...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {/* Offset empty slots for first week */}
            {Array.from({ length: padOffset }).map((_, i) => (
              <div key={`pad-${i}`} style={{ height: '48px', borderRadius: '10px', background: 'transparent' }} />
            ))}

            {days.map((dayItem) => {
              const dayNum = parseInt(dayItem.date.slice(-2), 10);
              const isSelected = selectedDay?.date === dayItem.date;

              let bg = C.neutralBg;
              let border = '1px solid #E2E8F0';
              let text = C.neutral;
              let badgeDot = '⚪';

              if (dayItem.status === 'PRESENT') {
                bg = C.greenBg; border = `1.5px solid ${C.greenBorder}`; text = C.green; badgeDot = '🟢';
              } else if (dayItem.status === 'LATE') {
                bg = C.yellowBg; border = `1.5px solid ${C.yellowBorder}`; text = C.yellow; badgeDot = '🟡';
              } else if (dayItem.status === 'ABSENT') {
                bg = C.redBg; border = `1.5px solid ${C.redBorder}`; text = C.red; badgeDot = '🔴';
              } else if (dayItem.status === 'LEAVE') {
                bg = C.purpleBg; border = `1.5px solid ${C.purpleBorder}`; text = C.purple; badgeDot = '🟣';
              }

              return (
                <button
                  type="button"
                  key={dayItem.date}
                  onClick={() => setSelectedDay(dayItem)}
                  style={{
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: bg,
                    border: isSelected ? `2.5px solid ${C.blue}` : border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (dayItem.status !== 'UPCOMING' && dayItem.status !== 'BEFORE_JOIN') ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 10px rgba(0,113,227,0.3)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: '900', color: text }}>{dayNum}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Day Detail Card */}
        {selectedDay && (
          <div
            style={{
              marginTop: '16px',
              padding: '14px 16px',
              borderRadius: '14px',
              backgroundColor: selectedDay.status === 'PRESENT' ? C.greenBg : selectedDay.status === 'LATE' ? C.yellowBg : selectedDay.status === 'ABSENT' ? C.redBg : selectedDay.status === 'LEAVE' ? C.purpleBg : C.neutralBg,
              border: `1.5px solid ${selectedDay.status === 'PRESENT' ? C.greenBorder : selectedDay.status === 'LATE' ? C.yellowBorder : selectedDay.status === 'ABSENT' ? C.redBorder : selectedDay.status === 'LEAVE' ? C.purpleBorder : '#E2E8F0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {selectedDay.status === 'PRESENT' && <CheckCircle2 size={20} color={C.green} />}
              {selectedDay.status === 'LATE' && <Clock size={20} color={C.yellow} />}
              {selectedDay.status === 'ABSENT' && <AlertTriangle size={20} color={C.red} />}
              {selectedDay.status === 'LEAVE' && <Umbrella size={20} color={C.purple} />}
              {(selectedDay.status === 'UPCOMING' || selectedDay.status === 'BEFORE_JOIN') && <Info size={20} color={C.neutral} />}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: C.graphite }}>
                  {new Date(selectedDay.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} — {selectedDay.status}
                </div>
                <div style={{ fontSize: '12px', color: C.gray, fontWeight: '600', marginTop: '1px' }}>
                  {selectedDay.detail}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              style={{ background: 'transparent', border: 0, fontSize: '12px', fontWeight: 800, color: C.gray, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
