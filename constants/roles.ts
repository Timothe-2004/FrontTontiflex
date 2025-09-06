export const ROLES = {
  CLIENT: 'CLIENT',
  AGENT_SFD: 'AGENT_SFD',
  SUPERVISEUR_SFD: 'SUPERVISEUR_SFD',
  ADMIN_SFD: 'ADMIN_SFD',
  ADMIN_PLATEFORME: 'ADMIN_PLATEFORME'
} as const;

export type UserRole = keyof typeof ROLES;

export type RoleKey = 'CLIENT' | 'AGENT_SFD' | 'SUPERVISEUR_SFD' | 'ADMIN_SFD' | 'ADMIN_PLATEFORME';

export const ROLE_MAPPING: Record<RoleKey, string> = {
  [ROLES.ADMIN_PLATEFORME]: 'admin',
  [ROLES.ADMIN_SFD]: 'adminsfd',
  [ROLES.CLIENT]: 'client',
  [ROLES.AGENT_SFD]: 'agent',
  [ROLES.SUPERVISEUR_SFD]: 'supervisor'
} as const;

export const DEFAULT_ROUTES: Record<RoleKey, string> = {
  [ROLES.ADMIN_PLATEFORME]: '/dashboards/dashboard-admin_tontiflex',
  [ROLES.ADMIN_SFD]: '/dashboards/dashboard-adminsfd',
  [ROLES.CLIENT]: '/dashboards/dashboard-client',
  [ROLES.AGENT_SFD]: '/dashboards/dashboard-agent',
  [ROLES.SUPERVISEUR_SFD]: '/dashboards/dashboard-supervisor'
} as const;
