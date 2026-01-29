import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';


@Injectable({
  providedIn: 'root'
})
export class MenuService extends BaseHttpService {

  getMenuByRole(roleId: number): Observable<MenuItem[]> {
    return this.get<MenuItem[]>(`/api/menu/${roleId}`);
  }

  getMyMenu(): Observable<MenuItem[]> {
    return this.get<MenuItem[]>(`/api/menu/my-menu`);
  }
}
