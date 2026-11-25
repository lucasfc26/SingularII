import type { Role } from '@/types';

export type Permission =
  | 'dashboard:view'
  | 'content:create'
  | 'content:edit'
  | 'content:publish'
  | 'content:delete'
  | 'taxonomy:manage'
  | 'events:manage'
  | 'events:delete'
  | 'media:upload'
  | 'media:delete'
  | 'users:view'
  | 'users:manage'
  | 'admins:manage'
  | 'settings:manage';

export const ROLE_LABEL: Record<Role, string> = {
  superadmin: 'Superadministrador',
  admin: 'Administrador',
  editor: 'Editor',
  colaborador: 'Colaborador',
  leitor: 'Leitor',
};

export const ADMIN_ROLES: Role[] = ['superadmin', 'admin', 'editor', 'colaborador'];

export const PERMISSION_LABEL: Record<Permission, string> = {
  'dashboard:view': 'Ver painel',
  'content:create': 'Criar conteúdos',
  'content:edit': 'Editar conteúdos',
  'content:publish': 'Publicar e agendar',
  'content:delete': 'Excluir conteúdos',
  'taxonomy:manage': 'Gerenciar categorias e tags',
  'events:manage': 'Gerenciar eventos',
  'events:delete': 'Excluir eventos',
  'media:upload': 'Enviar mídia',
  'media:delete': 'Excluir mídia',
  'users:view': 'Ver usuários',
  'users:manage': 'Gerenciar usuários',
  'admins:manage': 'Gerenciar administradores',
  'settings:manage': 'Configurações da plataforma',
};

const ALL = Object.keys(PERMISSION_LABEL) as Permission[];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  superadmin: ALL,
  admin: ALL.filter((p) => p !== 'admins:manage'),
  editor: [
    'dashboard:view',
    'content:create',
    'content:edit',
    'content:publish',
    'content:delete',
    'taxonomy:manage',
    'events:manage',
    'media:upload',
    'media:delete',
    'users:view',
  ],
  colaborador: ['dashboard:view', 'content:create', 'content:edit', 'media:upload'],
  leitor: [],
};

export const can = (role: Role | undefined, permission: Permission) =>
  !!role && ROLE_PERMISSIONS[role].includes(permission);

export const isStaff = (role?: Role) => !!role && ADMIN_ROLES.includes(role);
