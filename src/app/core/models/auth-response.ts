export interface AuthSuccessResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  expires_in: number; // segundos
  user: {
    id: number;
    username: string;
    role: number;
    nombre: string;
    correo: string;
  };
}

export interface AuthErrorResponse {
  message: string;
  error_code: string;
}