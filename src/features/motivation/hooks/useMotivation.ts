import { useState, useEffect, useCallback } from 'react';
import type { MotivationItem } from '../types/motivation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useMotivation() {
  const { user } = useAuth();
  const [items, setItems] = useState<MotivationItem[]>([]);

  const fetchItems = useCallback(async () => {
    if (!user) { setItems([]); return; }
    const { data } = await supabase.from('motivation_items').select('*').order('created_at', { ascending: false });
    if (data) {
      setItems(data.map(d => ({
        id: d.id,
        type: d.type as 'quote' | 'image',
        content: d.content,
        author: d.author ?? undefined,
        createdAt: d.created_at,
      })));
    }
  }, [user]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addQuote = async (content: string, author?: string) => {
    if (!user) return;
    const { data } = await supabase.from('motivation_items').insert({
      user_id: user.id, type: 'quote', content, author: author || null,
    }).select().single();
    if (data) {
      setItems(prev => [{ id: data.id, type: 'quote', content: data.content, author: data.author ?? undefined, createdAt: data.created_at }, ...prev]);
    }
  };

  const addImage = async (url: string) => {
    if (!user) return;
    const { data } = await supabase.from('motivation_items').insert({
      user_id: user.id, type: 'image', content: url,
    }).select().single();
    if (data) {
      setItems(prev => [{ id: data.id, type: 'image', content: data.content, createdAt: data.created_at }, ...prev]);
    }
  };

  const deleteItem = async (id: string) => {
    await supabase.from('motivation_items').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return { items, addQuote, addImage, deleteItem };
}
