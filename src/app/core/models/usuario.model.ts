import { UserRole } from './role.model';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  roles: number[];
  rolesNombres?: string[];
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string;
}

export interface CreateUsuarioRequest {
  nombre: string;
  correo: string;
  contrasena: string;
  roles: number[];
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  correo?: string;
  contrasena?: string;
  roles?: number[];
  activo?: boolean;
}
