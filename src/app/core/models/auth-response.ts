export interface AuthSuccessResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  expires_in: number; // segundos
  user: {
    id: string;
    username: string;
    role: number;
  };
}

export interface AuthErrorResponse {
  message: string;
  error_code: string;
}