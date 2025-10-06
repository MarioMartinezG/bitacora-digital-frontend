import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { LoginService } from './login.service';


@Injectable({
  providedIn: 'root'
})
export class MenuService extends BaseHttpService {
  loginService: LoginService = inject(LoginService);
  
  constructor(http: HttpClient) {
    super(http);
  }

  getMenuByRole(roleId: number): Observable<MenuItem[]> {
    const token = this.loginService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.get<MenuItem[]>(`/api/menu/${roleId}`, { headers });
  }

  getMyMenu(): Observable<MenuItem[]> {
    return this.get<MenuItem[]>(`/api/menu/my-menu`);
  }
}
