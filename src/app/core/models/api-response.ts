export interface ApiError {
    status: number;       // Código HTTP (ej. 404, 500)
    error: string;        // Nombre o tipo del error (ej. "Bad Request", "Internal Server Error")
    message: string;      // Mensaje legible para el desarrollador/usuario
    timestamp: string;    // Fecha/hora del error en el backend
}

export interface ApiResponse<T> {
  data?: T;             // Payload en caso de éxito
  error?: ApiError;     // Objeto de error en caso de fallo
}