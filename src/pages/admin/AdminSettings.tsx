import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { PlatformSettings } from '@/types';
import { settingsService } from '@/services';
import { resetAllData } from '@/services/store';
import { useQuery } from '@/hooks/useQuery';
import { useDocumentTitle } from '@/hooks/dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AdminPageHeader, NoPermission } from '@/components/admin/AdminUI';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/Form';
import { Skeleton } from '@/components/ui/States';

export default function AdminSettings() {
  useDocumentTitle('Configurações');
  const { can } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const { setTheme } = useTheme();
  const { data } = useQuery(() => settingsService.get(), []);
  const [form, setForm] = useState<PlatformSettings | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (!can('settings:manage')) return <NoPermission what="alterar configurações" />;
  if (!form) return <Skeleton className="h-96" />;
  const set = <K extends keyof PlatformSettings>(k: K, v: PlatformSettings[K]) => setForm({ ...form, [k]: v });

  const save = async () => {
    setSaving(true);
    await settingsService.update(form);
    setSaving(false);
    toast({ title: 'Configurações salvas' });
  };

  const reset = async () => {
    if (!(await confirm({ title: 'Restaurar dados de demonstração?', description: 'Todos os conteúdos criados, editados ou excluídos neste navegador serão descartados e os dados originais restaurados.', confirmLabel: 'Restaurar' }))) return;
    resetAllData();
    window.location.reload();
  };

  return (
    <>
      <AdminPageHeader title="Configurações" description="Preferências gerais da plataforma." actions={<Button loading={saving} onClick={save}>Salvar alterações</Button>} />
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold">Identidade</h2>
          <Field label="Nome da plataforma">{(id) => <Input id={id} value={form.name} onChange={(e) => set('name', e.target.value)} />}</Field>
          <Field label="Descrição">{(id) => <Textarea id={id} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />}</Field>
          <Field label="E-mail de contato">{(id) => <Input id={id} type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />}</Field>
          <Field label="Tema padrão">
            {(id) => (
              <Select id={id} value={form.defaultTheme} onChange={(e) => { set('defaultTheme', e.target.value as 'dark' | 'light'); setTheme(e.target.value as 'dark' | 'light'); }}>
                <option value="dark">Escuro (recomendado)</option>
                <option value="light">Claro</option>
              </Select>
            )}
          </Field>
        </section>
        <section className="panel space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold">Funcionalidades</h2>
          <Switch checked={form.registrationsEnabled} onChange={(v) => set('registrationsEnabled', v)} label="Inscrições em eventos" description="Quando desligado, o público não consegue se inscrever." />
          <Switch checked={form.newsletterEnabled} onChange={(v) => set('newsletterEnabled', v)} label="Newsletter" description="Exibe formulários de inscrição na newsletter." />
          <Switch checked={form.commentsEnabled} onChange={(v) => set('commentsEnabled', v)} label="Comentários em artigos" description="Preparado para integração futura." />
          <Switch checked={form.maintenanceMode} onChange={(v) => set('maintenanceMode', v)} label="Modo de manutenção" description="Exibe um aviso no site público (simulado)." />
        </section>
        <section className="panel p-6 xl:col-span-2">
          <h2 className="font-display text-lg font-semibold">Dados de demonstração</h2>
          <p className="mt-1 text-sm text-muted">Todo o CRUD desta demonstração é salvo no armazenamento local do navegador. A camada <code className="font-mono text-xs">src/services</code> isola essas chamadas para futura troca por uma API HTTP.</p>
          <Button variant="secondary" className="mt-4" icon={<RotateCcw className="size-4" />} onClick={reset}>Restaurar dados originais</Button>
        </section>
      </div>
    </>
  );
}
