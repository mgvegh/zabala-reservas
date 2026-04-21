import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Reservation, Notice, SpaceBlock } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

/** Returns true if dateStr falls within [dateFrom, dateTo] */
const isInRange = (dateStr: string, dateFrom: string, dateTo: string) =>
  dateStr >= dateFrom && dateStr <= dateTo;

interface DataStoreContextProps {
  reservations: Reservation[];
  notices: Notice[];
  blocks: SpaceBlock[];
  isLoading: boolean;
  addReservation: (data: Omit<Reservation, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  cancelReservation: (id: string) => Promise<void>;
  addNotice: (message: string) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  addBlock: (data: Omit<SpaceBlock, 'id' | 'createdAt'>) => Promise<void>;
  removeBlock: (id: string) => Promise<void>;
}

const DataStoreContext = createContext<DataStoreContextProps | undefined>(undefined);

export const DataStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [blocks, setBlocks] = useState<SpaceBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let pending = 3;
    const checkLoading = () => { pending -= 1; if (pending <= 0) setIsLoading(false); };

    const unsubRes = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reservation[];
      setReservations(data);
      checkLoading();
    });

    const unsubNotices = onSnapshot(query(collection(db, 'notices'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notice[];
      setNotices(data);
      checkLoading();
    });

    const unsubBlocks = onSnapshot(collection(db, 'blocks'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SpaceBlock[];
      setBlocks(data);
      checkLoading();
    });

    return () => { unsubRes(); unsubNotices(); unsubBlocks(); };
  }, []);

  const addReservation = async (data: Omit<Reservation, 'id' | 'createdAt'>) => {
    const activeBlock = blocks.find(
      b => isInRange(data.dateStr, b.dateFrom, b.dateTo) && (b.space === data.space || b.space === 'Ambos')
    );
    if (activeBlock) {
      return { success: false, error: `El espacio está bloqueado por administración: "${activeBlock.reason}"` };
    }

    const isOccupied = reservations.some(
      r => r.space === data.space && r.dateStr === data.dateStr && r.turn === data.turn
    );
    if (isOccupied) {
      return { success: false, error: 'El turno ya se encuentra ocupado. Por favor seleccioná otro turno o espacio.' };
    }

    await addDoc(collection(db, 'reservations'), { ...data, createdAt: Date.now() });
    return { success: true };
  };

  const cancelReservation = async (id: string) => await deleteDoc(doc(db, 'reservations', id));
  
  const addNotice = async (message: string) => { 
    await addDoc(collection(db, 'notices'), { message, createdAt: Date.now() }); 
  };
  
  const deleteNotice = async (id: string) => await deleteDoc(doc(db, 'notices', id));
  
  const addBlock = async (data: Omit<SpaceBlock, 'id' | 'createdAt'>) => { 
    await addDoc(collection(db, 'blocks'), { ...data, createdAt: Date.now() }); 
  };
  
  const removeBlock = async (id: string) => await deleteDoc(doc(db, 'blocks', id));

  return (
    <DataStoreContext.Provider value={{
      reservations, notices, blocks, isLoading,
      addReservation, cancelReservation,
      addNotice, deleteNotice,
      addBlock, removeBlock,
    }}>
      {children}
    </DataStoreContext.Provider>
  );
};

export const useDataStore = () => {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error('useDataStore must be used within a DataStoreProvider');
  return ctx;
};
