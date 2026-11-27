import { useState, type FormEvent } from 'react';
import { CalendarDays, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './components';
import { money, priceSuffix, rentalPeriods, rentalQuote } from './data';
import { useStore } from './store';
import type { Listing } from './types';

export function RentalRequest({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const { startConversation, sendMessage, notify, user } = useStore();
  const navigate = useNavigate();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const period = rentalPeriods[listing.rentalPeriod || 'day'];
  const quote = rentalQuote(start, end, listing.price, listing.rentalPeriod);
  const formatDate = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString('pt-BR');
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const nextDate = new Date(`${start || today}T12:00:00`); nextDate.setDate(nextDate.getDate() + 1);
  const minReturn = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!quote || start < today || !user.verified || listing.status !== 'Disponível') { setError('Escolha uma retirada a partir de hoje e uma devolução posterior.'); return; }
    startConversation(listing.id);
    sendMessage(listing.id, `Olá! Gostaria de solicitar o aluguel de ${listing.title}. Retirada: ${formatDate(start)}. Devolução: ${formatDate(end)}. Período: ${quote.days} dia(s), ${quote.units} bloco(s) de ${period.days} dia(s) a ${money(listing.price)}${priceSuffix(listing)}. Total estimado: ${money(quote.total)}. Aguardo confirmação de disponibilidade. ${message.trim()}`);
    notify('Solicitação de aluguel adicionada à conversa simulada.');
    navigate(`/mensagens?anuncio=${listing.id}`);
  }
  return <Modal title="Por quanto tempo você precisa?" onClose={onClose}><form className="modal-content form-stack" onSubmit={submit}>
    <p>Escolha as datas e combine a retirada e a devolução com {listing.owner.split(' ')[0]}.</p>
    <div className="rental-rate"><CalendarDays size={21} /><span><b>{money(listing.price)}{priceSuffix(listing)}</b><small>{period.days === 1 ? 'Uma diária por dia de uso' : `Cobrança por blocos de ${period.days} dias`}</small></span></div>
    <div className="form-grid"><label className="field">Data de retirada<input autoFocus required type="date" min={today} value={start} onChange={e => { setStart(e.target.value); setError(''); }} /></label><label className="field">Data de devolução<input required type="date" min={minReturn} value={end} onChange={e => { setEnd(e.target.value); setError(''); }} /></label></div>
    {start && end && !quote && <p role="alert" className="form-error">A devolução deve acontecer depois da retirada.</p>}
    {quote && <div className="rental-estimate"><div><span>{quote.days} {quote.days === 1 ? 'dia de uso' : 'dias de uso'} · {quote.units} × {money(listing.price)}</span><small>{period.days === 1 ? 'O dia da devolução encerra o período de uso.' : `${quote.units} bloco(s) de ${period.days} dias, com arredondamento para cima.`}</small></div><div><b>Total estimado</b><strong>{money(quote.total)}</strong></div></div>}
    <label className="field">Mensagem (opcional)<textarea rows={3} maxLength={1000} value={message} onChange={e => setMessage(e.target.value)} placeholder="Conte para que precisa do item ou sugira um local de retirada..." /></label>
    <div className="safe-note"><ShieldCheck size={20} /><p>Solicitação simulada, sujeita à confirmação do anunciante. Nenhuma reserva ou cobrança é feita agora.</p></div>
    {error && <p role="alert" className="form-error">{error}</p>}
    <button type="submit" className="button primary full" disabled={!quote}>Solicitar aluguel no chat</button>
  </form></Modal>;
}
