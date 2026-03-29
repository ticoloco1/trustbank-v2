'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  label: string;
  price: number;
  type: 'slug' | 'cv' | 'boost' | 'other';
}

interface CartCtx {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  total: number;
}

const Ctx = createContext<CartCtx>({
  items: [], add: () => {}, remove: () => {}, clear: () => {},
  isOpen: false, open: () => {}, close: () => {}, total: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const add = (item: CartItem) => {
    setItems(prev => prev.find(i => i.id === item.id) ? prev : [...prev, item]);
  };
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const clear = () => setItems([]);
  const total = items.reduce((a, b) => a + b.price, 0);

  return (
    <Ctx.Provider value={{ items, add, remove, clear, isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false), total }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => useContext(Ctx);
