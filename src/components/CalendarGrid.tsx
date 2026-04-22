import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { useDataStore } from '../context/DataStore';
import { Lock } from 'lucide-react';

/** Returns true if dateStr falls within [dateFrom, dateTo] */
const isInRange = (dateStr: string, dateFrom: string, dateTo: string) =>
  dateStr >= dateFrom && dateStr <= dateTo;

interface CalendarGridProps {
  currentMonth: Date;
  onDayClick: (dateStr: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentMonth, onDayClick }) => {
  const { reservations, blocks } = useDataStore();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 1);
  const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="card" style={{ padding: '1rem' }}>
      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
        {weekDays.map(d => (
          <div key={d} style={{
            fontSize: '0.7rem', fontWeight: 700, textAlign: 'center',
            color: 'var(--color-text-muted)', textTransform: 'uppercase',
            letterSpacing: '0.05em', padding: '0.25rem 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {/* Empty cells to align first day */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} style={{ minHeight: '72px' }} />
        ))}

        {daysInMonth.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayReservations = reservations.filter(r => r.dateStr === dateStr);
          const dayBlocks = blocks.filter(b => isInRange(dateStr, b.dateFrom, b.dateTo));
          const isCurrentDay = isToday(day);
          const hasBlock = dayBlocks.length > 0;
          
          const isPast = dateStr < todayStr;
          const isTooFar = dateStr > maxDateStr;
          const isGreyedOut = isPast || isTooFar;

          return (
            <div
              key={dateStr}
              onClick={() => {
                if (!isGreyedOut) onDayClick(dateStr);
              }}
              style={{
                minHeight: '72px',
                borderRadius: 'var(--radius-md)',
                padding: '4px',
                cursor: isGreyedOut ? 'not-allowed' : 'pointer',
                border: isCurrentDay
                  ? '2px solid var(--color-text-primary)'
                  : hasBlock
                    ? '1px solid #fde68a'
                    : '1px solid var(--color-border)',
                backgroundColor: hasBlock
                  ? '#fffbeb'
                  : isCurrentDay
                    ? '#f8fafc'
                    : isGreyedOut
                      ? '#f1f5f9'
                      : 'var(--color-background)',
                opacity: isGreyedOut ? 0.6 : 1,
                display: 'flex',
                flexDirection: 'column',
                transition: 'background-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { if (!isGreyedOut) e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { if (!isGreyedOut) e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Day number */}
              <div style={{
                fontSize: '0.8rem',
                fontWeight: isCurrentDay ? 800 : 500,
                textAlign: 'right',
                color: isCurrentDay ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                marginBottom: '3px',
              }}>
                {format(day, 'd')}
              </div>

              {/* Blocks */}
              {dayBlocks.map(b => (
                <div key={b.id} className="day-pill" style={{
                  backgroundColor: '#fef3c7',
                  color: '#78350f',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}>
                  <Lock size={8} style={{ flexShrink: 0 }} className="hidden-mobile" />
                  <span className="hidden-mobile">
                    {b.space === 'Ambos' ? 'BLOQUEADO' : `${b.space.toUpperCase()} bloq.`}
                  </span>
                  <span className="show-mobile">
                    🔒 {b.space === 'Ambos' ? 'T' : b.space.substring(0, 1)}
                  </span>
                </div>
              ))}

              {/* Reservations */}
              {dayReservations.map(res => (
                <div key={res.id} className="day-pill" style={{
                  backgroundColor: res.space === 'Parrilla' ? '#fee2e2' : '#dcfce7',
                  color: res.space === 'Parrilla' ? '#b91c1c' : '#15803d',
                  marginBottom: '2px',
                  display: 'flex', alignItems: 'center', gap: '2px'
                }}>
                  <span className="hidden-mobile" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {res.space.toUpperCase()} – {res.department}
                  </span>
                  <span className="show-mobile">
                    {res.space === 'Parrilla' ? '🔥' : '🏛'} {res.department}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
