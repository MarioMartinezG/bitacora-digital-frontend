import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AuthSuccessResponse, LoginRequest } from '../models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService extends BaseHttpService {
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private userKey = 'user_data';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(http: HttpClient) {
    super(http);
  }

  login(loginData: LoginRequest): Observable<AuthSuccessResponse> {
    return this.post<AuthSuccessResponse>(`/api/auth/login`, loginData)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  register(registerData: any): Observable<AuthSuccessResponse> {
    return this.post<AuthSuccessResponse>(`/api/auth/register`, registerData)
      .pipe(
        tap(response => {
          this.storeAuthData(response);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  refreshToken(): Observable<AuthSuccessResponse> {
    const refreshToken = this.getRefreshToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`
    });

    return this.handleRequest<AuthSuccessResponse>(
      this.http.post<AuthSuccessResponse>(`/api/auth/refresh`, {}, { headers })
    ).pipe(
      tap(response => {
        this.storeToken(response.access_token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticatedSubject.next(false);
  }

  private storeAuthData(response: AuthSuccessResponse): void {
    localStorage.setItem(this.tokenKey, response.access_token);
    localStorage.setItem(this.refreshTokenKey, response.refresh_token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

}
