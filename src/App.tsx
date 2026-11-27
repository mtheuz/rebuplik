import { useEffect, useState } from 'react';
import { Bell, BadgeCheck, ChevronDown, Heart, House, LogIn, MessageCircle, Plus, Search, ShoppingBag, UserRound, Check, RotateCcw } from 'lucide-react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Brand, Avatar, Modal } from './components';
import { useStore } from './store';
import { Explore } from './pages/Explore';
import { Details } from './pages/Details';
import { Dashboard } from './pages/Dashboard';
import { CreateListing } from './pages/CreateListing';
import { Messages } from './pages/Messages';
import { Verification } from './pages/Verification';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); const titles: Record<string, string> = { '/': 'Moradia & Vagas', '/desapego': 'Desapego Universitário', '/meu-espaco': 'Meu Espaço', '/mensagens': 'Mensagens', '/anunciar': 'Criar anúncio', '/verificar': 'Verificação estudantil' }; document.title = `${titles[pathname] || 'Anúncio'} — Republik`; }, [pathname]);
  return null;
}
function Header() {
  const { user, favorites } = useStore();
  const location = useLocation();
  const market = location.pathname === '/desapego';
  return <header className="site-header"><div className="nav-inner">
    <Link to="/" className="brand-link" aria-label="Republik, início"><Brand /></Link>
    <nav className="mode-switch" aria-label="Navegação principal"><Link to="/" className={!market && location.pathname === '/' ? 'active' : ''}><House size={16} />Moradia & Vagas</Link><Link to="/desapego" className={market ? 'active' : ''}><ShoppingBag size={16} />Desapego</Link><Link to="/?focus=search" className="nav-search" aria-label="Buscar universidade"><Search size={16} /><span>Seu campus</span></Link></nav>
    <div className="nav-actions"><Link to="/anunciar" className="button outline small"><Plus size={17} /><span>Anunciar</span></Link><Link to="/meu-espaco?aba=salvos" className="icon-button desktop-favorite" aria-label={`Favoritos (${favorites.length})`}><Heart size={19} /></Link><Link to="/mensagens" className="icon-button notification" aria-label="Abrir mensagens"><Bell size={19} /><span /></Link><Link to="/meu-espaco" className="profile-pill"><Avatar initials="MS" /><span><b>{user.name.split(' ')[0]} Silva</b><small className={user.verified ? 'verified-text' : ''}>{user.verified ? <><BadgeCheck size={11} />Estudante verificada</> : 'Conta demonstração'}</small></span><ChevronDown size={14} /></Link></div>
  </div></header>;
}
function MobileNavigation() {
  return <nav className="mobile-nav" aria-label="Navegação mobile"><NavLink to="/" end><House size={21} /><span>Moradia</span></NavLink><NavLink to="/desapego"><ShoppingBag size={21} /><span>Desapego</span></NavLink><NavLink to="/anunciar"><Plus size={23} /><span>Anunciar</span></NavLink><NavLink to="/mensagens"><MessageCircle size={21} /><span>Mensagens</span></NavLink><NavLink to="/meu-espaco"><UserRound size={21} /><span>Meu Espaço</span></NavLink></nav>;
}
function Footer() {
  const [info, setInfo] = useState('');
  const { reset } = useStore();
  const navigate = useNavigate();
  return <><footer className="site-footer"><div className="footer-top"><div><Link to="/" aria-label="Republik, início"><Brand /></Link><p>Criada por estudantes, para estudantes.<br />Seu lugar e suas próximas histórias começam aqui.</p></div><div className="footer-links"><button onClick={() => setInfo('Sobre a Republik')}>Sobre a Republik</button><button onClick={() => setInfo('Como funciona')}>Como funciona</button><button onClick={() => setInfo('Central de ajuda')}>Preciso de ajuda</button></div></div><div className="footer-bottom"><span>© 2026 Republik · Feita para a vida universitária.</span><span className="demo-label"><span />Protótipo interativo · Dados de demonstração</span><button className="reset-link" onClick={() => setInfo('Reiniciar demonstração')}><RotateCcw size={13} />Reiniciar demo</button></div></footer>{info && <Modal title={info} onClose={() => setInfo('')}><div className="modal-content">{info === 'Reiniciar demonstração' ? <><p>Os anúncios criados, favoritos e conversas deste navegador serão substituídos pelos dados iniciais da demonstração.</p><div className="button-row"><button className="button secondary" onClick={() => setInfo('')}>Cancelar</button><button className="button primary" onClick={() => { reset(); navigate('/'); setInfo(''); }}>Reiniciar demo</button></div></> : <><p>{info === 'Sobre a Republik' ? 'A Republik conecta estudantes para encontrar moradia perto do campus e comprar, vender e alugar móveis, eletrônicos e outros itens. Este é um protótipo de hackathon com dados fictícios e ações salvas neste navegador.' : info === 'Como funciona' ? 'Explore as vagas, filtre por universidade e orçamento, salve seus favoritos e converse com os anunciantes. Você também pode publicar um anúncio gratuitamente. Para testar a verificação acadêmica, use o código demonstrativo 123456.' : 'Na demonstração, você pode navegar pelos anúncios, simular uma conversa, agendar uma visita, solicitar o aluguel de um item e publicar seu próprio anúncio. As mensagens, propostas e verificações são simuladas; não há envios para pessoas reais.'}</p><Link to="/verificar" className="button primary" onClick={() => setInfo('')}><LogIn size={17} />Conhecer a comunidade</Link></>}</div></Modal>}</>;
}
export function App() {
  const { toast } = useStore();
  return <><a className="skip-link" href="#main">Pular para o conteúdo</a><ScrollToTop /><Header /><main id="main"><Routes><Route path="/" element={<Explore kind="housing" />} /><Route path="/desapego" element={<Explore kind="market" />} /><Route path="/anuncio/:id" element={<Details />} /><Route path="/meu-espaco" element={<Dashboard />} /><Route path="/anunciar" element={<CreateListing />} /><Route path="/anunciar/:id" element={<CreateListing />} /><Route path="/mensagens" element={<Messages />} /><Route path="/verificar" element={<Verification />} /><Route path="*" element={<div className="empty-state"><h1>Essa página pegou outro caminho.</h1><p>Encontre seu próximo lugar por aqui.</p><Link to="/" className="button primary">Voltar para moradias</Link></div>} /></Routes></main><Footer /><MobileNavigation />{toast && <div className="toast" role="status"><Check size={18} />{toast}</div>}</>;
}
