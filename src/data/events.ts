import type { EventItem, Speaker } from '@/types';
import { daysFromNow } from '@/utils/format';
import { IMG } from './images';

const sp = (id: string, name: string, role: string, affiliation: string, hue: string): Speaker => ({ id, name, role, affiliation, hue });

const S = {
  helena: sp('sp1', 'Helena Vasconcelos', 'Astrofísica', 'IAG-USP', '#6C8CFF'),
  rafael: sp('sp2', 'Rafael Monteiro', 'Cosmólogo', 'Observatório Nacional', '#A78BFA'),
  marina: sp('sp3', 'Marina Okabe', 'Física teórica', 'IFT-Unesp', '#53DDF5'),
  daniel: sp('sp4', 'Daniel Ferraz', 'Físico de partículas', 'CBPF', '#F27A8A'),
  beatriz: sp('sp5', 'Beatriz Lacerda', 'Engenheira aeroespacial', 'INPE', '#5FD3A0'),
  joao: sp('sp6', 'João Pedro Saraiva', 'Astrônomo amador', 'Clube de Astronomia do Cerrado', '#F0A35E'),
  luiza: sp('sp7', 'Luiza Andrade', 'Doutoranda em astrobiologia', 'UFRJ', '#E7C35A'),
};

const org = {
  horizonte: { name: 'Horizonte', about: 'Plataforma de divulgação científica dedicada à física e à astronomia.', contact: 'eventos@horizonte.ciencia' },
  planetario: { name: 'Planetário Municipal', about: 'Espaço público de educação astronômica com cúpula digital de 18 m.', contact: 'contato@planetario.example' },
  sab: { name: 'Sociedade Astronômica Brasileira', about: 'Associação científica que reúne astrônomos profissionais do país.', contact: 'sab@example.org' },
  clube: { name: 'Clube de Astronomia do Cerrado', about: 'Grupo de observação com telescópios itinerantes e saídas a céu escuro.', contact: 'clube@example.org' },
};

const at = (d: number, h: number, m = 0) => daysFromNow(d, h, m);

export const events: EventItem[] = [
  {
    id: 'ev-1', slug: 'noite-de-observacao-saturno-e-jupiter', title: 'Noite de observação: Saturno, Júpiter e a Lua crescente',
    summary: 'Telescópios apontados para os gigantes gasosos e crateras lunares, com monitores explicando cada alvo.',
    description: 'Uma noite inteira de observação guiada a céu aberto. Montaremos oito telescópios refletores e refratores, de 100 a 300 mm de abertura, com alvos escolhidos para o horário: os anéis de Saturno, as luas galileanas de Júpiter e o terminador lunar, onde as sombras revelam o relevo das crateras.\n\nNão é necessário experiência prévia. Traga agasalho e, se possível, uma lanterna com luz vermelha. Em caso de céu nublado, a atividade acontece na cúpula do planetário com projeção imersiva.',
    cover: IMG.cassini, type: 'observacao', modality: 'presencial', startsAt: at(9, 19, 30), endsAt: at(9, 23, 0),
    location: { venue: 'Parque do Observatório', address: 'Av. das Estrelas, 1200', city: 'Campinas, SP' },
    organizer: org.clube, capacity: 120, registeredCount: 84, registrationDeadline: at(8, 23, 59),
    speakers: [S.joao, S.helena],
    schedule: [
      { id: 'sc1', time: '19:30', title: 'Recepção e orientação', description: 'Como usar um telescópio e adaptar a visão ao escuro.', speakerId: 'sp6' },
      { id: 'sc2', time: '20:00', title: 'Lua crescente e o terminador', speakerId: 'sp6' },
      { id: 'sc3', time: '20:45', title: 'Júpiter e suas luas galileanas', speakerId: 'sp1' },
      { id: 'sc4', time: '21:30', title: 'Os anéis de Saturno', speakerId: 'sp1' },
      { id: 'sc5', time: '22:15', title: 'Céu profundo: aglomerados e nebulosas', speakerId: 'sp6' },
    ],
    topics: ['astronomia-observacional'], tags: ['observação', 'telescópio', 'família'], featured: true,
  },
  {
    id: 'ev-2', slug: 'palestra-buracos-negros-alem-do-horizonte', title: 'Além do horizonte: o que sabemos sobre buracos negros',
    summary: 'Da imagem do EHT às ondas gravitacionais, uma palestra sobre os objetos mais extremos do Universo.',
    description: 'Nesta palestra, a astrofísica Helena Vasconcelos percorre a história dos buracos negros — de curiosidade matemática da relatividade geral a objetos observados diretamente. Veremos como funcionam as imagens do Event Horizon Telescope, o que as fusões detectadas pelo LIGO revelam e quais perguntas continuam em aberto.\n\nA sessão terá 60 minutos de apresentação e 30 minutos de perguntas do público, presencial e online.',
    cover: IMG.bhJet, type: 'palestra', modality: 'hibrido', startsAt: at(5, 19, 0), endsAt: at(5, 20, 30),
    location: { venue: 'Auditório do Planetário', address: 'Rua Galileu, 300', city: 'São Paulo, SP' },
    streamUrl: 'https://www.youtube.com/@horizonte', organizer: org.planetario, capacity: 250, registeredCount: 231, registrationDeadline: at(5, 17, 0),
    speakers: [S.helena],
    schedule: [
      { id: 'sc1', time: '19:00', title: 'Abertura', description: 'Boas-vindas e apresentação da palestrante.' },
      { id: 'sc2', time: '19:10', title: 'Da matemática ao céu', speakerId: 'sp1' },
      { id: 'sc3', time: '19:40', title: 'A sombra de M87* e Sgr A*', speakerId: 'sp1' },
      { id: 'sc4', time: '20:00', title: 'Perguntas do público' },
    ],
    topics: ['buracos-negros', 'relatividade-geral'], tags: ['palestra', 'buracos negros', 'EHT'], featured: true,
  },
  {
    id: 'ev-3', slug: 'congresso-brasileiro-de-cosmologia', title: 'Congresso Brasileiro de Cosmologia 2027',
    summary: 'Três dias de sessões sobre energia escura, tensão de Hubble, radiação cósmica de fundo e levantamentos de galáxias.',
    description: 'O principal encontro nacional da área reúne pesquisadores, estudantes de pós-graduação e professores para discutir os resultados mais recentes da cosmologia observacional e teórica. A programação inclui palestras plenárias, sessões de pôsteres e mesas-redondas sobre os novos dados do DESI, Euclid e do Observatório Vera C. Rubin.',
    cover: IMG.jwstFirst1, type: 'congresso', modality: 'presencial', startsAt: at(48, 9, 0), endsAt: at(50, 18, 0),
    location: { venue: 'Centro de Convenções', address: 'Av. Atlântica, 4000', city: 'Rio de Janeiro, RJ' },
    organizer: org.sab, capacity: 600, registeredCount: 342, registrationDeadline: at(40, 23, 59),
    speakers: [S.rafael, S.marina, S.helena],
    schedule: [
      { id: 'sc1', time: '09:00', title: 'Plenária: o estado da tensão de Hubble', speakerId: 'sp2' },
      { id: 'sc2', time: '11:00', title: 'Energia escura dinâmica?', speakerId: 'sp2' },
      { id: 'sc3', time: '14:00', title: 'Sessão de pôsteres' },
      { id: 'sc4', time: '16:00', title: 'Mesa-redonda: holografia e cosmologia', speakerId: 'sp3' },
    ],
    topics: ['cosmologia', 'energia-escura'], tags: ['congresso', 'cosmologia', 'pesquisa'], featured: true,
  },
  {
    id: 'ev-4', slug: 'workshop-astrofotografia-com-celular', title: 'Workshop: astrofotografia com celular e tripé',
    summary: 'Aprenda a fotografar a Via Láctea, trilhas de estrelas e a Lua usando apenas o seu smartphone.',
    description: 'Um workshop prático de quatro horas. Na primeira parte, veremos exposição, ISO, empilhamento de imagens e aplicativos gratuitos. Na segunda, sairemos para uma área de céu escuro para praticar. Vagas limitadas para garantir atendimento individual.',
    cover: IMG.milkyWay, type: 'workshop', modality: 'presencial', startsAt: at(16, 18, 0), endsAt: at(16, 22, 0),
    location: { venue: 'Fazenda Céu Escuro', address: 'Estrada Municipal, km 12', city: 'Alto Paraíso, GO' },
    organizer: org.clube, capacity: 30, registeredCount: 30, registrationDeadline: at(14, 23, 59),
    speakers: [S.joao],
    schedule: [
      { id: 'sc1', time: '18:00', title: 'Fundamentos de exposição noturna', speakerId: 'sp6' },
      { id: 'sc2', time: '19:30', title: 'Pós-processamento e empilhamento', speakerId: 'sp6' },
      { id: 'sc3', time: '20:30', title: 'Prática em campo', speakerId: 'sp6' },
    ],
    topics: ['astronomia-observacional'], tags: ['workshop', 'fotografia', 'prático'],
  },
  {
    id: 'ev-5', slug: 'live-artemis-e-o-retorno-a-lua', title: 'Live: Artemis e o retorno humano à Lua',
    summary: 'Uma conversa ao vivo sobre a engenharia das missões Artemis, com perguntas pelo chat.',
    description: 'A engenheira Beatriz Lacerda explica os desafios de levar seres humanos de volta à superfície lunar: o foguete SLS, a cápsula Orion, os módulos de pouso e a estação Gateway. Transmissão aberta e gratuita, com perguntas pelo chat.',
    cover: IMG.artemis, type: 'live', modality: 'online', startsAt: at(2, 20, 0), endsAt: at(2, 21, 15),
    streamUrl: 'https://www.youtube.com/@horizonte', organizer: org.horizonte, capacity: 2000, registeredCount: 1384,
    speakers: [S.beatriz, S.rafael],
    schedule: [
      { id: 'sc1', time: '20:00', title: 'Por que voltar à Lua?', speakerId: 'sp5' },
      { id: 'sc2', time: '20:30', title: 'O que aprendemos com a Artemis II', speakerId: 'sp5' },
      { id: 'sc3', time: '20:50', title: 'Perguntas do chat', speakerId: 'sp2' },
    ],
    topics: ['fisica-classica'], tags: ['live', 'exploração', 'Artemis'], featured: true,
  },
  {
    id: 'ev-6', slug: 'seminario-gravitacao-quantica', title: 'Seminário: caminhos para a gravitação quântica',
    summary: 'Cordas, laços e holografia: uma visão comparativa das principais abordagens.',
    description: 'Seminário voltado a estudantes de graduação e pós-graduação em física. Discutiremos por que a relatividade geral e a mecânica quântica não se combinam facilmente, e o que cada programa de pesquisa propõe. Recomenda-se familiaridade com relatividade especial e mecânica quântica introdutória.',
    cover: IMG.abell, type: 'seminario', modality: 'online', startsAt: at(12, 14, 0), endsAt: at(12, 16, 0),
    streamUrl: 'https://meet.example.org/gravitacao', organizer: org.sab, capacity: 300, registeredCount: 117, registrationDeadline: at(1, 12, 0),
    statusOverride: 'closed',
    speakers: [S.marina],
    schedule: [
      { id: 'sc1', time: '14:00', title: 'O problema da gravitação quântica', speakerId: 'sp3' },
      { id: 'sc2', time: '14:45', title: 'Holografia e AdS/CFT', speakerId: 'sp3' },
      { id: 'sc3', time: '15:30', title: 'Discussão aberta' },
    ],
    topics: ['relatividade-geral', 'mecanica-quantica'], tags: ['seminário', 'teoria'],
  },
  {
    id: 'ev-7', slug: 'encontro-mulheres-na-astronomia', title: 'Encontro: mulheres na astronomia e na física',
    summary: 'Trajetórias, desafios e conquistas de pesquisadoras brasileiras, com roda de conversa e mentoria.',
    description: 'Um encontro para estudantes do ensino médio e graduação conhecerem a carreira científica a partir da experiência de pesquisadoras. Haverá roda de conversa, sessões de mentoria em pequenos grupos e visita guiada ao observatório.',
    cover: IMG.carina, type: 'encontro', modality: 'hibrido', startsAt: at(23, 10, 0), endsAt: at(23, 16, 0),
    location: { venue: 'Observatório Universitário', address: 'Campus Central', city: 'Belo Horizonte, MG' },
    streamUrl: 'https://www.youtube.com/@horizonte', organizer: org.horizonte, capacity: 150, registeredCount: 63,
    speakers: [S.helena, S.marina, S.luiza, S.beatriz],
    schedule: [
      { id: 'sc1', time: '10:00', title: 'Abertura e boas-vindas' },
      { id: 'sc2', time: '10:30', title: 'Roda de conversa: trajetórias', speakerId: 'sp1' },
      { id: 'sc3', time: '13:30', title: 'Mentorias em pequenos grupos', speakerId: 'sp7' },
      { id: 'sc4', time: '15:00', title: 'Visita ao observatório', speakerId: 'sp5' },
    ],
    topics: ['astronomia-observacional', 'astrofisica'], tags: ['encontro', 'carreira', 'diversidade'],
  },
  {
    id: 'ev-8', slug: 'palestra-materia-escura-caca', title: 'A caça à matéria escura: detectores no subsolo',
    summary: 'Como experimentos a quilômetros de profundidade tentam flagrar partículas que não emitem luz.',
    description: 'Daniel Ferraz apresenta os experimentos de detecção direta de matéria escura e o que seus resultados nulos nos ensinam. Palestra gravada e disponível na biblioteca multimídia.',
    cover: IMG.darkMatterCore, type: 'palestra', modality: 'online', startsAt: at(-12, 19, 0), endsAt: at(-12, 20, 30),
    streamUrl: 'https://www.youtube.com/@horizonte', organizer: org.horizonte, capacity: 1000, registeredCount: 812,
    speakers: [S.daniel],
    schedule: [
      { id: 'sc1', time: '19:00', title: 'Evidências da matéria escura', speakerId: 'sp4' },
      { id: 'sc2', time: '19:40', title: 'Detectores de xenônio líquido', speakerId: 'sp4' },
    ],
    topics: ['materia-escura', 'fisica-de-particulas'], tags: ['palestra', 'matéria escura'],
  },
  {
    id: 'ev-9', slug: 'observacao-chuva-de-meteoros-geminidas', title: 'Observação da chuva de meteoros Geminídeas',
    summary: 'Uma das chuvas mais intensas do ano, observada a olho nu em local de céu escuro.',
    description: 'As Geminídeas podem produzir mais de 100 meteoros por hora no pico. Levaremos o grupo a um local afastado das luzes da cidade, com cadeiras reclináveis, bebidas quentes e explicações sobre a origem do fenômeno no asteroide 3200 Faetonte.',
    cover: IMG.earthNight, type: 'observacao', modality: 'presencial', startsAt: at(19, 22, 0), endsAt: at(20, 3, 0),
    location: { venue: 'Mirante da Serra', address: 'Rodovia SP-50, km 180', city: 'Campos do Jordão, SP' },
    organizer: org.clube, capacity: 60, registeredCount: 41, registrationDeadline: at(18, 18, 0),
    speakers: [S.joao],
    schedule: [
      { id: 'sc1', time: '22:00', title: 'Chegada e acomodação' },
      { id: 'sc2', time: '22:30', title: 'De onde vêm os meteoros?', speakerId: 'sp6' },
      { id: 'sc3', time: '23:00', title: 'Observação livre até o amanhecer' },
    ],
    topics: ['astronomia-observacional'], tags: ['observação', 'meteoros'],
  },
  {
    id: 'ev-10', slug: 'workshop-python-para-astronomia', title: 'Workshop: Python para análise de dados astronômicos',
    summary: 'Astropy, curvas de luz e imagens FITS em uma oficina prática de oito horas.',
    description: 'Oficina introdutória de análise de dados com Python, voltada a estudantes e entusiastas. Trabalharemos com dados públicos do TESS e do Hubble. Cada participante deve trazer seu notebook com Python 3.11 instalado.',
    cover: IMG.solarFlare, type: 'workshop', modality: 'online', startsAt: at(-30, 9, 0), endsAt: at(-30, 17, 0),
    streamUrl: 'https://meet.example.org/python-astro', organizer: org.horizonte, capacity: 80, registeredCount: 80,
    speakers: [S.luiza, S.rafael],
    schedule: [
      { id: 'sc1', time: '09:00', title: 'Introdução ao Astropy', speakerId: 'sp7' },
      { id: 'sc2', time: '13:00', title: 'Curvas de luz do TESS', speakerId: 'sp2' },
    ],
    topics: ['astronomia-observacional'], tags: ['workshop', 'programação', 'dados'],
  },
];
