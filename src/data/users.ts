import type { Registration, User } from '@/types';
import { daysAgo } from '@/utils/format';
import { events } from './events';

const hues = ['#6C8CFF', '#A78BFA', '#53DDF5', '#F0A35E', '#5FD3A0', '#F27A8A', '#E7C35A'];

type Seed = [name: string, email: string, role: User['role'], status: User['status'], location: string, interests: string[]];

const seeds: Seed[] = [
  ['Marcony Cunha', 'admin@singularii.ciencia', 'superadmin', 'active', 'Fortaleza, CE', ['cosmologia', 'buracos-negros']],
  ['Marcony Cunha', 'administrador@singularii.ciencia', 'admin', 'active', 'Fortaleza, CE', ['astrofisica']],
  ['Marcony Cunha', 'editora@singularii.ciencia', 'editor', 'active', 'Fortaleza, CE', ['mecanica-quantica', 'fisica-de-particulas']],
  ['Marcony Cunha', 'colaborador@singularii.ciencia', 'colaborador', 'active', 'Fortaleza, CE', ['astronomia-observacional']],
  ['Marcony Cunha', 'leitor@singularii.ciencia', 'leitor', 'active', 'Fortaleza, CE', ['buracos-negros', 'astronomia-observacional', 'cosmologia']],
  ['Pedro Henrique Alves', 'pedro.alves@example.com', 'leitor', 'active', 'Porto Alegre, RS', ['relatividade-geral']],
  ['Juliana Costa', 'juliana.costa@example.com', 'leitor', 'active', 'Salvador, BA', ['astrofisica', 'materia-escura']],
  ['Marcos Vinícius Lima', 'marcos.lima@example.com', 'leitor', 'pending', 'Fortaleza, CE', ['fisica-classica']],
  ['Fernanda Rocha', 'fernanda.rocha@example.com', 'leitor', 'active', 'Florianópolis, SC', ['cosmologia', 'energia-escura']],
  ['Gustavo Pereira', 'gustavo.p@example.com', 'leitor', 'suspended', 'Manaus, AM', ['fisica-de-particulas']],
  ['Isabela Moura', 'isabela.moura@example.com', 'leitor', 'active', 'Goiânia, GO', ['astronomia-observacional']],
  ['Rodrigo Teixeira', 'rodrigo.t@example.com', 'colaborador', 'active', 'Brasília, DF', ['exploracao-espacial']],
  ['Sofia Barbosa', 'sofia.barbosa@example.com', 'leitor', 'active', 'Campinas, SP', ['buracos-negros']],
  ['Thiago Mendes', 'thiago.mendes@example.com', 'leitor', 'active', 'Natal, RN', ['mecanica-quantica']],
  ['Valentina Araújo', 'valentina.a@example.com', 'leitor', 'pending', 'Belém, PA', ['materia-escura']],
  ['Eduardo Campos', 'eduardo.campos@example.com', 'editor', 'active', 'Vitória, ES', ['cosmologia']],
];

export const users: User[] = seeds.map(([name, email, role, status, location, interests], i) => ({
  id: `u${i + 1}`,
  name,
  email,
  role,
  status,
  location,
  interests,
  createdAt: daysAgo(400 - i * 23),
  lastSeenAt: daysAgo(i % 9),
  newsletter: i % 3 !== 0,
  hue: hues[i % hues.length]!,
  bio: role === 'leitor' ? 'Curiosa pelo céu desde criança, frequenta observações do clube local.' : 'Equipe editorial da SingularII.',
}));

/** Demo passwords (simulated auth only — never real credentials). */
export const DEMO_PASSWORD = 'cosmos123';

const code = (i: number) => `HZ-${(48213 + i * 977).toString(36).toUpperCase()}`;

export const registrations: Registration[] = (() => {
  const out: Registration[] = [];
  let i = 0;
  for (const ev of events) {
    const count = Math.min(ev.registeredCount, 14);
    for (let k = 0; k < count; k++) {
      const u = users[4 + ((k * 5 + ev.id.length) % (users.length - 4))]!; // readers only
      const anon = k > 8;
      out.push({
        id: `reg-${++i}`,
        eventId: ev.id,
        userId: anon ? undefined : u.id,
        name: anon ? `Participante ${k + 1}` : u.name,
        email: anon ? `participante${i}@example.com` : u.email,
        createdAt: daysAgo(20 - (k % 15)),
        status: k % 7 === 6 ? 'interested' : 'confirmed',
        attended: new Date(ev.endsAt) < new Date() ? k % 4 !== 0 : undefined,
        code: code(i),
      });
    }
  }
  return out;
})();
