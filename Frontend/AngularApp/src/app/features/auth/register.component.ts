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
      <div class="register-card">
        <div class="register-header">
          <img src="assets/logo.png" alt="شرکت طراحی و ساختمان نفت" class="register-logo">
          <h1>شرکت طراحی و ساختمان نفت</h1>
          <p>سامانه هوش مصنوعی</p>
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
          <div class="form-group">
            <label for="password">رمز عبور</label>
            <input type="password" id="password" name="password" [(ngModel)]="user.password" required>
          </div>
          <div class="form-group">
            <label for="department">دپارتمان</label>
            <input type="text" id="department" name="department" [(ngModel)]="user.department">
          </div>
          <div class="form-group">
            <label for="position">سمت</label>
            <input type="text" id="position" name="position" [(ngModel)]="user.position">
          </div>
          <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
          <button type="submit" class="btn-primary" [disabled]="isLoading">
            {{ isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام' }}
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
      background: var(--theme-background);
      padding: 20px;
      transition: background 0.3s ease;
    }
    .register-card { 
      background: var(--theme-surface); 
      padding: 40px; 
      border-radius: 16px; 
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
      width: 100%; 
      max-width: 480px;
      transition: all 0.3s ease;
    }
    .register-header { text-align: center; margin-bottom: 30px; }
    .register-header .register-logo { max-width: 100px; max-height: 70px; margin-bottom: 12px; }
    .register-header h1 { margin: 0 0 8px 0; font-size: 1.2rem; color: var(--theme-text); font-weight: 600; }
    .register-header p { color: var(--theme-text-secondary); margin: 0; font-size: 0.9rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: var(--theme-text); font-size: 0.85rem; }
    .form-group input { 
      width: 100%; 
      padding: 10px 14px; 
      border: 1px solid var(--theme-border); 
      border-radius: 8px; 
      font-size: 0.95rem; 
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
      margin-bottom: 12px; 
      text-align: center; 
      padding: 10px;
      background: rgba(196, 122, 122, 0.1);
      border-radius: 6px;
    }
    .register-footer { text-align: center; margin-top: 20px; font-size: 0.9rem; color: var(--theme-text-secondary); }
    .register-footer a { color: var(--theme-primary); text-decoration: none; font-weight: 500; }
    .register-footer a:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent {
  user = { username: '', email: '', password: '', firstName: '', lastName: '', department: '', position: '' };
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private themeService: ThemeService
  ) {}

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.register(this.user as any).subscribe({
      next: () => { this.router.navigate(['/dashboard']); },
      error: (err) => { this.errorMessage = err.error?.message || 'خطا در ثبت‌نام'; this.isLoading = false; }
    });
  }
}
