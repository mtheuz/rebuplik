import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { BadgeCheck, Heart, MapPin, Star, X, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isRental, money, priceSuffix, total } from './data';
import { useStore } from './store';
import type { Listing } from './types';

export function Brand() { return <span className="brand">republik<span className="brand-dot">.</span></span>; }
export function Avatar({ initials, large = false }: { initials: string; large?: boolean }) { return <span className={`avatar${large ? ' large' : ''}`}>{initials}</span>; }
export function Verified({ university = '', label }: { university?: string; label?: string }) { return <span className="verified"><BadgeCheck size={14} />{label || university || 'Verificado'}</span>; }
export function Photo({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return <img className={className} src={src} alt={alt} loading="lazy" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/image-placeholder.svg'; }} />;
}
export function FavoriteButton({ id, withLabel = false }: { id: string; withLabel?: boolean }) {
  const { favorites, toggleFavorite, notify } = useStore();
  const selected = favorites.includes(id);
  return <button className={`${withLabel ? 'button secondary' : 'icon-button favorite'}${selected ? ' saved' : ''}`} aria-label={selected ? 'Remover dos favoritos' : 'Salvar nos favoritos'} aria-pressed={selected} onClick={() => { toggleFavorite(id); notify(selected ? 'Anúncio removido dos favoritos.' : 'Salvo! Encontre o anúncio em Meu Espaço.'); }}><Heart size={18} fill={selected ? 'currentColor' : 'none'} />{withLabel && (selected ? 'Salvo' : 'Salvar')}</button>;
}
export function ListingCard({ listing }: { listing: Listing }) {
  const home = listing.kind === 'housing';
  return <article className="listing-card">
    <div className={`card-photo ${home ? '' : 'product-photo'}`}>
      <Link to={`/anuncio/${listing.id}`} aria-label={`Ver ${listing.title}`} tabIndex={-1}><Photo src={listing.images[0]} alt={listing.title} /></Link>
      <span className={`photo-badge ${isRental(listing) ? 'rental-badge' : listing.badge.includes('imediata') || listing.badge.includes('Urgente') ? 'coral' : ''}`}>{listing.status === 'Disponível' ? isRental(listing) ? 'Para alugar' : listing.badge : listing.status}</span>
      <FavoriteButton id={listing.id} />
    </div>
    <div className="card-body">
      <div className="card-title-row"><h3><Link to={`/anuncio/${listing.id}`}>{listing.title}</Link></h3>{home && <span className="rating"><Star size={13} fill="currentColor" />{listing.rating}</span>}</div>
      <p className="card-location"><MapPin size={13} />{listing.neighborhood} · {listing.distance} m da {listing.university}</p>
      <div className="card-price"><strong>{money(total(listing))}</strong>{priceSuffix(listing) && <span>{priceSuffix(listing)}</span>}{home ? <small>com contas</small> : <small>{isRental(listing) ? 'Aluguel de item' : listing.tags[0]}</small>}</div>
      <div className="card-person"><span><Avatar initials={listing.initials} /><span className="host-name">{listing.owner.split(' ')[0]}<small>{listing.course}</small></span></span><Verified university={listing.university} /></div>
    </div>
  </article>;
}
export function EmptyState({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><ImageOff size={30} /></span><h2>{title}</h2><p>{description}</p>{children}</div>;
}
export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { dialog?.close(); document.body.style.overflow = previous; }; }, []);
  return createPortal(<dialog ref={ref} className={`modal ${wide ? 'wide-modal' : ''}`} aria-labelledby={id} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}><div className="modal-header"><h2 id={id}>{title}</h2><button className="icon-button" aria-label="Fechar" onClick={onClose}><X size={21} /></button></div>{children}</dialog>, document.body);
}
