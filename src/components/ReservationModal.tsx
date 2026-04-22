import React, { useState } from 'react';
import { useDataStore } from '../context/DataStore';
import type { Space, Turn, Department } from '../types';
import { X, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservationModalProps {
  initialDate: string;
  onClose: () => void;
}

const DEPARTMENTS: Department[] = [
  '1A', '1B', '2A', '2B', '3A', '3B',
  '4A', '4B', '5A', '5B', '6A', '6B',
  '7A', '7B', '8A', '8B', '9'
];

const ReservationModal: React.FC<ReservationModalProps> = ({ initialDate, onClose }) => {
  const { addReservation, addNotice, blocks } = useDataStore();

  const [tab, setTab] = useState<'reservar' | 'aviso'>('reservar');

  const [space, setSpace] = useState<Space>('Parrilla');
  const [turn, setTurn] = useState<Turn>('Mediodía');
  const [dateStr, setDateStr] = useState(initialDate);
  const [department, setDepartment] = useState<Department>('1A');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeExpiresAt, setNoticeExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find active block for current selection
  const activeBlock = blocks.find(b => dateStr >= b.dateFrom && dateStr <= b.dateTo && (b.space === space || b.space === 'Ambos'));

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);
  const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError('');
    
    if (!dateStr) { setError('Por favor seleccioná una fecha.'); return; }
    
    if (dateStr < todayStr) {
      setError('No está permitido reservar en fechas pasadas.');
      return;
    }

    if (dateStr > maxDateStr) {
      setError('No se puede reservar con más de 1 mes de anticipación.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addReservation({ space, turn, dateStr, department });
      if (result.success) {
        setSuccess(true);
        setTimeout(onClose, 1800);
      } else {
        setError(result.error || 'Ocurrió un error.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.');
      setIsSubmitting(false);
    }
  };

  const handleNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !noticeMessage.trim()) return;
    setError('');
    setIsSubmitting(true);
    try {
      await addNotice(noticeMessage.trim(), noticeExpiresAt, false);
      setSuccess(true);
      setTimeout(onClose, 1800);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.');
      setIsSubmitting(false);
    }
  };

  const formattedDate = dateStr
    ? format(new Date(dateStr + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es })
    : '';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(15,23,42,0.55)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 50,
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div className="animate-slide-up" style={{
        backgroundColor: 'var(--color-background)',
        width: '100%', maxWidth: '480px',
        borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Handle */}
        <div style={{ width: '36px', height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '9999px', margin: '0 auto 1.25rem' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              {tab === 'reservar' ? 'Nueva Reserva' : 'Nuevo Aviso'}
            </h2>
            {formattedDate && tab === 'reservar' && (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem', textTransform: 'capitalize' }}>
                {formattedDate}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{ padding: '0.4rem', color: 'var(--color-text-muted)' }}><X size={20} /></button>
        </div>

      <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '4px', marginBottom: '1.25rem' }}>
          <button
            onClick={() => { setTab('reservar'); setError(''); }}
            style={{
              flex: 1, padding: '0.5rem', fontWeight: 700, fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              backgroundColor: tab === 'reservar' ? 'var(--color-text-primary)' : 'transparent',
              color: tab === 'reservar' ? '#fff' : 'var(--color-text-muted)', transition: 'all 0.2s',
            }}
          >Reserva</button>
          <button
            onClick={() => { setTab('aviso'); setError(''); }}
            style={{
              flex: 1, padding: '0.5rem', fontWeight: 700, fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              backgroundColor: tab === 'aviso' ? 'var(--color-text-primary)' : 'transparent',
              color: tab === 'aviso' ? '#fff' : 'var(--color-text-muted)', transition: 'all 0.2s',
            }}
          >Aviso Público</button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--color-sum)', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-sum)' }}>
              {tab === 'reservar' ? '¡Reserva confirmada!' : '¡Aviso publicado!'}
            </h3>
            {tab === 'reservar' && (
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                {space} · Turno {turn} · Depto {department}
              </p>
            )}
          </div>
        ) : tab === 'reservar' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Block warning */}
            {activeBlock && (
              <div style={{
                backgroundColor: '#fffbeb', border: '1px solid #fde68a',
                borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem',
                fontSize: '0.8rem', color: '#78350f', fontWeight: 500,
              }}>
                ⚠️ <strong>Espacio bloqueado por administración:</strong> {activeBlock.reason}
              </div>
            )}

            {error && (
              <div style={{
                backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem', fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            {/* Space selector */}
            <div>
              <label className="form-label">Espacio</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {(['Parrilla', 'SUM'] as Space[]).map(s => (
                  <button
                    key={s} type="button" onClick={() => setSpace(s)}
                    style={{
                      padding: '0.875rem',
                      borderRadius: 'var(--radius-lg)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      border: `2px solid ${space === s ? (s === 'Parrilla' ? 'var(--color-parrilla)' : 'var(--color-sum)') : 'var(--color-border)'}`,
                      backgroundColor: space === s ? (s === 'Parrilla' ? '#fef2f2' : '#f0fdf4') : 'var(--color-background)',
                      color: space === s ? (s === 'Parrilla' ? 'var(--color-parrilla)' : 'var(--color-sum)') : 'var(--color-text-muted)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s === 'Parrilla' ? '🔥 Parrilla' : '🏛 SUM'}
                  </button>
                ))}
              </div>
            </div>

            {/* Turn */}
            <div>
              <label className="form-label">Turno</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {(['Mediodía', 'Tarde', 'Noche'] as Turn[]).map(t => (
                  <button
                    key={t} type="button" onClick={() => setTurn(t)}
                    style={{
                      padding: '0.625rem 0.25rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 600, fontSize: '0.8rem',
                      border: `2px solid ${turn === t ? 'var(--color-text-primary)' : 'var(--color-border)'}`,
                      backgroundColor: turn === t ? 'var(--color-text-primary)' : 'var(--color-background)',
                      color: turn === t ? '#fff' : 'var(--color-text-muted)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t === 'Mediodía' ? '☀️' : t === 'Tarde' ? '🌤' : '🌙'} {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Date + Department */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Fecha</label>
                <input 
                  type="date" 
                  required 
                  min={todayStr}
                  max={maxDateStr}
                  value={dateStr} 
                  onChange={e => setDateStr(e.target.value)} 
                />
              </div>
              <div>
                <label className="form-label">Depto</label>
                <select value={department} onChange={e => setDepartment(e.target.value as Department)}>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full" style={{ padding: '1rem', marginTop: '0.25rem', fontSize: '1rem', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNoticeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{
                backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500,
              }}>{error}</div>
            )}
            <div>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Mensaje para el edificio</label>
              <textarea
                value={noticeMessage} onChange={e => setNoticeMessage(e.target.value)}
                placeholder="Ej: El plomero viene al 3A hoy a la tarde..."
                required rows={4}
                style={{
                  width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)', fontSize: '0.9rem',
                  fontFamily: 'inherit', resize: 'vertical'
                }}
              />
            </div>
            <div>
              <label className="form-label">Fecha de expiración (opcional)</label>
              <input 
                type="date" 
                min={todayStr}
                value={noticeExpiresAt} 
                onChange={e => setNoticeExpiresAt(e.target.value)} 
              />
            </div>
            <button type="submit" disabled={isSubmitting || !noticeMessage.trim()} className="btn w-full" style={{ padding: '1rem', marginTop: '0.25rem', fontSize: '1rem', backgroundColor: 'var(--color-text-primary)', color: '#fff', opacity: (isSubmitting || !noticeMessage.trim()) ? 0.7 : 1 }}>
              {isSubmitting ? 'Publicando...' : 'Publicar Aviso'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReservationModal;
