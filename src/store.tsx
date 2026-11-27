import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { seedConversations, seedListings } from './data';
import type { Conversation, DemoUser, Listing, Message } from './types';

const STORAGE_KEY = 'republik-demo-v1';
interface Data { schemaVersion: number; listings: Listing[]; favorites: string[]; conversations: Conversation[]; user: DemoUser }
const initial: Data = { schemaVersion: 2, listings: seedListings, favorites: ['moradia-2', 'item-3'], conversations: seedConversations, user: { name: 'Marina Silva', email: 'marina.silva@usp.br', verified: false } };
function readData(): Data {
  try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); if (value && Array.isArray(value.listings) && Array.isArray(value.favorites) && Array.isArray(value.conversations) && typeof value.user?.name === 'string') { if ((value.schemaVersion || 1) < 2) return { ...value, schemaVersion: 2, listings: [...seedListings.filter(l => l.transaction === 'rent' && !value.listings.some((old: Listing) => old.id === l.id)), ...value.listings] }; return value; } } catch { /* Start with mock data when storage is unavailable. */ }
  return initial;
}
interface Store extends Data {
  toast: string; notify: (text: string) => void; toggleFavorite: (id: string) => void;
  saveListing: (listing: Listing) => void; updateStatus: (id: string, status: Listing['status']) => void;
  verifyUser: (email: string) => void; reset: () => void;
  sendMessage: (listingId: string, text: string) => void; startConversation: (listingId: string) => void;
}
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(readData);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  function notify(text: string) { setToast(text); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 4000); }
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { notify('O armazenamento está cheio. As alterações desta sessão não serão mantidas ao recarregar.'); } }, [data]);
  useEffect(() => () => { clearTimeout(toastTimer.current); replyTimers.current.forEach(clearTimeout); }, []);
  function addMessage(listingId: string, text: string, sender: Message['sender']) {
    const message: Message = { id: crypto.randomUUID(), text, sender, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    setData(d => { const found = d.conversations.some(c => c.listingId === listingId); return { ...d, conversations: found ? d.conversations.map(c => c.listingId === listingId ? { ...c, messages: [...c.messages, message] } : c) : [...d.conversations, { listingId, messages: [message] }] }; });
  }
  function startConversation(listingId: string) {
    setData(d => d.conversations.some(c => c.listingId === listingId) ? d : { ...d, conversations: [...d.conversations, { listingId, messages: [{ id: crypto.randomUUID(), sender: 'them', text: 'Oi! Que bom receber seu interesse. O anúncio está disponível. Como posso ajudar?', time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }] }] });
  }
  const value: Store = { ...data, toast, notify,
    toggleFavorite(id) { setData(d => ({ ...d, favorites: d.favorites.includes(id) ? d.favorites.filter(f => f !== id) : [...d.favorites, id] })); },
    saveListing(listing) { setData(d => ({ ...d, listings: d.listings.some(l => l.id === listing.id) ? d.listings.map(l => l.id === listing.id ? listing : l) : [listing, ...d.listings] })); },
    updateStatus(id, status) { setData(d => ({ ...d, listings: d.listings.map(l => l.id === id ? { ...l, status } : l) })); notify('Status do anúncio atualizado.'); },
    verifyUser(email) { setData(d => ({ ...d, user: { ...d.user, email, verified: true } })); notify('Vínculo confirmado! Bem-vinda à comunidade.'); },
    reset() { replyTimers.current.forEach(clearTimeout); setData(initial); try { Object.keys(localStorage).filter(k => k.startsWith('republik-draft-')).forEach(k => localStorage.removeItem(k)); } catch { /* Optional draft. */ } notify('Demonstração reiniciada.'); },
    startConversation,
    sendMessage(listingId, text) {
      if (!text.trim()) return;
      addMessage(listingId, text.trim(), 'me');
      const reply = /solicitar o aluguel/i.test(text) ? 'Recebi sua solicitação de aluguel! Vou conferir a disponibilidade para essas datas. Podemos combinar a retirada e a devolução por aqui. A reserva ainda depende da nossa confirmação. 😊' : /visita|agend/i.test(text) ? 'Perfeito! Recebi sua sugestão de visita. Podemos combinar os detalhes por aqui. 🏡' : /proposta|ofere|R\$/i.test(text) ? 'Recebi sua proposta! Vou avaliar o valor e já te retorno. Podemos combinar a retirada no campus.' : 'Combinado! Está disponível, sim. Podemos conversar e combinar um horário no campus. Qual período funciona melhor para você?';
      replyTimers.current.push(setTimeout(() => addMessage(listingId, reply, 'them'), 1100));
    },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useStore() { const value = useContext(Context); if (!value) throw new Error('StoreProvider ausente'); return value; }
