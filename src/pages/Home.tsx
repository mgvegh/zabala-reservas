import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Header from '../components/Header';
import CalendarGrid from '../components/CalendarGrid';
import ReservationModal from '../components/ReservationModal';
import UpcomingList from '../components/UpcomingList';

const Home: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setIsModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '6rem' }}>
      <Header />

      <main className="container animate-fade-in" style={{ maxWidth: '860px', paddingTop: '1.5rem' }}>

        {/* Calendar nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <h2 style={{
            fontSize: '1.3rem', fontWeight: 800,
            textTransform: 'capitalize', letterSpacing: '-0.03em',
          }}>
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h2>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="btn btn-outline"
              style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="btn btn-outline"
              style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span className="badge badge-parrilla">🔥 Parrilla</span>
          <span className="badge badge-sum">🏛 SUM</span>
          <span className="badge badge-blocked">🔒 Bloqueado</span>
        </div>

        <CalendarGrid currentMonth={currentMonth} onDayClick={handleDayClick} />

        <hr className="divider" />

        <div>
          <h3 className="section-title">Próximas Reservas</h3>
          <UpcomingList />
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={handleOpenNew}
        title="Nueva Reserva"
        style={{
          position: 'fixed', bottom: '1.75rem', right: '1.75rem',
          width: '58px', height: '58px', borderRadius: '50%',
          backgroundColor: 'var(--color-text-primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)', zIndex: 30,
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {isModalOpen && (
        <ReservationModal initialDate={selectedDate} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Home;
