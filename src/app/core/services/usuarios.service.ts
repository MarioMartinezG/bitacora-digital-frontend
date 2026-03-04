import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';
import { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseHttpService {
  private readonly BASE_URL = '/api/coordinador/usuarios';

  constructor(http: HttpClient) {
    super(http);
  }

  listarUsuarios(): Observable<Usuario[]> {
    return this.get<Usuario[]>(this.BASE_URL);
  }

  obtenerUsuario(id: number): Observable<Usuario> {
    return this.get<Usuario>(`${this.BASE_URL}/${id}`);
  }

  crearUsuario(data: CreateUsuarioRequest): Observable<Usuario> {
    return this.post<Usuario>(this.BASE_URL, data);
  }

  actualizarUsuario(id: number, data: UpdateUsuarioRequest): Observable<Usuario> {
    return this.put<Usuario>(`${this.BASE_URL}/${id}`, data);
  }

  toggleActivo(id: number): Observable<void> {
    return this.patch<void>(`${this.BASE_URL}/${id}/toggle-activo`, {});
  }
}
