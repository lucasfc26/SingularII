import { Link } from 'react-router-dom';
import { ExternalLink, Github, GraduationCap, Instagram, Linkedin, Mail, MapPin, Youtube } from 'lucide-react';
import { INSTITUTION } from '@/data/institution';
import { Logo } from './Logo';
import { NewsletterForm } from '../home/NewsletterForm';
import { categories } from '@/data/taxonomy';
import { NAV } from './Header';

const social = [
  { label: 'YouTube', href: 'https://www.youtube.com/', icon: Youtube },
  { label: 'Instagram', href: 'https://www.instagram.com/', icon: Instagram },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: Linkedin },
  { label: 'GitHub', href: 'https://github.com/', icon: Github },
];

const institutional = [
  { to: '/sobre', label: 'Sobre a SingularII' },
  { to: '/contato', label: 'Contato' },
  { to: '/cadastro', label: 'Criar conta' },
  { to: '/admin', label: 'Área da equipe' },
];

export function Footer() {
  return (
    <footer className="relative z-10 mt-24 overflow-hidden border-t border-line bg-bg">
      <div className="nebula-bg absolute inset-0 opacity-80" aria-hidden />
      <div className="star-dust absolute inset-0 opacity-50" aria-hidden />
      <div className="pointer-events-none absolute -bottom-[60%] left-1/2 aspect-square w-[140%] -translate-x-1/2 rounded-full border border-line opacity-60" aria-hidden />
      <div className="shell relative py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Um observatório digital para quem nunca deixou de perguntar. Artigos, notícias, eventos e imagens sobre física, astrofísica e cosmologia — com rigor e encantamento.
            </p>
            <a href={INSTITUTION.url} target="_blank" rel="noopener noreferrer" className="group mt-5 flex items-start gap-3 rounded-xl border border-line p-3 transition hover:border-line-strong">
              <GraduationCap className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <span className="text-sm">
                <span className="block font-medium text-fg">{INSTITUTION.name}</span>
                <span className="block text-muted">{INSTITUTION.sector}</span>
                <span className="mt-1 flex items-center gap-1 font-mono text-xs text-accent">{INSTITUTION.urlLabel} <ExternalLink className="size-3" aria-hidden /></span>
              </span>
            </a>
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium">Newsletter semanal</p>
              <NewsletterForm compact />
            </div>
            <ul className="mt-6 flex gap-2">
              {social.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-9 place-items-center rounded-full border border-line text-muted transition hover:-translate-y-0.5 hover:border-line-strong hover:text-fg">
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <FooterCol title="Navegação" links={NAV.map((n) => ({ to: n.to, label: n.label }))} />
            <FooterCol title="Categorias" links={categories.map((c) => ({ to: `/categorias/${c.slug}`, label: c.name }))} />
            <FooterCol title="Institucional" links={institutional} />
            <div>
              <p className="eyebrow mb-4 text-muted">Contato</p>
              <ul className="space-y-3 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <a href="mailto:contato@singularii.ciencia" className="transition hover:text-fg">contato@singularii.ciencia</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>
                    {INSTITUTION.sector} · {INSTITUTION.name}
                    <br />
                    {INSTITUTION.city}/{INSTITUTION.state} · {INSTITUTION.country}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} SingularII · {INSTITUTION.sector} da {INSTITUTION.name} ({INSTITUTION.shortName}), {INSTITUTION.city}/{INSTITUTION.state}. Imagens: NASA Image and Video Library (domínio público).
          </p>
          <div className="flex gap-5">
            <Link to="/privacidade" className="transition hover:text-fg">Política de privacidade</Link>
            <Link to="/termos" className="transition hover:text-fg">Termos de uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <p className="eyebrow mb-4 text-muted">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-fg/80 transition hover:text-fg">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
