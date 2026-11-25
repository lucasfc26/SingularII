import type { Category, Topic } from '@/types';
import { IMG } from './images';

export const categories: Category[] = [
  { id: 'cat-astronomia', slug: 'astronomia', name: 'Astronomia', description: 'Observação do céu, corpos celestes e o trabalho dos grandes observatórios.', hue: '#53DDF5' },
  { id: 'cat-astrofisica', slug: 'astrofisica', name: 'Astrofísica', description: 'A física que governa estrelas, galáxias e objetos compactos.', hue: '#6C8CFF' },
  { id: 'cat-quantica', slug: 'fisica-quantica', name: 'Física Quântica', description: 'O comportamento da matéria e da luz nas menores escalas.', hue: '#A78BFA' },
  { id: 'cat-cosmologia', slug: 'cosmologia', name: 'Cosmologia', description: 'Origem, estrutura e destino do Universo como um todo.', hue: '#F0A35E' },
  { id: 'cat-exploracao', slug: 'exploracao-espacial', name: 'Exploração Espacial', description: 'Missões, sondas, foguetes e a presença humana no espaço.', hue: '#F27A8A' },
  { id: 'cat-tecnologia', slug: 'tecnologia', name: 'Tecnologia', description: 'Instrumentos, detectores e computação a serviço da ciência.', hue: '#5FD3A0' },
  { id: 'cat-pesquisa', slug: 'pesquisas-cientificas', name: 'Pesquisas Científicas', description: 'Resultados recentes publicados em periódicos revisados por pares.', hue: '#E7C35A' },
];

export const topics: Topic[] = [
  {
    id: 't1', slug: 'buracos-negros', name: 'Buracos Negros', tagline: 'Onde o espaço-tempo se fecha sobre si mesmo',
    description: 'Horizontes de eventos, discos de acreção, radiação Hawking e o paradoxo da informação. O laboratório extremo da gravidade.',
    cover: IMG.behemoth, visual: 'blackhole', keyFigure: { label: 'Sgr A*', value: '4,3 × 10⁶ M☉' }, span: 'wide',
  },
  {
    id: 't2', slug: 'relatividade-geral', name: 'Relatividade Geral', tagline: 'A gravidade como geometria',
    description: 'Como massa e energia curvam o espaço-tempo — das órbitas de Mercúrio às ondas gravitacionais detectadas pelo LIGO.',
    cover: IMG.abell, visual: 'spacetime', keyFigure: { label: 'Equação de campo', value: 'Gμν = 8πG Tμν / c⁴' }, span: 'tall',
  },
  {
    id: 't3', slug: 'mecanica-quantica', name: 'Mecânica Quântica', tagline: 'Probabilidade no coração da realidade',
    description: 'Superposição, emaranhamento e medição. A teoria mais testada da física e ainda a mais estranha.',
    cover: IMG.orionIR, visual: 'wave', keyFigure: { label: 'Constante de Planck', value: '6,626 × 10⁻³⁴ J·s' },
  },
  {
    id: 't4', slug: 'astrofisica', name: 'Astrofísica', tagline: 'A física das estrelas',
    description: 'Fusão nuclear, evolução estelar, supernovas e a forja cósmica dos elementos químicos.',
    cover: IMG.crab, visual: 'star', keyFigure: { label: 'Núcleo solar', value: '1,5 × 10⁷ K' },
  },
  {
    id: 't5', slug: 'cosmologia', name: 'Cosmologia', tagline: 'O Universo como um todo',
    description: 'Big Bang, radiação cósmica de fundo, inflação e a tensão de Hubble na medida da expansão.',
    cover: IMG.jwstFirst1, visual: 'cosmos', keyFigure: { label: 'Idade do Universo', value: '13,8 bilhões de anos' }, span: 'wide',
  },
  {
    id: 't6', slug: 'astronomia-observacional', name: 'Astronomia Observacional', tagline: 'A arte de coletar fótons',
    description: 'Telescópios, espectroscopia, interferometria e as técnicas que transformam luz antiga em conhecimento.',
    cover: IMG.carina, visual: 'telescope', keyFigure: { label: 'Espelho do JWST', value: '6,5 m' },
  },
  {
    id: 't7', slug: 'fisica-de-particulas', name: 'Física de Partículas', tagline: 'Os tijolos fundamentais',
    description: 'O Modelo Padrão, o bóson de Higgs, neutrinos e a busca por física além do que conhecemos.',
    cover: IMG.w49b, visual: 'particles', keyFigure: { label: 'Massa do Higgs', value: '125,1 GeV/c²' },
  },
  {
    id: 't8', slug: 'fisica-classica', name: 'Física Clássica', tagline: 'Newton, Maxwell e o mundo macroscópico',
    description: 'Mecânica, termodinâmica e eletromagnetismo: as leis que ainda nos levam à Lua e a Marte.',
    cover: IMG.juno, visual: 'pendulum', keyFigure: { label: 'Velocidade da luz', value: '299 792 458 m/s' },
  },
  {
    id: 't9', slug: 'materia-escura', name: 'Matéria Escura', tagline: '85% da matéria que não vemos',
    description: 'Curvas de rotação, lentes gravitacionais e a caçada a partículas que não interagem com a luz.',
    cover: IMG.darkMatterWebb, visual: 'darkmatter', keyFigure: { label: 'Fração da matéria', value: '≈ 85%' }, span: 'tall',
  },
  {
    id: 't10', slug: 'energia-escura', name: 'Energia Escura', tagline: 'A aceleração inesperada',
    description: 'Por que a expansão do Universo acelera? Constante cosmológica, quintessência e os novos dados do DESI.',
    cover: IMG.virgo, visual: 'darkenergy', keyFigure: { label: 'Densidade de energia', value: 'Ω_Λ ≈ 0,69' },
  },
];

export const getCategory = (id: string) => categories.find((c) => c.id === id || c.slug === id);
export const getTopic = (slug: string) => topics.find((t) => t.slug === slug);
