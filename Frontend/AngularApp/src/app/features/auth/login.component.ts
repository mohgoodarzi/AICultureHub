import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page" [style.background]="loginBgStyle">
      <div class="login-card">
        <div class="login-header">
          <img src="assets/logo.png" alt="شرکت طراحی و ساختمان نفت" class="login-logo">
          <h1>شرکت طراحی و ساختمان نفت</h1>
          <p>سامانه آموزش و ارزیابی</p>
        </div>
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">نام کاربری</label>
            <input type="text" id="username" name="username" [(ngModel)]="credentials.username" required placeholder="نام کاربری خود را وارد کنید">
          </div>
          <div class="form-group">
            <label for="password">رمز عبور</label>
            <input type="password" id="password" name="password" [(ngModel)]="credentials.password" required placeholder="رمز عبور خود را وارد کنید">
          </div>
          <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
          <button type="submit" class="btn-primary" [disabled]="isLoading">
            {{ isLoading ? 'در حال ورود...' : 'ورود به سیستم' }}
          </button>
        </form>
        <div class="login-footer">
          <p>حساب کاربری ندارید؟ <a routerLink="/register">ثبت‌نام کنید</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page { 
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      background: var(--theme-background);
      transition: background 0.3s ease;
    }
    .login-card { 
      background: var(--theme-surface); 
      padding: 48px; 
      border-radius: 16px; 
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
      width: 100%; 
      max-width: 400px;
      transition: all 0.3s ease;
    }
    .login-header { text-align: center; margin-bottom: 36px; }
    .login-header .login-logo { max-width: 120px; max-height: 80px; margin-bottom: 16px; }
    .login-header h1 { margin: 0 0 8px 0; font-size: 1.3rem; color: var(--theme-text); font-weight: 600; }
    .login-header p { color: var(--theme-text-secondary); margin: 0; font-size: 0.9rem; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--theme-text); font-size: 0.9rem; }
    .form-group input { 
      width: 100%; 
      padding: 12px 16px; 
      border: 1px solid var(--theme-border); 
      border-radius: 8px; 
      font-size: 1rem; 
      transition: all 0.2s ease; 
      box-sizing: border-box; 
      background: var(--theme-surface); 
      color: var(--theme-text); 
    }
    .form-group input:focus { 
      outline: none; 
      border-color: var(--theme-primary);
      box-shadow: 0 0 0 3px rgba(122, 158, 126, 0.1);
    }
    .form-group input::placeholder {
      color: var(--theme-text-muted);
    }
    .btn-primary { 
      width: 100%; 
      padding: 14px; 
      color: white; 
      border: none; 
      border-radius: 8px; 
      font-size: 1rem; 
      font-weight: 500; 
      cursor: pointer; 
      transition: all 0.2s ease;
      margin-top: 8px;
    }
    .btn-primary:hover { 
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .btn-primary:disabled { 
      opacity: 0.6; 
      cursor: not-allowed; 
      transform: none; 
    }
    .error-message { 
      color: var(--theme-error); 
      font-size: 0.85rem; 
      margin-bottom: 16px; 
      text-align: center; 
      padding: 10px;
      background: rgba(196, 122, 122, 0.1);
      border-radius: 6px;
    }
    .login-footer { text-align: center; margin-top: 24px; font-size: 0.9rem; color: var(--theme-text-secondary); }
    .login-footer a { color: var(--theme-primary); text-decoration: none; font-weight: 500; }
    .login-footer a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  credentials = { username: '', password: '' };
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private themeService: ThemeService
  ) {}

  get loginBgStyle(): string {
    return `var(--theme-background)`;
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.login(this.credentials).subscribe({
      next: () => { this.router.navigate(['/dashboard']); },
      error: (err) => { this.errorMessage = err.error?.message || 'نام کاربری یا رمز عبور اشتباه است'; this.isLoading = false; }
    });
  }
}
