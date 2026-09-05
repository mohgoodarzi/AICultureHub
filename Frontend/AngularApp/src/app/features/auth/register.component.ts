import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { environment } from '../../../environments/environment';

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
              <label for="employeeId">کد پرسنلی</label>
              <input type="text" id="employeeId" name="employeeId" [(ngModel)]="user.employeeId">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="departmentId">واحد سازمانی</label>
              <select id="departmentId" name="departmentId" [(ngModel)]="user.departmentId">
                <option [ngValue]="null">انتخاب واحد...</option>
                <option *ngFor="let dept of departments" [ngValue]="dept.id">{{ dept.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="positionId">سمت</label>
              <select id="positionId" name="positionId" [(ngModel)]="user.positionId">
                <option [ngValue]="null">انتخاب سمت...</option>
                <option *ngFor="let pos of positions" [ngValue]="pos.id">{{ pos.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>تصویر پروفایل (اختیاری)</label>
            <div class="avatar-picker">
              <div class="avatar-preview">
                <img *ngIf="avatarPreview; else defaultAv" [src]="avatarPreview" alt="پیش‌نمایش تصویر">
                <ng-template #defaultAv>
                  <div class="avatar-initial">?</div>
                </ng-template>
              </div>
              <div class="avatar-picker-actions">
                <input type="file" accept="image/jpeg,image/png,image/webp" (change)="onAvatarSelected($event)" #avatarInput hidden>
                <button type="button" class="avatar-btn" (click)="avatarInput.click()">انتخاب تصویر</button>
                <button type="button" class="avatar-btn remove" (click)="removeAvatar()" *ngIf="avatarPreview">حذف</button>
                <small>JPG/PNG/WebP — حداکثر ۱۰ مگابایت</small>
              </div>
            </div>
            <div class="avatar-error" *ngIf="avatarError">{{ avatarError }}</div>
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
    .form-group input, .form-group select {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid var(--theme-border);
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.25s var(--ease-smooth);
      box-sizing: border-box;
      background: var(--theme-surface);
      color: var(--theme-text);
      font-family: inherit;
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

    /* Profile photo picker */
    .avatar-picker { display: flex; align-items: center; gap: 16px; }
    .avatar-preview {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid var(--theme-border);
      background: var(--theme-surface-hover);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .avatar-initial { font-size: 1.5rem; font-weight: 800; color: var(--theme-text-muted); }
    .avatar-picker-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
    .avatar-picker-actions small { color: var(--theme-text-muted); font-size: 0.72rem; }
    .avatar-btn {
      padding: 8px 16px;
      border: 1.5px solid var(--theme-primary);
      background: var(--theme-surface);
      color: var(--theme-primary);
      border-radius: 10px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 700;
      transition: all 0.2s ease;
    }
    .avatar-btn:hover { background: color-mix(in srgb, var(--theme-primary) 10%, transparent); }
    .avatar-btn.remove { border-color: var(--theme-error); color: var(--theme-error); }
    .avatar-btn.remove:hover { background: color-mix(in srgb, var(--theme-error) 10%, transparent); }
    .avatar-error { color: var(--theme-error); font-size: 0.78rem; margin-top: 6px; }

    @media (max-width: 560px) {
      .form-row { grid-template-columns: 1fr; gap: 0; }
      .register-card { padding: 32px 24px; }
    }
  `]
})
export class RegisterComponent implements OnInit {
  user = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    employeeId: '',
    departmentId: null as number | null,
    positionId: null as number | null
  };
  departments: any[] = [];
  positions: any[] = [];
  isLoading = false;
  errorMessage = '';
  avatarFile: File | null = null;
  avatarPreview: string | null = null;
  avatarError = '';
  @ViewChild('avatarInput') avatarInput?: ElementRef<HTMLInputElement>;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.loadMasterData();
  }

  loadMasterData(): void {
    this.http.get<any[]>(`${environment.apiUrl}/auth/departments`).subscribe({
      next: (data) => this.departments = data || [],
      error: () => this.departments = []
    });
    this.http.get<any[]>(`${environment.apiUrl}/auth/positions`).subscribe({
      next: (data) => this.positions = data || [],
      error: () => this.positions = []
    });
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      this.avatarError = 'فقط تصاویر JPG، PNG یا WebP مجاز هستند';
      event.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.avatarError = 'حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد';
      event.target.value = '';
      return;
    }
    this.avatarError = '';
    this.avatarFile = file;
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview = reader.result as string;
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.avatarFile = null;
    this.avatarPreview = null;
    if (this.avatarInput) this.avatarInput.nativeElement.value = '';
  }

  onSubmit(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.register(this.user as any).subscribe({
      next: (response: any) => {
        // Registration returns LoginResponse (token + user): persist session,
        // upload the selected profile photo for the new account, then enter the dashboard.
        if (response?.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('tokenExpiry', new Date(Date.now() + 60 * 60 * 1000).toISOString());
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        if (this.avatarFile) {
          const formData = new FormData();
          formData.append('file', this.avatarFile);
          this.http.post(`${environment.apiUrl}/auth/avatar`, formData).subscribe({
            next: () => { this.router.navigate(['/dashboard']); },
            error: () => { this.router.navigate(['/dashboard']); }
          });
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => { this.errorMessage = err.error?.message || 'خطا در ثبت‌نام'; this.isLoading = false; }
    });
  }
}
