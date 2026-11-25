import type { Supporter } from '@/types';
import { daysAgo } from '@/utils/format';

/**
 * Placeholder wordmarks (generated SVG) — replace with the official logos
 * in Painel → Apoiadores. Official marks are not bundled with the project.
 */
function wordmark(text: string, color: string, sub?: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160"><rect width="320" height="160" fill="#ffffff"/><text x="160" y="${sub ? 82 : 96}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${text.length > 6 ? 40 : 56}" fill="${color}" letter-spacing="2">${text}</text>${sub ? `<text x="160" y="118" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#333" letter-spacing="1">${sub}</text>` : ''}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const supporters: Supporter[] = [
  { id: 'sup-ufc', name: 'UFC — Física', description: 'Departamento de Física e Programa de Pós-Graduação em Física da Universidade Federal do Ceará.', logo: wordmark('UFC', '#003f7d', 'FÍSICA · PÓS-GRADUAÇÃO'), url: 'https://fisica.ufc.br/pos', createdAt: daysAgo(120) },
  { id: 'sup-cnpq', name: 'CNPq', description: 'Conselho Nacional de Desenvolvimento Científico e Tecnológico.', logo: wordmark('CNPq', '#0a5aa8'), url: 'https://www.gov.br/cnpq', createdAt: daysAgo(118) },
  { id: 'sup-funcap', name: 'FUNCAP', description: 'Fundação Cearense de Apoio ao Desenvolvimento Científico e Tecnológico.', logo: wordmark('FUNCAP', '#c8102e'), url: 'https://www.funcap.ce.gov.br', createdAt: daysAgo(116) },
  { id: 'sup-govce', name: 'Governo do Ceará', description: 'Secretarias da Cultura, da Educação e da Ciência, Tecnologia e Educação Superior.', logo: wordmark('CEARÁ', '#111111', 'GOVERNO DO ESTADO'), url: 'https://www.ceara.gov.br', createdAt: daysAgo(114) },
  { id: 'sup-sbf', name: 'SBF', description: 'Sociedade Brasileira de Física.', logo: wordmark('SBF', '#9e1b1b', 'SOCIEDADE BRASILEIRA DE FÍSICA'), url: 'https://www.sbfisica.org.br', createdAt: daysAgo(112) },
  { id: 'sup-tja', name: 'Theatro José de Alencar', description: 'Equipamento cultural da Secretaria da Cultura do Ceará, em Fortaleza.', logo: wordmark('TJA', '#222222', 'THEATRO JOSÉ DE ALENCAR'), url: 'https://www.secult.ce.gov.br', createdAt: daysAgo(110) },
  { id: 'sup-idm', name: 'Instituto Dragão do Mar', description: 'Organização social que gere equipamentos culturais do Governo do Ceará.', logo: wordmark('IDM', '#111111', 'INSTITUTO DRAGÃO DO MAR'), url: 'https://www.dragaodomar.org.br', createdAt: daysAgo(108) },
];
