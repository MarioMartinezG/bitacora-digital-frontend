export interface User {
  id: number;
  username: string;
  roles: number[];
  role?: number; // Compatibilidad con backend legacy
  nombre: string;
  correo: string;
}

export interface AuthSuccessResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  expires_in: number; // segundos
  user: User;
  requiere_cambio_clave: boolean;
}

export interface AuthErrorResponse {
  message: string;
  error_code: string;
}

export interface LogoutResponse {
  message: string;
  timestamp: string;
}

/**
 * Normaliza el usuario para asegurar que siempre tenga roles[].
 * Si viene del backend viejo con solo 'role', lo convierte a 'roles[]'.
 */
export function normalizeUserRoles(user: User): User {
  if (user.roles && user.roles.length > 0) {
    return {
      ...user,
      role: user.role ?? user.roles[0]
    };
  }

  if (user.role && (!user.roles || user.roles.length === 0)) {
    return {
      ...user,
      roles: [user.role]
    };
  }

  return user;
}
