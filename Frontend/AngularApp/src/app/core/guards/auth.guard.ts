import { Injectable, inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }
    this.router.navigate(['/dashboard']);
    return false;
  }
}

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
    const permission = route.data['permission'] as string;
    if (!permission) return true;

    // On refresh the permissions may not be loaded yet - wait for them first
    return this.authService.ensurePermissions().pipe(
      map(() => {
        if (this.authService.hasPermission(permission)) {
          return true;
        }
        this.router.navigate(['/dashboard']);
        return false;
      })
    );
  }
}
