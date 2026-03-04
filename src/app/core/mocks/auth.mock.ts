import { AuthSuccessResponse } from '../models';
import { UserRole } from '../models/role.model';

export const MOCK_USERS: Record<string, AuthSuccessResponse> = {
  estudiante: {
    message: 'Login exitoso',
    access_token: 'mock_token_estudiante',
    refresh_token: 'mock_refresh_estudiante',
    expires_in: 3600,
    user: {
      id: 1,
      username: 'estudiante01',
      roles: [UserRole.ESTUDIANTE],
      role: UserRole.ESTUDIANTE,
      nombre: 'Juan Pérez',
      correo: 'juan.perez@ejemplo.com'
    }
  },

  tutor: {
    message: 'Login exitoso',
    access_token: 'mock_token_tutor',
    refresh_token: 'mock_refresh_tutor',
    expires_in: 3600,
    user: {
      id: 2,
      username: 'tutor01',
      roles: [UserRole.TUTOR],
      role: UserRole.TUTOR,
      nombre: 'María García',
      correo: 'maria.garcia@ejemplo.com'
    }
  },

  coordinador: {
    message: 'Login exitoso',
    access_token: 'mock_token_coordinador',
    refresh_token: 'mock_refresh_coordinador',
    expires_in: 3600,
    user: {
      id: 3,
      username: 'coordinador01',
      roles: [UserRole.COORDINADOR],
      role: UserRole.COORDINADOR,
      nombre: 'Carlos Rodríguez',
      correo: 'carlos.rodriguez@ejemplo.com'
    }
  },

  coordinadorTutor: {
    message: 'Login exitoso',
    access_token: 'mock_token_coord_tutor',
    refresh_token: 'mock_refresh_coord_tutor',
    expires_in: 3600,
    user: {
      id: 4,
      username: 'admin01',
      roles: [UserRole.COORDINADOR, UserRole.TUTOR],
      role: UserRole.COORDINADOR,
      nombre: 'Ana Martínez',
      correo: 'ana.martinez@ejemplo.com'
    }
  }
};
