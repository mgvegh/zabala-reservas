import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
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
  myToken: string;
  addReservation: (data: Omit<Reservation, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  cancelReservation: (id: string) => Promise<void>;
  addNotice: (message: string, expiresAt: string, isAdmin?: boolean) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  addBlock: (data: Omit<SpaceBlock, 'id' | 'createdAt'>) => Promise<void>;
  removeBlock: (id: string) => Promise<void>;
}

const DataStoreContext = createContext<DataStoreContextProps | undefined>(undefined);

const getDeviceToken = () => {
  let token = localStorage.getItem('zabala_device_token');
  if (!token) {
    token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('zabala_device_token', token);
  }
  return token;
};

export const DataStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const myToken = getDeviceToken();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [blocks, setBlocks] = useState<SpaceBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let pending = 3;
    const checkLoading = () => { pending -= 1; if (pending <= 0) setIsLoading(false); };

    const unsubRes = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reservation[];
      
      const activeRes = data.filter(r => {
        if (r.dateStr < todayStr) {
          // Lazy background cleanup for old reservations
          deleteDoc(doc(db, 'reservations', r.id)).catch(() => {});
          return false;
        }
        return true;
      });

      setReservations(activeRes);
      checkLoading();
    });

    const unsubNotices = onSnapshot(query(collection(db, 'notices'), orderBy('createdAt', 'desc')), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notice[];
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const activeNotices = data.filter(n => !n.expiresAt || n.expiresAt >= todayStr);
      setNotices(activeNotices);
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

    // No hacer await de addDoc: Firebase actualizará localmente al instante (optimista) y enviará al server de fondo.
    addDoc(collection(db, 'reservations'), { ...data, deviceToken: myToken, createdAt: Date.now() }).catch(console.error);
    return { success: true };
  };

  const cancelReservation = async (id: string) => { deleteDoc(doc(db, 'reservations', id)).catch(console.error); };
  
  const addNotice = async (message: string, expiresAt: string, isAdmin: boolean = false) => { 
    addDoc(collection(db, 'notices'), { message, expiresAt, isAdmin, createdAt: Date.now(), deviceToken: myToken }).catch(console.error); 
  };
  
  const deleteNotice = async (id: string) => { deleteDoc(doc(db, 'notices', id)).catch(console.error); };
  
  const addBlock = async (data: Omit<SpaceBlock, 'id' | 'createdAt'>) => { 
    addDoc(collection(db, 'blocks'), { ...data, createdAt: Date.now() }).catch(console.error); 
  };
  
  const removeBlock = async (id: string) => { deleteDoc(doc(db, 'blocks', id)).catch(console.error); };

  return (
    <DataStoreContext.Provider value={{
      reservations, notices, blocks, isLoading, myToken,
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
