import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { ApiError } from '../models';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseHttpService {
  protected constructor(protected http: HttpClient) { }

  protected handleRequest<T>(observable: Observable<any>): Observable<T> {
    return observable.pipe(
      map(response => response),
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  protected handleError(error: HttpErrorResponse): Observable<never> {
    // Manejar diferentes tipos de respuestas de error
    let customError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      customError = {
        status: 0,
        error: 'ClientError',
        message: 'Error de conexión con el servidor',
        timestamp: new Date().toISOString()
      };
    } else if (typeof error.error === 'string') {
      // El servidor devolvió HTML o texto plano
      try {
        // Intentar parsear como JSON si es un string que contiene JSON
        const parsedError = JSON.parse(error.error);
        customError = {
          status: error.status,
          error: parsedError.error || 'Error desconocido',
          message: parsedError.message || error.message,
          timestamp: parsedError.timestamp || new Date().toISOString()
        };
      } catch (e) {
        // Es HTML o texto plano
        customError = {
          status: error.status,
          error: 'HttpError',
          message: this.getErrorMessageFromStatus(error.status),
          timestamp: new Date().toISOString()
        };
      }
    } else {
      // Es un objeto JSON normal
      customError = {
        status: error.status,
        error: error.error?.error || 'Error desconocido',
        message: error.error?.message || error.message,
        timestamp: error.error?.timestamp || new Date().toISOString()
      };
    }

    console.error('HTTP Error:', customError);
    return throwError(() => customError);
  }

  private getErrorMessageFromStatus(status: number): string {
    const messages: { [key: number]: string } = {
      0: 'Error de conexión con el servidor',
      401: 'No autorizado - Token inválido o expirado',
      403: 'Acceso denegado',
      404: 'Recurso no encontrado',
      500: 'Error interno del servidor',
      502: 'Bad Gateway',
      503: 'Servicio no disponible'
    };

    return messages[status] || `Error HTTP ${status}`;
  }

  protected get<T>(url: string, options: { headers?: HttpHeaders, params?: HttpParams } = {}): Observable<T> {
    return this.handleRequest<T>(this.http.get<T>(url, options));
  }

  protected post<T>(url: string, body: any, options: { headers?: HttpHeaders, params?: HttpParams } = {}): Observable<T> {
    return this.handleRequest<T>(this.http.post<T>(url, body, options));
  }

  protected put<T>(url: string, body: any, options: { headers?: HttpHeaders, params?: HttpParams } = {}): Observable<T> {
    return this.handleRequest<T>(this.http.put<T>(url, body, options));
  }

  protected delete<T>(url: string, options: { headers?: HttpHeaders, params?: HttpParams } = {}): Observable<T> {
    return this.handleRequest<T>(this.http.delete<T>(url, options));
  }

  // 🔧 MÉTODOS SIN HEADERS (para compatibilidad)
  protected getSimple<T>(url: string): Observable<T> {
    return this.get<T>(url);
  }

  protected postSimple<T>(url: string, body: any): Observable<T> {
    return this.post<T>(url, body);
  }
}