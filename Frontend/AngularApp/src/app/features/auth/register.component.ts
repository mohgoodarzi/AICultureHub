import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-page">
      <div class="bg-layer">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="grid-overlay"></div>
      </div>

      <div class="register-card animate-fade-up">
        <div class="register-header">
          <img src="assets/logo.png" alt="شرکت طراحی و ساختمان نفت" class="register-logo">
          <h1>شرکت طراحی و ساختمان نفت</h1>
          <p>به پلتفرم هوش مصنوعی بپیوندید</p>
        </div>
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">نام</label>
              <input type="text" id="firstName" name="firstName" [(ngModel)]="user.firstName" required>
            </div>
            <div class="form-group">
              <label for="lastName">نام خانوادگی</label>
              <input type="text" id="lastName" name="lastName" [(ngModel)]="user.lastName" required>
            </div>
          </div>
          <div class="form-group">
            <label for="username">نام کاربری</label>
            <input type="text" id="username" name="username" [(ngModel)]="user.username" required>
          </div>
          <div class="form-group">
            <label for="email">ایمیل</label>
            <input type="email" id="email" name="email" [(ngModel)]="user.email" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="password">رمز عبور</label>
              <input type="password" id="password" name="password" [(ngModel)]="user.password" required>
            </div>
            <div class="form-group">
              <label for="department">دپارتمان</label>
              <input type="text" id="department" name="department" [(ngModel)]="user.department">
            </div>
          </div>
          <div class="form-group">
            <label for="position">سمت</label>
            <input type="text" id="position" name="position" [(ngModel)]="user.position">
          </div>
          <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
          <button type="submit" class="btn-primary" [disabled]="isLoading">
            {{ isLoading ? 'در حال ثبت‌نام...' : 'ساخت حساب کاربری' }}
          </button>
        </form>
        <div class="register-footer">
          <p>حساب کاربری دارید؟ <a routerLink="/login">وارد شوید</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(900px 500px at 15% 10%, color-mix(in srgb, var(--theme-primary) 14%, transparent), transparent 55%),
        radial-gradient(800px 500px at 90% 90%, color-mix(in srgb, var(--theme-secondary) 12%, transparent), transparent 55%),
        var(--theme-background);
      padding: 32px 20px;
      position: relative;
      overflow: hidden;
    }

    .bg-layer { position: absolute; inset: 0; pointer-events: none; }
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: floatY 9s ease-in-out infinite;
    }
    .orb-1 { width: 360px; height: 360px; background: var(--theme-primary); top: -140px; left: -100px; }
    .orb-2 { width: 300px; height: 300px; background: var(--theme-secondary); bottom: -120px; right: -80px; animation-delay: 3s; }

    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(color-mix(in srgb, var(--theme-primary) 6%, transparent) 1px, transparent 1px),
        linear-gradient(90deg, color-mix(in srgb, var(--theme-primary) 6%, transparent) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(700px 520px at 50% 50%, #000 20%, transparent 80%);
      -webkit-mask-image: radial-gradient(700px 520px at 50% 50%, #000 20%, transparent 80%);
      animation: gridDrift 16s linear infinite;
    }

    .register-card {
      position: relative;
      z-index: 1;
      background: color-mix(in srgb, var(--theme-surface) 94%, transparent);
      backdrop-filter: blur(16px);
      padding: 42px 44px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      border: 1px solid color-mix(in srgb, var(--theme-border) 80%, transparent);
      width: 100%;
      max-width: 560px;
    }

    .register-header { text-align: center; margin-bottom: 30px; }
    .register-header .register-logo {
      max-width: 100px;
      max-height: 68px;
      margin-bottom: 12px;
      filter: drop-shadow(0 6px 16px color-mix(in srgb, var(--theme-primary) 30%, transparent));
    }
    .register-header h1 { margin: 0 0 6px 0; font-size: 1.2rem; color: var(--theme-text); font-weight: 800; }
    .register-header p { color: var(--theme-text-muted); margin: 0; font-size: 0.88rem; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 700; color: var(--theme-text); font-size: 0.85rem; }
    .form-group input {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid var(--theme-border);
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.25s var(--ease-smooth);
      box-sizing: border-box;
      background: var(--theme-surface);
      color: var(--theme-text);
    }
    .form-group input:focus {
      outline: none;
      border-color: var(--theme-primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 12%, transparent);
    }

    .btn-primary {
      width: 100%;
      padding: 14px;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.25s var(--ease-smooth);
      margin-top: 8px;
    }

    .register-footer { text-align: center; margin-top: 22px; font-size: 0.9rem; color: var(--theme-text-secondary); }
    .register-footer a { color: var(--theme-primary); text-decoration: none; font-weight: 800; }
    .register-footer a:hover { text-decoration: underline; }

    @media (max-width: 560px) {
      .form-row { grid-template-columns: 1fr; gap: 0; }
      .register-card { padding: 32px 24px; }
    }
  `]
})
export class RegisterComponent {
  user = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    department: '',
    position: ''
  };
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  onSubmit(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.register(this.user as any).subscribe({
      next: () => { this.router.navigate(['/dashboard']); },
      error: (err) => { this.errorMessage = err.error?.message || 'خطا در ثبت‌نام'; this.isLoading = false; }
    });
  }
}
