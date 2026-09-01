import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, UserDto } from '../models/auth.model';

export interface UserPermissions {
  userId: number;
  username: string;
  permissions: string[];
  modules: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<UserDto | null>(null);
  public user$ = this.userSubject.asObservable();
  private permissionsSubject = new BehaviorSubject<UserPermissions | null>(null);
  public permissions$ = this.permissionsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.userSubject.next(user);
        this.loadPermissions(user.id);
      } catch {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return new Observable(observer => {
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('tokenExpiry', response.expiresAt);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.userSubject.next(response.user);
          this.loadPermissions(response.user.id);
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  register(user: RegisterRequest): Observable<UserDto> {
    return this.http.post<UserDto>(`${environment.apiUrl}/auth/register`, user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.permissionsSubject.next(null);
  }

  refreshUser(): void {
    this.http.get<UserDto>(`${environment.apiUrl}/auth/me`).subscribe({
      next: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
      }
    });
  }

  user(): UserDto | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    const expiry = localStorage.getItem('tokenExpiry');
    if (expiry && new Date(expiry) < new Date()) {
      this.logout();
      return false;
    }
    return true;
  }

  isAdmin(): boolean {
    const user = this.userSubject.value;
    return user?.roles?.includes('Administrator') ?? false;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  loadPermissions(userId: number): void {
    this.http.get<UserPermissions>(`${environment.apiUrl}/roles/user/${userId}/permissions`).subscribe({
      next: (perms) => {
        this.permissionsSubject.next(perms);
      }
    });
  }

  hasPermission(permission: string): boolean {
    const perms = this.permissionsSubject.value;
    return perms?.permissions.includes(permission) ?? false;
  }

  hasAnyPermission(permissions: string[]): boolean {
    const perms = this.permissionsSubject.value;
    return permissions.some(p => perms?.permissions.includes(p)) ?? false;
  }

  hasModule(module: string): boolean {
    const perms = this.permissionsSubject.value;
    return perms?.modules.includes(module) ?? false;
  }

  clearPermissions(): void {
    this.permissionsSubject.next(null);
  }
}
