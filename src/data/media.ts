import type { MediaCategory, MediaItem } from '@/types';
import { daysAgo } from '@/utils/format';
import { IMG, VIDEO } from './images';

export const mediaCategories: { id: MediaCategory; label: string }[] = [
  { id: 'fotografias', label: 'Fotografias astronômicas' },
  { id: 'telescopios', label: 'Imagens de telescópios' },
  { id: 'galaxias', label: 'Galáxias' },
  { id: 'nebulosas', label: 'Nebulosas' },
  { id: 'planetas', label: 'Planetas' },
  { id: 'simulacoes', label: 'Simulações científicas' },
  { id: 'documentarios', label: 'Documentários' },
  { id: 'educativos', label: 'Vídeos educativos' },
  { id: 'documentos', label: 'Documentos e livros' },
];

type Seed = Omit<MediaItem, 'id' | 'createdAt' | 'thumb' | 'kind'> & { thumb?: string; kind?: MediaItem['kind'] };

const seeds: Seed[] = [
  { title: 'Penhascos Cósmicos de Carina', description: 'A borda de uma região de formação estelar na Nebulosa de Carina, vista pelo NIRCam do James Webb. Estrelas jovens esculpem a nuvem com radiação ultravioleta.', category: 'nebulosas', src: IMG.carina, credit: 'NASA, ESA, CSA, STScI', aspect: 1.75, topics: ['astronomia-observacional'] },
  { title: 'Pilares da Criação em alta definição', description: 'Colunas de gás frio e poeira na Nebulosa da Águia, onde novas estrelas estão se formando.', category: 'nebulosas', src: IMG.pillars, credit: 'NASA, ESA/Hubble', aspect: 0.8, topics: ['astrofisica'] },
  { title: 'Galáxia de Andrômeda', description: 'Nossa vizinha espiral, a 2,5 milhões de anos-luz. Em cerca de 4,5 bilhões de anos ela colidirá com a Via Láctea.', category: 'galaxias', src: IMG.andromeda, credit: 'NASA/JPL-Caltech', aspect: 1.3, topics: ['cosmologia', 'materia-escura'] },
  { title: 'Primeiras imagens coloridas do Webb', description: 'Parte do conjunto divulgado em julho de 2022, que inaugurou a era científica do telescópio.', category: 'telescopios', src: IMG.jwstFirst1, credit: 'NASA, ESA, CSA, STScI', aspect: 1.2, topics: ['astronomia-observacional'] },
  { title: 'Simulação: buracos negros supermassivos em espiral', description: 'Visualização baseada em simulação de dois buracos negros supermassivos prestes a se fundir, com seus discos de gás.', category: 'simulacoes', kind: 'video', src: VIDEO.smbh.src, thumb: VIDEO.smbh.thumb, credit: 'NASA Goddard', aspect: 1.78, duration: '1:32', topics: ['buracos-negros', 'relatividade-geral'] },
  { title: 'Polo sul de Júpiter', description: 'Ciclones agrupados no polo sul do planeta, ilustrados a partir de dados da sonda Juno.', category: 'planetas', src: IMG.juno, credit: 'NASA/JPL-Caltech/SwRI', aspect: 1, topics: ['fisica-classica'] },
  { title: 'Nebulosa do Caranguejo', description: 'Remanescente da supernova de 1054. No centro, um pulsar emite feixes de radiação 30 vezes por segundo.', category: 'nebulosas', src: IMG.crab, credit: 'NASA, ESA, J. Hester', aspect: 1.05, topics: ['astrofisica'] },
  { title: 'Aurora vista da Estação Espacial', description: 'Cortina de luz verde sobre o planeta, fotografada pela tripulação da ISS.', category: 'fotografias', src: IMG.aurora, credit: 'NASA/ISS', aspect: 1.5, topics: ['astrofisica'] },
  { title: 'Supernova com casca em expansão', description: 'Animação da NASA que mostra a onda de choque e os detritos ejetados por uma estrela que explode.', category: 'educativos', kind: 'video', src: VIDEO.supernova.src, thumb: VIDEO.supernova.thumb, credit: 'NASA Goddard', aspect: 1.78, duration: '0:48', topics: ['astrofisica'] },
  { title: 'Aglomerado Abell 1689', description: 'A massa do aglomerado curva a luz de galáxias de fundo em arcos — uma lente gravitacional natural.', category: 'galaxias', src: IMG.abell, credit: 'NASA, ESA/Hubble', aspect: 1.1, topics: ['relatividade-geral', 'materia-escura'] },
  { title: 'Lançamento da Artemis II', description: 'O foguete SLS deixa a plataforma levando a tripulação em uma viagem ao redor da Lua.', category: 'fotografias', src: IMG.artemis, credit: 'NASA/MAF', aspect: 0.75, topics: ['fisica-classica'] },
  { title: 'A história da luz estelar', description: 'Como o telescópio Fermi mediu toda a luz emitida por estrelas ao longo da história do Universo.', category: 'documentarios', kind: 'video', src: VIDEO.starlight.src, thumb: VIDEO.starlight.thumb, credit: 'NASA Goddard', aspect: 1.78, duration: '2:41', topics: ['cosmologia'] },
  { title: 'Remanescente de supernova W49B', description: 'Distribuição incomum de elementos que sugere uma explosão assimétrica, possivelmente formando um buraco negro.', category: 'telescopios', src: IMG.w49b, credit: 'NASA/CXC/MIT', aspect: 1, topics: ['buracos-negros', 'astrofisica'] },
  { title: 'Órion em infravermelho', description: 'A luz infravermelha atravessa a poeira e revela estrelas recém-nascidas no coração da nebulosa.', category: 'nebulosas', src: IMG.orionIR, credit: 'NASA/JPL-Caltech', aspect: 1.25, topics: ['astronomia-observacional'] },
  { title: 'Via Láctea desembaraçada', description: 'Mosaico infravermelho do plano galáctico, com nuvens de gás e aglomerados escondidos pela poeira.', category: 'galaxias', src: IMG.milkyWay, credit: 'NASA/JPL-Caltech', aspect: 1.9, topics: ['astronomia-observacional'] },
  { title: 'TESS encontra seus primeiros planetas', description: 'O caçador de exoplanetas TESS e os primeiros mundos descobertos pela missão.', category: 'educativos', kind: 'video', src: VIDEO.tess.src, thumb: VIDEO.tess.thumb, credit: 'NASA Goddard', aspect: 1.78, duration: '2:05', topics: ['astronomia-observacional'] },
  { title: 'Cassini em órbita de Saturno', description: 'Ilustração da inserção orbital da sonda Cassini, que estudou o sistema de Saturno por 13 anos.', category: 'planetas', src: IMG.cassini, credit: 'NASA/JPL', aspect: 1.33, topics: ['fisica-classica'] },
  { title: 'Matéria escura revelada', description: 'Mapa de massa reconstruído a partir de lentes gravitacionais em dados do Webb e do Hubble.', category: 'simulacoes', src: IMG.darkMatterWebb2, credit: 'NASA, ESA, CSA', aspect: 1, topics: ['materia-escura'] },
  { title: 'Exoplaneta em torno de estrela jovem', description: 'Concepção artística de um planeta orbitando uma estrela ainda cercada pelo disco de formação.', category: 'planetas', src: IMG.exoplanet, credit: 'NASA/JPL-Caltech', aspect: 1.5, topics: ['astronomia-observacional'] },
  { title: 'Erupção solar observada pelo SDO', description: 'Uma das erupções mais intensas do ciclo solar, registrada em ultravioleta extremo.', category: 'telescopios', src: IMG.solarFlare, credit: 'NASA/SDO', aspect: 1, topics: ['astrofisica'] },
  { title: 'Aglomerado de Virgem', description: 'Mais de mil galáxias reunidas a cerca de 54 milhões de anos-luz.', category: 'galaxias', src: IMG.virgo, credit: 'NASA/JPL-Caltech', aspect: 1.4, topics: ['energia-escura', 'cosmologia'] },
  { title: 'A Terra à noite', description: 'Luzes urbanas e o brilho tênue da atmosfera fotografados da órbita.', category: 'fotografias', src: IMG.earthNight, credit: 'NASA/ISS', aspect: 1.5, topics: ['fisica-classica'] },
];

export const media: MediaItem[] = seeds.map((s, i) => ({
  ...s,
  id: `media-${i + 1}`,
  kind: s.kind ?? 'image',
  thumb: s.thumb ?? s.src.replace('~large', '~medium'),
  createdAt: daysAgo(i * 2 + 1),
}));
