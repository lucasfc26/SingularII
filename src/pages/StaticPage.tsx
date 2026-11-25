import { PageHero } from '@/components/layout/PageHero';
import { useDocumentTitle } from '@/hooks/dom';
import { Button } from '@/components/ui/Button';
import { Mail } from 'lucide-react';

type PageKey = 'sobre' | 'contato' | 'privacidade' | 'termos';

const PAGES: Record<PageKey, { eyebrow: string; title: string; intro: string; sections: [string, string][] }> = {
  sobre: {
    eyebrow: 'Institucional',
    title: 'Um observatório aberto a todos.',
    intro: 'A Horizonte nasceu da convicção de que a ciência fica mais bonita quando é compartilhada. Reunimos pesquisadores, jornalistas e educadores para explicar o Universo com rigor e encantamento.',
    sections: [
      ['Nossa missão', 'Tornar acessível o conhecimento produzido em física, astrofísica e cosmologia, sem simplificações que distorçam a ciência e sem jargão que afaste o público.'],
      ['Como trabalhamos', 'Todos os artigos são revisados por pelo menos um especialista da área. Indicamos fontes e referências primárias sempre que possível, e corrigimos publicamente qualquer erro.'],
      ['Imagens', 'Usamos principalmente imagens da NASA Image and Video Library, que estão em domínio público, sempre com o crédito da missão ou instituição responsável.'],
    ],
  },
  contato: {
    eyebrow: 'Fale conosco',
    title: 'Envie um sinal.',
    intro: 'Sugestões de pauta, parcerias para eventos, correções ou dúvidas: respondemos em até três dias úteis.',
    sections: [
      ['Redação', 'pautas@horizonte.ciencia — sugestões de temas, entrevistas e correções.'],
      ['Eventos', 'eventos@horizonte.ciencia — propostas de palestras, observações e parcerias com escolas.'],
      ['Imprensa e institucional', 'contato@horizonte.ciencia'],
    ],
  },
  privacidade: {
    eyebrow: 'Documento',
    title: 'Política de privacidade',
    intro: 'Esta é uma versão demonstrativa. Coletamos apenas os dados necessários para oferecer nossos serviços, em conformidade com a LGPD (Lei nº 13.709/2018).',
    sections: [
      ['Dados coletados', 'Nome e e-mail ao criar conta, se inscrever em eventos ou na newsletter. Interesses temáticos são opcionais e usados apenas para personalizar recomendações.'],
      ['Uso dos dados', 'Enviar confirmações de inscrição, lembretes de eventos e a newsletter, quando autorizada. Nunca vendemos ou compartilhamos dados com terceiros para fins publicitários.'],
      ['Seus direitos', 'Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail privacidade@horizonte.ciencia.'],
    ],
  },
  termos: {
    eyebrow: 'Documento',
    title: 'Termos de uso',
    intro: 'Versão demonstrativa dos termos que regem o uso da plataforma Horizonte.',
    sections: [
      ['Conteúdo', 'Os textos publicados podem ser compartilhados com atribuição e link para a fonte. Imagens seguem as condições de uso de suas instituições de origem.'],
      ['Eventos', 'Inscrições são pessoais. Em eventos com vagas limitadas, pedimos que cancele a inscrição caso não possa comparecer, liberando a vaga para outra pessoa.'],
      ['Conduta', 'Esperamos respeito em todos os espaços da comunidade, presenciais e online. Condutas abusivas resultam em suspensão da conta.'],
    ],
  },
};

export default function StaticPage({ page }: { page: PageKey }) {
  const c = PAGES[page];
  useDocumentTitle(c.title);
  return (
    <>
      <PageHero eyebrow={c.eyebrow} title={c.title} description={c.intro}>
        {page === 'contato' && <Button href="mailto:contato@horizonte.ciencia" icon={<Mail className="size-4" />}>contato@horizonte.ciencia</Button>}
      </PageHero>
      <div className="shell max-w-3xl space-y-10">
        {c.sections.map(([h, t], i) => (
          <section key={h} className="grid gap-3 border-t border-line pt-8 md:grid-cols-[180px_1fr]">
            <p className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</p>
            <div>
              <h2 className="font-display text-xl font-semibold">{h}</h2>
              <p className="mt-2 leading-relaxed text-muted">{t}</p>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
