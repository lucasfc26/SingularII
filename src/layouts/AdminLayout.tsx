import { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ExternalLink, FileText, Images, LayoutDashboard, LogOut, Menu, Newspaper, Settings, ShieldCheck, Users, X, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Avatar } from '@/components/ui/Misc';
import { Button } from '@/components/ui/Button';
import { BlackHoleLoader } from '@/components/loaders/BlackHoleLoader';
import { ADMIN_ROLES, ROLE_LABEL, can, isStaff, type Permission } from '@/utils/permissions';
import { DEMO_PASSWORD } from '@/data/users';
import type { Role } from '@/types';
import { cn } from '@/utils/cn';

const NAV: { to: string; label: string; icon: typeof FileText; end?: boolean; perm: Permission }[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, perm: 'dashboard:view' },
  { to: '/admin/artigos', label: 'Artigos', icon: FileText, perm: 'content:edit' },
  { to: '/admin/noticias', label: 'Notícias', icon: Newspaper, perm: 'content:edit' },
  { to: '/admin/eventos', label: 'Eventos', icon: CalendarDays, perm: 'events:manage' },
  { to: '/admin/multimidia', label: 'Multimídia', icon: Images, perm: 'media:upload' },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users, perm: 'users:view' },
  { to: '/admin/administradores', label: 'Administradores', icon: ShieldCheck, perm: 'admins:manage' },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings, perm: 'settings:manage' },
];

function AdminGate() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const enter = async (email: string) => {
    setLoading(email);
    try {
      await login(email, DEMO_PASSWORD);
    } finally {
      setLoading(null);
    }
  };
  return (
    <div className="nebula-bg flex min-h-dvh items-center justify-center px-5">
      <div className="panel w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-8 font-display text-2xl font-semibold">Área administrativa</h1>
        <p className="mt-2 text-sm text-muted">
          {user ? `Sua conta (${ROLE_LABEL[user.role]}) não tem acesso ao painel.` : 'Entre com uma conta da equipe para continuar.'} Para explorar a demonstração, escolha um perfil:
        </p>
        <div className="mt-6 space-y-2">
          {[
            ['admin@horizonte.ciencia', 'superadmin'],
            ['bruno.tavares@horizonte.ciencia', 'admin'],
            ['editora@horizonte.ciencia', 'editor'],
            ['diego.martins@horizonte.ciencia', 'colaborador'],
          ].map(([email, role]) => (
            <button key={email} onClick={() => enter(email!)} disabled={!!loading} className="flex w-full items-center justify-between rounded-xl border border-line px-4 py-3 text-left transition hover:border-line-strong hover:bg-fg/[0.03]">
              <span>
                <span className="block text-sm font-medium">{ROLE_LABEL[role as Role]}</span>
                <span className="block text-xs text-muted">{email}</span>
              </span>
              {loading === email ? <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : <span className="font-mono text-[10px] text-accent">ENTRAR →</span>}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>Voltar ao site</Button>
          {user && <Button variant="ghost" size="sm" onClick={logout}>Sair</Button>}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, role, simulatedRole, simulateRole, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!user || !isStaff(user.role)) return <AdminGate />;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo />
        <span className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[9px] tracking-widest text-muted uppercase">Admin</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Administração">
        {NAV.map(({ to, label, icon: Icon, end, perm }) => {
          const allowed = can(role, perm);
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn('relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition', isActive ? 'bg-fg/[0.07] font-medium text-fg' : 'text-muted hover:bg-fg/[0.04] hover:text-fg', !allowed && 'opacity-45')}
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="admin-nav" className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-accent" />}
                  <Icon className="size-4" />
                  {label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-line p-3">
        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-fg/[0.04] hover:text-fg">
          <ExternalLink className="size-4" /> Ver site
        </a>
        <button onClick={() => { logout(); navigate('/'); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-fg/[0.04] hover:text-fg">
          <LogOut className="size-4" /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-bg">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-bg-2/60 backdrop-blur lg:block">{sidebar}</aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-[#02030a]/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-line bg-bg-2 lg:hidden" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}>
              <button onClick={() => setOpen(false)} className="absolute top-4 right-3 rounded-lg p-1.5 text-muted" aria-label="Fechar menu"><X className="size-5" /></button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-xl md:px-8">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-fg lg:hidden" aria-label="Abrir menu"><Menu className="size-5" /></button>
          <div className="flex-1" />
          <label className="hidden items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted sm:flex">
            <Eye className="size-3.5" />
            <span className="hidden md:inline">Simular papel</span>
            <select
              value={simulatedRole ?? user.role}
              onChange={(e) => simulateRole(e.target.value === user.role ? null : (e.target.value as Role))}
              className="cursor-pointer bg-transparent font-medium text-fg outline-none"
              aria-label="Simular permissões de outro papel"
            >
              {ADMIN_ROLES.map((r) => <option key={r} value={r} className="bg-surface">{ROLE_LABEL[r]}</option>)}
            </select>
          </label>
          <ThemeToggle />
          <div className="flex items-center gap-2.5">
            <Avatar name={user.name} hue={user.hue} size={32} />
            <div className="hidden text-xs leading-tight md:block">
              <p className="font-medium text-fg">{user.name}</p>
              <p className="text-muted">{ROLE_LABEL[role!]}{simulatedRole && ' (simulado)'}</p>
            </div>
          </div>
        </header>
        {simulatedRole && (
          <div className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-xs text-warning md:px-8">
            Visualizando como <strong>{ROLE_LABEL[simulatedRole]}</strong> — ações sem permissão ficam bloqueadas.{' '}
            <button onClick={() => simulateRole(null)} className="underline underline-offset-2">Voltar ao meu papel</button>
          </div>
        )}
        <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-10">
          <Suspense fallback={<BlackHoleLoader fullscreen={false} />}>
            <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Outlet />
            </motion.div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
