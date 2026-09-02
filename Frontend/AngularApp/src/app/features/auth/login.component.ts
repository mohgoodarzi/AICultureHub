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
    <div class="login-page">
      <!-- Animated background -->
      <div class="bg-layer">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="grid-overlay"></div>
      </div>

      <div class="login-shell">
        <!-- Brand hero panel -->
        <div class="brand-panel">
          <div class="brand-chip">✦ سامانه هوش مصنوعی سازمانی</div>
          <h2>آیندهٔ کار،<br>هوشمند می‌سازیم</h2>
          <p>پلتفرم ترویج فرهنگ هوش مصنوعی و تحول دیجیتال — آموزش، مقالات، آزمون و رقابت در یک تجربهٔ یکپارچه.</p>
          <div class="brand-features">
            <div class="feature-row"><span class="feature-dot">◆</span> یادگیری شخصی‌سازی‌شده با مسیر امتیاز</div>
            <div class="feature-row"><span class="feature-dot">◆</span> مقالات و دوره‌های به‌روز AI</div>
            <div class="feature-row"><span class="feature-dot">◆</span> آزمون‌ها و جدول امتیازات رقابتی</div>
          </div>
          <div class="brand-ring r1"></div>
          <div class="brand-ring r2"></div>
        </div>

        <!-- Login card -->
        <div class="login-card animate-fade-up">
          <div class="login-header">
            <img src="assets/logo.png" alt="شرکت طراحی و ساختمان نفت" class="login-logo">
            <h1>شرکت طراحی و ساختمان نفت</h1>
            <p>برای ادامه وارد حساب خود شوید</p>
          </div>
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="form-group">
              <label for="username">نام کاربری</label>
              <input type="text" id="username" name="username" [(ngModel)]="credentials.username" required placeholder="نام کاربری خود را وارد کنید" autocomplete="username">
            </div>
            <div class="form-group">
              <label for="password">رمز عبور</label>
              <input type="password" id="password" name="password" [(ngModel)]="credentials.password" required placeholder="رمز عبور خود را وارد کنید" autocomplete="current-password">
            </div>
            <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
            <button type="submit" class="btn-primary btn-submit" [disabled]="isLoading">
              <span *ngIf="isLoading" class="spinner"></span>
              {{ isLoading ? 'در حال ورود...' : 'ورود به سیستم' }}
            </button>
          </form>
          <div class="login-footer">
            <p>حساب کاربری ندارید؟ <a routerLink="/register">ثبت‌نام کنید</a></p>
          </div>
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
      position: relative;
      overflow: hidden;
      padding: 24px;
      background:
        radial-gradient(1000px 600px at 85% 10%, color-mix(in srgb, var(--theme-primary) 16%, transparent), transparent 60%),
        radial-gradient(900px 500px at 10% 90%, color-mix(in srgb, var(--theme-secondary) 14%, transparent), transparent 55%),
        var(--theme-background);
    }

    /* Animated orbs */
    .bg-layer { position: absolute; inset: 0; pointer-events: none; }
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(70px);
      opacity: 0.35;
      animation: floatY 9s ease-in-out infinite;
    }
    .orb-1 { width: 380px; height: 380px; background: var(--theme-primary); top: -120px; right: -80px; }
    .orb-2 { width: 320px; height: 320px; background: var(--theme-secondary); bottom: -100px; left: -60px; animation-delay: 2s; }
    .orb-3 { width: 200px; height: 200px; background: var(--theme-accent); top: 55%; left: 42%; opacity: 0.18; animation-delay: 4s; }

    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(color-mix(in srgb, var(--theme-primary) 7%, transparent) 1px, transparent 1px),
        linear-gradient(90deg, color-mix(in srgb, var(--theme-primary) 7%, transparent) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(720px 520px at 50% 50%, #000 20%, transparent 80%);
      -webkit-mask-image: radial-gradient(720px 520px at 50% 50%, #000 20%, transparent 80%);
      animation: gridDrift 14s linear infinite;
    }

    .login-shell {
      position: relative;
      display: flex;
      align-items: stretch;
      gap: 0;
      max-width: 980px;
      width: 100%;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      background: color-mix(in srgb, var(--theme-surface) 92%, transparent);
      backdrop-filter: blur(20px);
      border: 1px solid color-mix(in srgb, var(--theme-border) 80%, transparent);
      z-index: 1;
    }

    /* Brand side */
    .brand-panel {
      flex: 1.1;
      position: relative;
      padding: 56px 48px;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
      background:
        radial-gradient(700px 320px at 85% -10%, rgba(255,255,255,0.16), transparent 60%),
        var(--gradient-brand);
      background-size: 200% 200%;
      animation: gradientShift 12s ease infinite;
    }

    .brand-chip {
      align-self: flex-start;
      padding: 7px 16px;
      border-radius: 100px;
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.3);
      backdrop-filter: blur(8px);
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 26px;
    }

    .brand-panel h2 {
      font-size: 2.1rem;
      font-weight: 900;
      line-height: 1.4;
      margin: 0 0 16px;
      letter-spacing: -0.02em;
    }

    .brand-panel p {
      opacity: 0.9;
      line-height: 2;
      font-size: 0.95rem;
      margin: 0 0 30px;
    }

    .brand-features { display: flex; flex-direction: column; gap: 14px; }

    .feature-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      opacity: 0.94;
    }

    .feature-dot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px; height: 26px;
      border-radius: 8px;
      background: rgba(255,255,255,0.18);
      font-size: 0.65rem;
    }

    .brand-ring {
      position: absolute;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.18);
      pointer-events: none;
    }
    .brand-ring.r1 { width: 340px; height: 340px; top: -140px; left: -120px; animation: floatY 8s ease-in-out infinite; }
    .brand-ring.r2 { width: 220px; height: 220px; bottom: -90px; right: -60px; animation: floatY 10s ease-in-out infinite 2s; }

    /* Card side */
    .login-card {
      flex: 1;
      padding: 52px 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: transparent;
    }

    .login-header { text-align: center; margin-bottom: 34px; }
    .login-header .login-logo {
      max-width: 110px;
      max-height: 74px;
      margin-bottom: 18px;
      filter: drop-shadow(0 6px 16px color-mix(in srgb, var(--theme-primary) 30%, transparent));
    }
    .login-header h1 { margin: 0 0 6px 0; font-size: 1.25rem; color: var(--theme-text); font-weight: 800; }
    .login-header p { color: var(--theme-text-muted); margin: 0; font-size: 0.88rem; }

    .form-group { margin-bottom: 20px; }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 700;
      color: var(--theme-text);
      font-size: 0.88rem;
    }
    .form-group input {
      width: 100%;
      padding: 13px 16px;
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
    .form-group input::placeholder { color: var(--theme-text-muted); }

    .btn-submit {
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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .spinner {
      width: 16px; height: 16px;
      border: 2.5px solid rgba(255,255,255,0.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .error-message {
      color: var(--theme-error);
      font-size: 0.85rem;
      margin-bottom: 16px;
      text-align: center;
      padding: 10px;
      background: color-mix(in srgb, var(--theme-error) 9%, transparent);
      border-radius: 10px;
      border: 1px solid color-mix(in srgb, var(--theme-error) 22%, transparent);
    }

    .login-footer { text-align: center; margin-top: 26px; font-size: 0.9rem; color: var(--theme-text-secondary); }
    .login-footer a {
      color: var(--theme-primary);
      text-decoration: none;
      font-weight: 800;
      transition: all 0.2s ease;
    }
    .login-footer a:hover { text-decoration: underline; }

    @media (max-width: 860px) {
      .brand-panel { display: none; }
      .login-shell { max-width: 440px; }
    }
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

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.login(this.credentials).subscribe({
      next: () => { this.router.navigate(['/dashboard']); },
      error: (err) => { this.errorMessage = err.error?.message || 'نام کاربری یا رمز عبور اشتباه است'; this.isLoading = false; }
    });
  }
}
