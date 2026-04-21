import React from 'react';
import { useDataStore } from '../context/DataStore';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, Trash2 } from 'lucide-react';

const UpcomingList: React.FC = () => {
  const { reservations, myToken, cancelReservation } = useDataStore();
  const today = startOfDay(new Date());

  const upcoming = [...reservations]
    .filter(r => {
      const d = parseISO(r.dateStr);
      return isAfter(d, today) || d.getTime() === today.getTime();
    })
    .sort((a, b) => parseISO(a.dateStr).getTime() - parseISO(b.dateStr).getTime())
    .slice(0, 12);

  if (upcoming.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '2.5rem 1rem',
        color: 'var(--color-text-muted)', fontSize: '0.875rem',
      }}>
        <CalendarDays size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
        <p>No hay reservas próximas registradas.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {upcoming.map(res => (
        <div key={res.id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1rem',
          backgroundColor: 'var(--color-background)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          transition: 'box-shadow 0.2s',
          gap: '1rem',
        }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          {/* Color strip */}
          <div style={{
            width: '4px', height: '36px', borderRadius: '4px', flexShrink: 0,
            backgroundColor: res.space === 'Parrilla' ? 'var(--color-parrilla)' : 'var(--color-sum)',
          }} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.2 }}>
              {format(parseISO(res.dateStr), "EEEE d 'de' MMMM", { locale: es })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              Turno {res.turn} · Depto <strong>{res.department}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`badge badge-${res.space === 'Parrilla' ? 'parrilla' : 'sum'}`}>
              {res.space}
            </span>
            {res.deviceToken === myToken && (
              <button 
                onClick={async () => {
                  if (window.confirm(`¿Seguro que querés cancelar tu reserva del ${format(parseISO(res.dateStr), "d 'de' MMMM", { locale: es })}?`)) {
                    cancelReservation(res.id);
                  }
                }}
                style={{ color: '#e11d48', padding: '0.35rem', backgroundColor: '#fff1f2', borderRadius: '50%', display: 'flex' }} 
                title="Cancelar mi reserva"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingList;
