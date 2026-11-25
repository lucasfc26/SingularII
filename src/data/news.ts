import type { NewsItem } from '@/types';
import { daysAgo, daysFromNow } from '@/utils/format';
import { IMG } from './images';
import { p, h2, quote, img, tex } from './blocks';

type Seed = Omit<NewsItem, 'id' | 'status' | 'body'> & { body?: NewsItem['body']; status?: NewsItem['status'] };

const seeds: Seed[] = [
  {
    slug: 'webb-mapeia-materia-escura-em-aglomerado-distante',
    title: 'Webb e Hubble combinam dados para mapear matéria escura em aglomerado distante',
    excerpt: 'Lentes gravitacionais fracas revelam como a massa invisível se distribui em torno das galáxias mais brilhantes do aglomerado.',
    cover: IMG.darkMatterWebb2, categoryId: 'cat-cosmologia', topics: ['materia-escura', 'cosmologia'], authorId: 'a4',
    publishedAt: daysAgo(0, 8), readingTime: 4, highlight: true, views: 12840,
    source: { name: 'NASA', url: 'https://science.nasa.gov/mission/webb/' },
  },
  {
    slug: 'artemis-ii-dados-da-capsula-orion',
    title: 'Dados da cápsula Orion na Artemis II orientam ajustes para o pouso lunar',
    excerpt: 'Engenheiros analisam o desempenho do escudo térmico e dos sistemas de suporte à vida durante o voo tripulado ao redor da Lua.',
    cover: IMG.artemis, categoryId: 'cat-exploracao', topics: ['fisica-classica'], authorId: 'a5',
    publishedAt: daysAgo(1, 14), readingTime: 5, highlight: true, views: 9870,
    source: { name: 'NASA', url: 'https://www.nasa.gov/humans-in-space/artemis/' },
  },
  {
    slug: 'nova-imagem-infravermelha-nebulosa-de-orion',
    title: 'Nova imagem infravermelha revela berçário estelar escondido em Órion',
    excerpt: 'Discos protoplanetários e jatos de estrelas recém-nascidas aparecem através da poeira que bloqueia a luz visível.',
    cover: IMG.orionIR, categoryId: 'cat-astronomia', topics: ['astronomia-observacional', 'astrofisica'], authorId: 'a1',
    publishedAt: daysAgo(2, 10), readingTime: 3, highlight: false, views: 7420,
    source: { name: 'NASA/JPL', url: 'https://www.jpl.nasa.gov/' },
  },
  {
    slug: 'buraco-negro-supermassivo-em-galaxia-pequena',
    title: 'Buraco negro gigante é encontrado em lugar improvável',
    excerpt: 'Um buraco negro com milhões de massas solares foi identificado em uma galáxia anã, desafiando modelos de crescimento.',
    cover: IMG.behemoth, categoryId: 'cat-astrofisica', topics: ['buracos-negros'], authorId: 'a1',
    publishedAt: daysAgo(3, 9), readingTime: 4, highlight: true, views: 15210,
    source: { name: 'NASA Hubble', url: 'https://science.nasa.gov/mission/hubble/' },
  },
  {
    slug: 'computador-quantico-corrige-erros-abaixo-do-limiar',
    title: 'Processador quântico demonstra correção de erros abaixo do limiar crítico',
    excerpt: 'Aumentar o número de qubits físicos passou a reduzir, e não aumentar, a taxa de erro do qubit lógico.',
    cover: IMG.w49b, categoryId: 'cat-quantica', topics: ['mecanica-quantica'], authorId: 'a3',
    publishedAt: daysAgo(4, 16), readingTime: 5, highlight: false, views: 6630,
    source: { name: 'Nature', url: 'https://www.nature.com/' },
  },
  {
    slug: 'tempestade-solar-auroras-em-baixas-latitudes',
    title: 'Tempestade geomagnética produz auroras visíveis em baixas latitudes',
    excerpt: 'Uma sequência de ejeções de massa coronal atingiu a Terra; operadores de satélites relataram aumento de arrasto atmosférico.',
    cover: IMG.aurora, categoryId: 'cat-astronomia', topics: ['astrofisica'], authorId: 'a4',
    publishedAt: daysAgo(5, 7), readingTime: 3, highlight: false, views: 11040,
    source: { name: 'NOAA SWPC', url: 'https://www.swpc.noaa.gov/' },
  },
  {
    slug: 'juno-imagens-polo-sul-de-jupiter',
    title: 'Juno registra ciclones agrupados no polo sul de Júpiter',
    excerpt: 'Os vórtices formam um padrão geométrico estável há anos, e os cientistas ainda tentam entender o mecanismo.',
    cover: IMG.juno, categoryId: 'cat-exploracao', topics: ['fisica-classica'], authorId: 'a5',
    publishedAt: daysAgo(7, 11), readingTime: 4, highlight: false, views: 5480,
    source: { name: 'NASA/JPL-Caltech/SwRI', url: 'https://www.missionjuno.swri.edu/' },
  },
  {
    slug: 'desi-novos-indicios-energia-escura-evolui',
    title: 'Mapa 3D de galáxias reforça indícios de que a energia escura evolui',
    excerpt: 'Análise combinada com supernovas e radiação cósmica de fundo amplia a tensão com o modelo ΛCDM.',
    cover: IMG.virgo, categoryId: 'cat-cosmologia', topics: ['energia-escura', 'cosmologia'], authorId: 'a2',
    publishedAt: daysAgo(8, 13), readingTime: 6, highlight: true, views: 13980,
    source: { name: 'DESI Collaboration', url: 'https://www.desi.lbl.gov/' },
  },
  {
    slug: 'detector-de-neutrinos-sinal-de-supernova',
    title: 'Rede de detectores de neutrinos amplia sistema de alerta para supernovas',
    excerpt: 'Neutrinos chegam horas antes da luz visível; o alerta automático dará tempo para apontar telescópios.',
    cover: IMG.snRemnant, categoryId: 'cat-tecnologia', topics: ['fisica-de-particulas', 'astrofisica'], authorId: 'a6',
    publishedAt: daysAgo(10, 9), readingTime: 4, highlight: false, views: 3920,
    source: { name: 'SNEWS', url: 'https://snews2.org/' },
  },
  {
    slug: 'exoplaneta-com-atmosfera-de-vapor-dagua',
    title: 'Espectroscopia indica vapor d\'água na atmosfera de exoplaneta temperado',
    excerpt: 'A detecção, ainda preliminar, foi feita durante trânsitos do planeta diante de sua estrela anã vermelha.',
    cover: IMG.exoplanet, categoryId: 'cat-pesquisa', topics: ['astronomia-observacional'], authorId: 'a4',
    publishedAt: daysAgo(12, 15), readingTime: 5, highlight: false, views: 8770,
    source: { name: 'The Astrophysical Journal Letters', url: 'https://iopscience.iop.org/journal/2041-8205' },
  },
  {
    slug: 'satelite-brasileiro-nanossatelite-clima-espacial',
    title: 'Nanossatélite brasileiro vai monitorar clima espacial sobre a Anomalia do Atlântico Sul',
    excerpt: 'Projeto desenvolvido por universidades e pelo INPE deve ser lançado no próximo ano.',
    cover: IMG.earthNight, categoryId: 'cat-tecnologia', topics: ['astronomia-observacional'], authorId: 'a5',
    publishedAt: daysAgo(15, 10), readingTime: 4, highlight: false, views: 4310,
    source: { name: 'INPE', url: 'https://www.gov.br/inpe/' },
  },
  {
    slug: 'restos-de-supernova-revelam-elementos-pesados',
    title: 'Restos de supernova revelam distribuição assimétrica de ferro e silício',
    excerpt: 'Observações em raios X sugerem que a explosão pode ter produzido um buraco negro em vez de uma estrela de nêutrons.',
    cover: IMG.w49b, categoryId: 'cat-astrofisica', topics: ['astrofisica', 'buracos-negros'], authorId: 'a1',
    publishedAt: daysAgo(18, 12), readingTime: 4, highlight: false, views: 5120,
    source: { name: 'NASA Chandra', url: 'https://chandra.si.edu/' },
  },
  {
    slug: 'mapa-da-via-lactea-braco-de-sagitario',
    title: 'Mapa infravermelho encontra "quebra" no braço de Sagitário da Via Láctea',
    excerpt: 'Estrelas jovens e nuvens de gás formam uma estrutura que se projeta em ângulo do braço espiral.',
    cover: IMG.milkyWay, categoryId: 'cat-astronomia', topics: ['astronomia-observacional'], authorId: 'a2',
    publishedAt: daysAgo(22, 9), readingTime: 3, highlight: false, views: 6890,
    source: { name: 'NASA/JPL-Caltech', url: 'https://www.jpl.nasa.gov/' },
  },
  {
    slug: 'colisor-mede-massa-do-boson-w',
    title: 'Nova medida da massa do bóson W volta a concordar com o Modelo Padrão',
    excerpt: 'Resultado do LHC contradiz medida anterior que apontava desvio significativo.',
    cover: IMG.crabMulti, categoryId: 'cat-pesquisa', topics: ['fisica-de-particulas'], authorId: 'a6',
    publishedAt: daysAgo(27, 14), readingTime: 5, highlight: false, views: 3410,
    source: { name: 'CERN', url: 'https://home.cern/' },
  },
  {
    slug: 'sonda-mars-novas-amostras',
    title: 'Rover em Marte armazena nova amostra de rocha sedimentar antiga',
    excerpt: 'Camadas finas sugerem a presença de um antigo lago na cratera explorada.',
    cover: IMG.mars, categoryId: 'cat-exploracao', topics: ['astronomia-observacional'], authorId: 'a4',
    publishedAt: daysFromNow(2, 8), readingTime: 3, highlight: false, views: 0, status: 'scheduled',
    source: { name: 'NASA/JPL', url: 'https://mars.nasa.gov/' },
  },
];

const defaultBody = (s: Seed) => [
  p(`${s.excerpt} O resultado foi divulgado por ${s.source.name} e repercutiu entre pesquisadores da área.`),
  p('Segundo a equipe responsável, os dados passaram por várias etapas de calibração e validação cruzada com observações independentes antes do anúncio. Ainda assim, os autores ressaltam que novas medições serão necessárias para confirmar todas as implicações.'),
  h2('Por que isso importa'),
  p('A descoberta ajuda a testar previsões de modelos teóricos que até agora só podiam ser avaliados indiretamente. Para a comunidade científica, cada nova peça de evidência reduz o espaço de explicações possíveis e orienta o planejamento de futuras missões e experimentos.'),
  img(s.cover, s.title, s.source.name),
  quote('É exatamente o tipo de dado que esperávamos há anos. Agora começa a parte mais interessante: entender o que ele significa.', 'Pesquisadora da equipe'),
  p('Os próximos passos incluem observações de acompanhamento e a publicação dos dados brutos para que outros grupos possam reproduzir a análise.'),
];

export const news: NewsItem[] = seeds.map((s, i) => ({
  ...s,
  id: `news-${i + 1}`,
  status: s.status ?? 'published',
  scheduledFor: s.status === 'scheduled' ? s.publishedAt : undefined,
  body:
    s.body ??
    (i === 7
      ? [
          ...defaultBody(s).slice(0, 3),
          p('No modelo padrão, a energia escura tem equação de estado constante $w = -1$. Os novos dados favorecem uma parametrização em que ela varia com o fator de escala:'),
          tex('w(a) = w_0 + w_a (1 - a)'),
          ...defaultBody(s).slice(3),
        ]
      : defaultBody(s)),
}));
