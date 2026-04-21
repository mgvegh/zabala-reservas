import React from 'react';
import { useDataStore } from '../context/DataStore';
import { Megaphone, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { notices } = useDataStore();

  return (
    <header style={{
      backgroundColor: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      padding: '1.25rem 1rem 1rem',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(130deg, var(--color-parrilla) 0%, #a855f7 50%, var(--color-sum) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
              margin: 0,
            }}>
              Zabala 2664
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500, marginTop: '0.2rem' }}>
              Consorcio · Espacios Comunes
            </p>
          </div>

          <Link to="/admin" title="Administración" style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.75rem', fontWeight: 600,
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            padding: '0.4rem 0.75rem',
            transition: 'all 0.2s',
            backgroundColor: 'var(--color-surface)',
          }}>
            <Settings size={14} />
            Admin
          </Link>
        </div>

        {/* Notices Banner */}
        <div style={{
          borderRadius: 'var(--radius-lg)',
          padding: '0.75rem 1rem',
          border: notices.length > 0 ? '1px solid #fed7aa' : '1px dashed var(--color-border)',
          backgroundColor: notices.length > 0 ? '#fff7ed' : 'var(--color-surface)',
          transition: 'all 0.3s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: notices.length > 0 ? '0.5rem' : 0 }}>
            <Megaphone size={14} style={{ color: notices.length > 0 ? '#ea580c' : 'var(--color-text-muted)', flexShrink: 0 }} />
            <span style={{
              fontSize: '0.75rem', fontWeight: 700,
              color: notices.length > 0 ? '#ea580c' : 'var(--color-text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              Avisos
            </span>
          </div>

          {notices.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {notices.map(n => (
                <li key={n.id} style={{ 
                  fontSize: '0.875rem', color: n.isAdmin ? '#9f1239' : '#9a3412', 
                  fontWeight: n.isAdmin ? 700 : 500, paddingLeft: '1.5rem',
                  display: 'flex', gap: '0.4rem', alignItems: 'flex-start'
                }}>
                  <span style={{ color: n.isAdmin ? '#e11d48' : '#f97316' }}>{n.isAdmin ? '🚨' : '•'}</span>
                  <span>{n.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', paddingLeft: '1.5rem' }}>
              No hay comunicados activos.
            </p>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
