import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, Check, Download, Star } from 'lucide-react';
import type { EventItem, Registration } from '@/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, Input, Select, Checkbox } from '../ui/Form';
import { eventsService, eventStatus } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { downloadFile, eventToICS, googleCalendarUrl } from '@/utils/files';
import { formatDateLong, formatTime } from '@/utils/format';
import { MODALITY_LABEL } from './Cards';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AddToCalendar({ event }: { event: EventItem }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" icon={<Download className="size-3.5" />} onClick={() => downloadFile(`${event.slug}.ics`, eventToICS(event), 'text/calendar')}>
        Baixar .ics
      </Button>
      <Button variant="secondary" size="sm" icon={<CalendarPlus className="size-3.5" />} href={googleCalendarUrl(event)}>
        Google Agenda
      </Button>
    </div>
  );
}

/** Simulated registration: form → submit → confirmation with ticket code. */
export function RegistrationModal({ event, open, onClose, mode = 'confirmed' }: { event: EventItem | null; open: boolean; onClose: () => void; mode?: 'confirmed' | 'interested' }) {
  const { user } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [modality, setModality] = useState<'presencial' | 'online'>('presencial');
  const [agree, setAgree] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Registration | null>(null);

  useEffect(() => {
    if (open) {
      setName(user?.name ?? '');
      setEmail(user?.email ?? '');
      setDone(null);
      setError(null);
      setTouched(false);
      setAgree(false);
      setModality(event?.modality === 'online' ? 'online' : 'presencial');
    }
    // reset only when the modal opens (not when the event refetches after registering)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event?.id]);

  if (!event) return null;
  const status = eventStatus(event);
  const errs = {
    name: name.trim().length < 3 ? 'Informe seu nome completo.' : undefined,
    email: !EMAIL_RE.test(email) ? 'Informe um e-mail válido.' : undefined,
    agree: !agree ? 'É preciso aceitar para continuar.' : undefined,
  };
  const invalid = Object.values(errs).some(Boolean);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (invalid) return;
    setLoading(true);
    setError(null);
    try {
      const reg = await eventsService.register(event, { name: name.trim(), email: email.trim(), userId: user?.id, status: mode });
      setDone(reg);
      toast({ title: mode === 'confirmed' ? 'Presença confirmada!' : 'Interesse registrado', description: event.title });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="md" title={done ? undefined : mode === 'confirmed' ? 'Confirmar participação' : 'Tenho interesse'} description={done ? undefined : event.title}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
            <div className="relative mx-auto mb-6 grid size-20 place-items-center">
              <span className="absolute inset-0 rounded-full bg-success/20 [animation:pulse-ring_1.6s_ease-out_infinite]" />
              <span className="relative grid size-16 place-items-center rounded-full bg-success text-white">
                {mode === 'confirmed' ? <Check className="size-8" /> : <Star className="size-7 fill-current" />}
              </span>
            </div>
            <h3 className="font-display text-2xl font-semibold">{mode === 'confirmed' ? 'Inscrição confirmada' : 'Você será avisado'}</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              {mode === 'confirmed'
                ? `Enviamos os detalhes para ${done.email}. Apresente o código abaixo no dia do evento.`
                : 'Avisaremos sobre novidades e quando as inscrições forem abertas ou houver novas vagas.'}
            </p>
            {mode === 'confirmed' && (
              <div className="mx-auto mt-6 max-w-xs rounded-xl border border-dashed border-line-strong p-4">
                <p className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">Código de inscrição</p>
                <p className="mt-1 font-mono text-2xl font-semibold tracking-widest text-fg">{done.code}</p>
                <p className="mt-2 text-xs text-muted">{formatDateLong(event.startsAt)} · {formatTime(event.startsAt)}</p>
              </div>
            )}
            <div className="mt-6 flex justify-center"><AddToCalendar event={event} /></div>
            <Button variant="ghost" className="mt-4" onClick={onClose}>Fechar</Button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate className="space-y-4" exit={{ opacity: 0 }}>
            {mode === 'confirmed' && status !== 'open' && (
              <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">As inscrições para este evento não estão abertas.</p>
            )}
            <Field label="Nome completo" required error={touched ? errs.name : undefined}>
              {(id, d) => <Input id={id} aria-describedby={d} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" invalid={touched && !!errs.name} />}
            </Field>
            <Field label="E-mail" required error={touched ? errs.email : undefined} hint="Usaremos para enviar a confirmação e lembretes.">
              {(id, d) => <Input id={id} aria-describedby={d} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" invalid={touched && !!errs.email} />}
            </Field>
            {event.modality === 'hibrido' && (
              <Field label="Como você vai participar?">
                {(id) => (
                  <Select id={id} value={modality} onChange={(e) => setModality(e.target.value as 'presencial' | 'online')}>
                    <option value="presencial">Presencialmente</option>
                    <option value="online">Pela transmissão online</option>
                  </Select>
                )}
              </Field>
            )}
            <div className="rounded-lg bg-bg-2/60 p-3 text-xs text-muted">
              {MODALITY_LABEL[event.modality]} · {formatDateLong(event.startsAt)} às {formatTime(event.startsAt)}
              {event.location && ` · ${event.location.venue}, ${event.location.city}`}
            </div>
            <div>
              <Checkbox checked={agree} onChange={setAgree} label="Concordo em receber comunicações sobre este evento e com a política de privacidade." />
              {touched && errs.agree && <p className="mt-1 text-xs text-danger">{errs.agree}</p>}
            </div>
            {error && <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger" role="alert">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" loading={loading} disabled={mode === 'confirmed' && status !== 'open'}>
                {mode === 'confirmed' ? 'Confirmar presença' : 'Registrar interesse'}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </Modal>
  );
}
