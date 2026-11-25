import type { Author } from '@/types';

export const authors: Author[] = [
  { id: 'a1', name: 'Helena Vasconcelos', role: 'Astrofísica', affiliation: 'Instituto de Astronomia, USP', bio: 'Pesquisa a formação de buracos negros supermassivos no Universo primitivo e escreve sobre ciência há doze anos.', hue: '#6C8CFF' },
  { id: 'a2', name: 'Rafael Monteiro', role: 'Cosmólogo', affiliation: 'Observatório Nacional', bio: 'Trabalha com levantamentos de galáxias e a medida da expansão cósmica. Membro da colaboração J-PAS.', hue: '#A78BFA' },
  { id: 'a3', name: 'Marina Okabe', role: 'Física teórica', affiliation: 'IFT-Unesp', bio: 'Estuda gravitação quântica e termodinâmica de buracos negros. Divulgadora e professora.', hue: '#53DDF5' },
  { id: 'a4', name: 'Tiago Albuquerque', role: 'Jornalista de ciência', affiliation: 'SingularII', bio: 'Editor de notícias, cobre exploração espacial e política científica desde 2014.', hue: '#F0A35E' },
  { id: 'a5', name: 'Beatriz Lacerda', role: 'Engenheira aeroespacial', affiliation: 'INPE', bio: 'Atua no desenvolvimento de cargas úteis para pequenos satélites e escreve sobre tecnologia espacial.', hue: '#5FD3A0' },
  { id: 'a6', name: 'Daniel Ferraz', role: 'Físico de partículas', affiliation: 'CBPF', bio: 'Participa de análises de dados do experimento LHCb no CERN, com foco em violação de simetria CP.', hue: '#F27A8A' },
];

export const getAuthor = (id: string) => authors.find((a) => a.id === id) ?? authors[0]!;
