import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, LogOut, Menu, Search, User as UserIcon, X } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { SearchModal } from './SearchModal';
import { Avatar } from '../ui/Misc';
import { useScrolled, useClickOutside } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { isStaff, ROLE_LABEL } from '@/utils/permissions';
import { cn } from '@/utils/cn';

export const NAV = [
  { to: '/', label: 'Início', end: true },
  { to: '/explorar', label: 'Explorar' },
  { to: '/artigos', label: 'Artigos' },
  { to: '/noticias', label: 'Notícias' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/multimidia', label: 'Multimídia' },
];

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useClickOutside(ref, () => setOpen(false), open);

  if (!user)
    return (
      <Link to="/login" className="flex h-9 items-center gap-2 rounded-full bg-fg px-3.5 text-[13px] font-medium text-bg transition hover:opacity-90">
        <UserIcon className="size-4" aria-hidden />
        <span className="hidden sm:inline">Entrar</span>
      </Link>
    );

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="rounded-full p-0.5 transition hover:ring-2 hover:ring-line-strong" aria-haspopup="menu" aria-expanded={open} aria-label="Menu da conta">
        <Avatar name={user.name} hue={user.hue} size={32} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="glass absolute top-12 right-0 w-60 origin-top-right rounded-xl p-1.5 shadow-2xl"
            style={{ background: 'var(--glass-strong)' }}
          >
            <div className="border-b border-line px-3 py-2.5">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
              <p className="mt-1 font-mono text-[10px] tracking-widest text-accent uppercase">{ROLE_LABEL[user.role]}</p>
            </div>
            <button role="menuitem" onClick={() => { setOpen(false); navigate('/perfil'); }} className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg/90 hover:bg-fg/5">
              <UserIcon className="size-4 text-muted" /> Meu perfil
            </button>
            {isStaff(user.role) && (
              <button role="menuitem" onClick={() => { setOpen(false); navigate('/admin'); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg/90 hover:bg-fg/5">
                <LayoutDashboard className="size-4 text-muted" /> Painel administrativo
              </button>
            )}
            <button role="menuitem" onClick={() => { setOpen(false); logout(); navigate('/'); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg/90 hover:bg-fg/5">
              <LogOut className="size-4 text-muted" /> Sair
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const scrolled = useScrolled(40);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenu(false);
  }, [pathname]);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearch((s) => !s);
      }
      if (e.key === '/' && !(e.target as HTMLElement).closest('input, textarea, [contenteditable]')) {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2 focus:text-bg">
        Pular para o conteúdo
      </a>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[90] flex justify-center px-3 pt-3 sm:pt-4"
      >
        <div
          className={cn(
            'glass pointer-events-auto flex w-full items-center justify-between gap-2 rounded-full transition-all duration-500 ease-[var(--ease-out-expo)] lg:w-auto',
            scrolled ? 'max-w-[980px] py-1.5 pr-1.5 pl-4 shadow-[var(--shadow-soft)]' : 'max-w-[1060px] py-2 pr-2 pl-5',
          )}
          style={{
            background: scrolled ? 'var(--glass-strong)' : 'var(--glass)',
            borderColor: scrolled ? 'var(--line-strong)' : 'var(--line)',
          }}
        >
          <Logo />
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className={cn('flex items-center transition-all duration-500', scrolled ? 'mx-3 gap-0' : 'mx-6 gap-0.5')}>
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={({ isActive }) => cn('relative block rounded-full px-3.5 py-1.5 text-[13.5px] transition-colors', isActive ? 'text-fg' : 'text-muted hover:text-fg')}>
                    {({ isActive }) => (
                      <>
                        {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-fg/[0.08] ring-1 ring-line-strong" transition={{ type: 'spring', stiffness: 480, damping: 36 }} />}
                        <span className="relative">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearch(true)}
              className="flex h-9 items-center gap-2 rounded-full px-2.5 text-muted transition hover:bg-fg/[0.07] hover:text-fg"
              aria-label="Pesquisar (Ctrl+K)"
            >
              <Search className="size-[17px]" />
              <kbd className="hidden rounded border border-line px-1.5 font-mono text-[10px] xl:inline">⌘K</kbd>
            </button>
            <ThemeToggle />
            <ProfileMenu />
            <button onClick={() => setMenu((m) => !m)} className="grid size-9 place-items-center rounded-full text-fg transition hover:bg-fg/[0.07] lg:hidden" aria-label={menu ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menu}>
              {menu ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <>
            <motion.div className="fixed inset-0 z-[85] bg-[#02030a]/50 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
            <motion.nav
              aria-label="Menu móvel"
              initial={{ opacity: 0, y: -16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="glass fixed inset-x-3 top-[72px] z-[89] origin-top rounded-2xl p-2 shadow-2xl lg:hidden"
              style={{ background: 'var(--glass-strong)' }}
            >
              {NAV.map((item, i) => (
                <motion.div key={item.to} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <NavLink to={item.to} end={item.end} className={({ isActive }) => cn('flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-lg', isActive ? 'bg-fg/[0.07] text-fg' : 'text-fg/80')}>
                    {item.label}
                    <span className="font-mono text-[10px] text-muted">0{i + 1}</span>
                  </NavLink>
                </motion.div>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <SearchModal open={search} onClose={() => setSearch(false)} />
    </>
  );
}
