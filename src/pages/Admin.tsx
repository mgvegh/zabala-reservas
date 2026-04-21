import React, { useState } from 'react';
import { useDataStore } from '../context/DataStore';
import type { Space } from '../types';
import { Trash2, ArrowLeft, Megaphone, Lock, PlusCircle, ShieldAlert, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';


const BLOCK_SPACES: (Space | 'Ambos')[] = ['Parrilla', 'SUM', 'Ambos'];
type AdminTab = 'notices' | 'blocks' | 'reservations';

const Admin: React.FC = () => {
  // ── ALL hooks must be at the top, unconditionally ──
  const { notices, addNotice, deleteNotice, blocks, addBlock, removeBlock, reservations, cancelReservation } = useDataStore();

  // Auth state
  const [isAuth, setIsAuth] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);

  // Admin state
  const [tab, setTab] = useState<AdminTab>('notices');
  const [newNotice, setNewNotice] = useState('');
  const [noticeExpiresAt, setNoticeExpiresAt] = useState('');
  const [blockSpace, setBlockSpace] = useState<Space | 'Ambos'>('Parrilla');
  const [blockDateFrom, setBlockDateFrom] = useState('');
  const [blockDateTo, setBlockDateTo] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockSuccess, setBlockSuccess] = useState(false);

  // ── Handlers ──
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwInput === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsAuth(true);
      setPwError(false);
    } else {
      setPwError(true);
      setPwInput('');
    }
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.trim() || !noticeExpiresAt) return;
    try {
      await addNotice(newNotice.trim(), noticeExpiresAt, true);
      setNewNotice('');
      setNoticeExpiresAt('');
    } catch {
      alert('Error publicando aviso');
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDateFrom || !blockDateTo || !blockReason.trim()) return;
    if (blockDateTo < blockDateFrom) {
      alert('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }
    await addBlock({ space: blockSpace, dateFrom: blockDateFrom, dateTo: blockDateTo, reason: blockReason.trim() });
    setBlockDateFrom('');
    setBlockDateTo('');
    setBlockReason('');
    setBlockSuccess(true);
    setTimeout(() => setBlockSuccess(false), 2500);
  };

  const tabStyle = (active: boolean) => ({
    flex: 1, padding: '0.6rem', fontWeight: 700, fontSize: '0.85rem',
    borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
    backgroundColor: active ? 'var(--color-text-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--color-text-muted)',
    transition: 'all 0.2s',
  });

  // ── Password Gate (conditional render, not conditional hooks) ──
  if (!isAuth) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-text-primary)', padding: '1.5rem',
      }}>
        <div className="animate-slide-up" style={{
          backgroundColor: '#fff', borderRadius: 'var(--radius-2xl)',
          padding: '2rem', width: '100%', maxWidth: '360px',
          boxShadow: 'var(--shadow-xl)', textAlign: 'center',
        }}>
          <div style={{
            width: '52px', height: '52px', backgroundColor: '#fef3c7',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <ShieldAlert size={26} style={{ color: '#d97706' }} />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
            Administración
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Zabala 2664 · Acceso restringido
          </p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="password"
              placeholder="Contraseña"
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError(false); }}
              autoFocus
              style={{
                textAlign: 'center', letterSpacing: '0.15em', fontSize: '1.1rem',
                borderColor: pwError ? 'var(--color-parrilla)' : undefined,
              }}
            />
            {pwError && (
              <p style={{ color: 'var(--color-parrilla)', fontSize: '0.8rem', fontWeight: 600 }}>
                Contraseña incorrecta. Intentá de nuevo.
              </p>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }}>
              <Lock size={15} /> Ingresar
            </button>
          </form>
          <Link to="/" style={{ display: 'block', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // ── Admin Content ──
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-text-primary)', padding: '1.5rem 1rem 1rem', color: '#fff' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Link to="/" style={{
            color: 'rgba(255,255,255,0.7)', display: 'inline-flex',
            alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          >
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginTop: '0.5rem' }}>
            Panel de Administración
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.2rem' }}>
            Zabala 2664 · Uso interno
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', backgroundColor: 'var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: '4px', marginBottom: '1.5rem',
        }}>
          <button style={tabStyle(tab === 'notices')} onClick={() => setTab('notices')}>
            <Megaphone size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
            Avisos
          </button>
          <button style={tabStyle(tab === 'blocks')} onClick={() => setTab('blocks')}>
            <Lock size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
            Bloqueos
          </button>
          <button style={tabStyle(tab === 'reservations')} onClick={() => setTab('reservations')}>
            <Calendar size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
            Reservas
          </button>
        </div>

        {/* NOTICES TAB */}
        {tab === 'notices' && (
          <div className="animate-fade-in">
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Publicar nuevo aviso</h2>
              <form onSubmit={handleAddNotice} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Mensaje</label>
                  <textarea
                    value={newNotice}
                    onChange={e => setNewNotice(e.target.value)}
                    placeholder="Ej: El SUM estará en mantenimiento el viernes..."
                    rows={3} required
                  />
                </div>
                <div>
                  <label className="form-label">Fecha de expiración</label>
                  <input
                    type="date"
                    required
                    value={noticeExpiresAt}
                    onChange={e => setNoticeExpiresAt(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={!newNotice.trim() || !noticeExpiresAt} className="btn btn-primary" style={{ alignSelf: 'flex-start', opacity: (!newNotice.trim() || !noticeExpiresAt) ? 0.6 : 1 }}>
                  <PlusCircle size={16} /> Publicar Aviso
                </button>
              </form>
            </div>

            <h3 className="section-title">Avisos activos ({notices.length})</h3>
            {notices.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No hay avisos publicados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {notices.map(n => (
                  <div key={n.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.875rem 1rem' }}>
                    <p style={{ flex: 1, fontSize: '0.875rem', margin: 0 }}>{n.message}</p>
                    <button onClick={() => deleteNotice(n.id)} style={{ color: 'var(--color-parrilla)', flexShrink: 0, padding: '0.2rem' }} title="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BLOCKS TAB */}
        {tab === 'blocks' && (
          <div className="animate-fade-in">
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Bloquear espacio en fechas</h2>
              {blockSuccess && (
                <div style={{
                  backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
                  color: '#15803d', borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem', marginBottom: '1rem', fontWeight: 600, fontSize: '0.875rem',
                }}>
                  ✅ Bloqueo registrado correctamente.
                </div>
              )}
              <form onSubmit={handleAddBlock} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Espacio a bloquear</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
                    {BLOCK_SPACES.map(s => (
                      <button key={s} type="button" onClick={() => setBlockSpace(s)} style={{
                        padding: '0.6rem', borderRadius: 'var(--radius-md)',
                        fontWeight: 700, fontSize: '0.8rem',
                        border: `2px solid ${blockSpace === s ? '#f59e0b' : 'var(--color-border)'}`,
                        backgroundColor: blockSpace === s ? '#fffbeb' : 'var(--color-background)',
                        color: blockSpace === s ? '#78350f' : 'var(--color-text-muted)',
                        transition: 'all 0.15s',
                      }}>
                        {s === 'Ambos' ? '🔒 Ambos' : s === 'Parrilla' ? '🔥 Parrilla' : '🏛 SUM'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Desde</label>
                    <input type="date" required value={blockDateFrom}
                      onChange={e => {
                        setBlockDateFrom(e.target.value);
                        if (!blockDateTo || blockDateTo < e.target.value) setBlockDateTo(e.target.value);
                      }}
                    />
                  </div>
                  <div>
                    <label className="form-label">Hasta</label>
                    <input type="date" required value={blockDateTo} min={blockDateFrom}
                      onChange={e => setBlockDateTo(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Motivo del bloqueo</label>
                  <input type="text" required value={blockReason}
                    onChange={e => setBlockReason(e.target.value)}
                    placeholder="Ej: Mantenimiento, evento privado, obras..."
                  />
                </div>
                <button type="submit" className="btn" style={{ alignSelf: 'flex-start', backgroundColor: '#f59e0b', color: '#fff' }}>
                  <Lock size={15} /> Registrar Bloqueo
                </button>
              </form>
            </div>

            <h3 className="section-title">Bloqueos activos ({blocks.length})</h3>
            {blocks.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No hay bloqueos registrados.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[...blocks].sort((a, b) => a.dateFrom.localeCompare(b.dateFrom)).map(b => (
                  <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.875rem 1rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                      backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Lock size={16} style={{ color: '#d97706' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                        {b.space} ·{' '}
                        {b.dateFrom === b.dateTo
                          ? format(parseISO(b.dateFrom), "d 'de' MMMM yyyy", { locale: es })
                          : `${format(parseISO(b.dateFrom), "d MMM", { locale: es })} → ${format(parseISO(b.dateTo), "d 'de' MMMM yyyy", { locale: es })}`
                        }
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                        {b.reason}
                      </div>
                    </div>
                    <button onClick={() => removeBlock(b.id)} style={{ color: 'var(--color-parrilla)', padding: '0.2rem', flexShrink: 0 }} title="Eliminar bloqueo">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RESERVATIONS TAB */}
        {tab === 'reservations' && (
          <div className="animate-fade-in">
            <h3 className="section-title">Todas las reservas ({reservations.length})</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Las reservas se ordenan comenzando por la más lejana (futuro) hasta la más antigua.
            </p>
            {reservations.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No hay reservas registradas en el sistema.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[...reservations].sort((a, b) => b.dateStr.localeCompare(a.dateStr)).map(r => (
                  <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.875rem 1rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                      backgroundColor: r.space === 'Parrilla' ? '#fee2e2' : '#dcfce7',
                      color: r.space === 'Parrilla' ? '#b91c1c' : '#15803d',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontWeight: 800, fontSize: '0.8rem'
                    }}>
                      {r.space === 'Parrilla' ? '🔥' : '🏛'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                        {format(parseISO(r.dateStr), "EEEE d 'de' MMMM", { locale: es })} · {r.turn}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                        {r.space} · Depto {r.department}
                      </div>
                    </div>
                    <button onClick={async () => {
                      if (window.confirm(`¿Estás seguro que querés eliminar la reserva del depto ${r.department}?`)) {
                        await cancelReservation(r.id);
                      }
                    }} style={{ color: 'var(--color-parrilla)', padding: '0.2rem', flexShrink: 0 }} title="Eliminar reserva">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
