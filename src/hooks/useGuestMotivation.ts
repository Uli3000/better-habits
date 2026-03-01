import { useState, useEffect } from 'react';
import type { MotivationItem } from '@/features/motivation/types/motivation';
import { v4Style } from '@/lib/guestUtils';

const KEY = 'guest_motivation';

function loadJSON<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}

export function useGuestMotivation() {
  const [items, setItems] = useState<MotivationItem[]>(() => loadJSON<MotivationItem[]>(KEY, []));

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const addQuote = async (content: string, author?: string) => {
    setItems(prev => [{ id: v4Style(), type: 'quote', content, author, createdAt: new Date().toISOString() }, ...prev]);
  };

  const addImage = async (url: string) => {
    setItems(prev => [{ id: v4Style(), type: 'image', content: url, createdAt: new Date().toISOString() }, ...prev]);
  };

  const deleteItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return { items, addQuote, addImage, deleteItem };
}
