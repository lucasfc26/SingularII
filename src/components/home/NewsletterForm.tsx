import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Mail } from 'lucide-react';
import { newsletterService } from '@/services';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/utils/cn';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterForm({ compact }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [serverError, setServerError] = useState<string | null>(null);
  const toast = useToast();
  const valid = EMAIL_RE.test(email);
  const error = serverError ?? (touched && email && !valid ? 'Digite um e-mail válido, como nome@dominio.com' : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setServerError(null);
    if (!valid) return;
    setState('loading');
    try {
      await newsletterService.subscribe(email);
      setState('success');
      toast({ title: 'Inscrição confirmada', description: 'A próxima edição chega na sua caixa de entrada.' });
    } catch (err) {
      setState('idle');
      setServerError((err as Error).message);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        {state === 'success' ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 text-sm', compact ? 'p-3' : 'p-4')}
            role="status"
          >
            <span className="grid size-8 place-items-center rounded-full bg-success/20 text-success">
              <Check className="size-4" />
            </span>
            <span>
              <strong className="block font-medium text-fg">Você está na órbita.</strong>
              <span className="text-muted">Enviamos uma confirmação para {email}.</span>
            </span>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0, y: -8 }}>
            <div
              className={cn(
                'flex items-center gap-2 rounded-xl border bg-surface/70 p-1.5 transition-[border-color,box-shadow]',
                error ? 'border-danger/60' : valid ? 'border-success/40' : 'border-line focus-within:border-primary/60',
                'focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_15%,transparent)]',
              )}
            >
              <Mail className="ml-2 size-4 shrink-0 text-muted" aria-hidden />
              <label htmlFor={compact ? 'nl-compact' : 'nl-main'} className="sr-only">
                Seu e-mail
              </label>
              <input
                id={compact ? 'nl-compact' : 'nl-main'}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setServerError(null);
                }}
                onBlur={() => setTouched(true)}
                aria-invalid={!!error}
                aria-describedby={error ? 'nl-err' : undefined}
                className={cn('min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-muted', compact ? 'h-8' : 'h-10')}
              />
              <button
                type="submit"
                disabled={state === 'loading'}
                className={cn('group flex shrink-0 items-center gap-1.5 rounded-lg bg-fg font-medium text-bg transition hover:opacity-90 disabled:opacity-60', compact ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm')}
              >
                {state === 'loading' ? <span className="size-4 animate-spin rounded-full border-2 border-bg border-t-transparent" /> : 'Inscrever'}
                {state !== 'loading' && <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p id="nl-err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 text-xs text-danger" role="alert">
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
