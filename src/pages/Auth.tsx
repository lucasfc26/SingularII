import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useDocumentTitle } from '@/hooks/dom';
import { topics } from '@/data/taxonomy';
import { DEMO_PASSWORD } from '@/data/users';
import { IMG } from '@/data/images';
import { Field, Input, Checkbox } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Misc';
import { isStaff, ROLE_LABEL } from '@/utils/permissions';
import { EASE } from '@/animations/variants';
import type { Role } from '@/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DEMOS: { email: string; role: Role }[] = [
  { email: 'admin@singularii.ciencia', role: 'superadmin' },
  { email: 'editora@singularii.ciencia', role: 'editor' },
  { email: 'leitor@singularii.ciencia', role: 'leitor' },
];

function AuthShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <section className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={IMG.carina} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#05060A] via-[#05060A]/50 to-transparent" />
        <div className="absolute right-12 bottom-12 left-12 text-[#F4F6FC]">
          <p className="font-mono text-[11px] tracking-[0.16em] text-[#53DDF5] uppercase">Penhascos Cósmicos · Carina</p>
          <p className="mt-4 max-w-md font-display text-3xl leading-tight font-semibold">“O cosmos está dentro de nós. Somos uma forma de o Universo conhecer a si mesmo.”</p>
          <p className="mt-3 text-sm text-white/60">Carl Sagan</p>
          <p className="mt-10 font-mono text-[10px] text-white/40">Imagem: NASA, ESA, CSA, STScI</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 pt-28 pb-16 lg:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="w-full max-w-md">
          <h1 className="font-display text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>
      </div>
    </section>
  );
}

export function Login() {
  useDocumentTitle('Entrar');
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errs = { email: !EMAIL_RE.test(email) ? 'Informe um e-mail válido.' : undefined, password: password.length < 6 ? 'A senha tem pelo menos 6 caracteres.' : undefined };

  const doLogin = async (e: string, p: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await login(e, p);
      toast({ title: `Bem-vindo(a), ${u.name.split(' ')[0]}!` });
      navigate(from ?? (isStaff(u.role) ? '/admin' : '/perfil'));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Entrar" subtitle="Acompanhe suas inscrições, salve interesses e receba novidades.">
      <form noValidate onSubmit={(e) => { e.preventDefault(); setTouched(true); if (!errs.email && !errs.password) doLogin(email, password); }} className="space-y-4">
        <Field label="E-mail" error={touched ? errs.email : undefined}>
          {(id, d) => <Input id={id} aria-describedby={d} type="email" autoComplete="email" leading={<Mail className="size-4" />} value={email} onChange={(e) => setEmail(e.target.value)} invalid={touched && !!errs.email} />}
        </Field>
        <Field label="Senha" error={touched ? errs.password : undefined}>
          {(id, d) => (
            <div className="relative">
              <Input id={id} aria-describedby={d} type={show ? 'text' : 'password'} autoComplete="current-password" leading={<LockKeyhole className="size-4" />} value={password} onChange={(e) => setPassword(e.target.value)} invalid={touched && !!errs.password} className="pr-10" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1.5 text-muted hover:text-fg" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          )}
        </Field>
        {error && <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger" role="alert">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={<ArrowRight className="size-4" />}>Entrar</Button>
      </form>
      <div className="panel mt-8 p-4">
        <p className="mb-3 flex items-center gap-2 text-xs font-medium text-muted"><ShieldCheck className="size-4 text-accent" /> Contas de demonstração (login simulado)</p>
        <div className="space-y-1.5">
          {DEMOS.map((d) => (
            <button key={d.email} disabled={loading} onClick={() => doLogin(d.email, DEMO_PASSWORD)} className="flex w-full items-center justify-between rounded-lg border border-line px-3 py-2 text-left text-sm transition hover:border-line-strong hover:bg-fg/[0.03]">
              <span className="truncate">{d.email}</span>
              <span className="font-mono text-[10px] tracking-wider text-accent uppercase">{ROLE_LABEL[d.role]}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-muted">Senha de todas: {DEMO_PASSWORD}</p>
      </div>
      <p className="mt-8 text-center text-sm text-muted">Ainda não tem conta? <Link to="/cadastro" className="font-medium text-primary hover:underline">Criar conta gratuita</Link></p>
    </AuthShell>
  );
}

export function Register() {
  useDocumentTitle('Criar conta');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newsletter, setNewsletter] = useState(true);
  const [terms, setTerms] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const errs = {
    name: name.trim().length < 3 ? 'Informe seu nome.' : undefined,
    email: !EMAIL_RE.test(email) ? 'Informe um e-mail válido.' : undefined,
    password: password.length < 8 ? 'Use pelo menos 8 caracteres.' : undefined,
    terms: !terms ? 'Aceite os termos para continuar.' : undefined,
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (Object.values(errs).some(Boolean)) return;
    setLoading(true);
    setError(null);
    try {
      await register({ name: name.trim(), email: email.trim(), interests, newsletter });
      toast({ title: 'Conta criada!', description: 'Bem-vindo(a) ao observatório.' });
      navigate('/perfil');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Criar conta" subtitle="Gratuita, sem anúncios. Personalize o que você quer acompanhar.">
      <form noValidate onSubmit={submit} className="space-y-4">
        <Field label="Nome" error={touched ? errs.name : undefined}>
          {(id, d) => <Input id={id} aria-describedby={d} autoComplete="name" leading={<UserIcon className="size-4" />} value={name} onChange={(e) => setName(e.target.value)} invalid={touched && !!errs.name} />}
        </Field>
        <Field label="E-mail" error={touched ? errs.email : undefined}>
          {(id, d) => <Input id={id} aria-describedby={d} type="email" autoComplete="email" leading={<Mail className="size-4" />} value={email} onChange={(e) => setEmail(e.target.value)} invalid={touched && !!errs.email} />}
        </Field>
        <Field label="Senha" error={touched ? errs.password : undefined}>
          {(id, d) => (
            <>
              <Input id={id} aria-describedby={d} type="password" autoComplete="new-password" leading={<LockKeyhole className="size-4" />} value={password} onChange={(e) => setPassword(e.target.value)} invalid={touched && !!errs.password} />
              <div className="mt-2 flex gap-1" aria-label={`Força da senha: ${strength} de 4`}>
                {[0, 1, 2, 3].map((i) => <span key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i < strength ? ['var(--danger)', 'var(--warning)', 'var(--accent)', 'var(--success)'][strength - 1] : 'var(--line-strong)' }} />)}
              </div>
            </>
          )}
        </Field>
        <div>
          <p className="mb-2 text-[13px] font-medium text-fg/90">Interesses <span className="font-normal text-muted">(opcional)</span></p>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => <Chip key={t.slug} active={interests.includes(t.slug)} onClick={() => setInterests((xs) => (xs.includes(t.slug) ? xs.filter((x) => x !== t.slug) : [...xs, t.slug]))}>{t.name}</Chip>)}
          </div>
        </div>
        <Checkbox checked={newsletter} onChange={setNewsletter} label="Quero receber a newsletter semanal." />
        <div>
          <Checkbox checked={terms} onChange={setTerms} label={<>Li e aceito os <Link to="/termos" className="text-primary hover:underline">termos de uso</Link> e a <Link to="/privacidade" className="text-primary hover:underline">política de privacidade</Link>.</>} />
          {touched && errs.terms && <p className="mt-1 text-xs text-danger">{errs.terms}</p>}
        </div>
        {error && <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger" role="alert">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading} iconRight={<ArrowRight className="size-4" />}>Criar conta</Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">Já tem conta? <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link></p>
    </AuthShell>
  );
}
