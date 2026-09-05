import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-container" *ngIf="auth.isLoggedIn(); else loginLayout">
      <!-- Overlay backdrop -->
      <div class="sidebar-backdrop" [class.visible]="isExpanded" (click)="collapseSidebar()"></div>
      
      <!-- Sidebar drawer -->
      <nav class="sidebar-drawer" [class.expanded]="isExpanded" (mouseenter)="expandSidebar()" (mouseleave)="collapseSidebar()">
        <div class="sidebar-header">
          <img src="assets/logo.png" alt="شرکت طراحی و ساختمان نفت" class="company-logo" *ngIf="isExpanded">
          <img src="assets/logo.png" alt="Logo" class="company-logo-small" *ngIf="!isExpanded">
          <p class="company-name" *ngIf="isExpanded">شرکت طراحی و ساختمان نفت</p>
        </div>
        
        <ul class="nav-menu">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <span class="icon">🏠</span>
              <span class="nav-label" *ngIf="isExpanded">داشبورد</span>
            </a>
          </li>
          <li *ngIf="auth.hasModule('Articles')">
            <a routerLink="/articles" routerLinkActive="active" class="nav-item">
              <span class="icon">📄</span>
              <span class="nav-label" *ngIf="isExpanded">مقالات</span>
            </a>
          </li>
          <li *ngIf="auth.hasModule('Courses')">
            <a routerLink="/courses" routerLinkActive="active" class="nav-item">
              <span class="icon">📚</span>
              <span class="nav-label" *ngIf="isExpanded">دوره</span>
            </a>
          </li>
          <li *ngIf="auth.hasModule('Quizzes')">
            <a routerLink="/quizzes" routerLinkActive="active" class="nav-item">
              <span class="icon">❓</span>
              <span class="nav-label" *ngIf="isExpanded">آزمون</span>
            </a>
          </li>
          <li>
            <a routerLink="/leaderboard" routerLinkActive="active" class="nav-item">
              <span class="icon">🏆</span>
              <span class="nav-label" *ngIf="isExpanded">جدول امتیازات</span>
            </a>
          </li>
          <li *ngIf="auth.isAdmin()">
            <a routerLink="/admin" routerLinkActive="active" class="nav-item">
              <span class="icon">⚙️</span>
              <span class="nav-label" *ngIf="isExpanded">مدیریت</span>
            </a>
          </li>
          <li>
            <a routerLink="/ai-policy" routerLinkActive="active" class="nav-item">
              <span class="icon">📋</span>
              <span class="nav-label" *ngIf="isExpanded">خط‌مشی AI</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <!-- Main content area with header -->
      <main class="main-wrapper">
        <!-- Top Header -->
        <header class="page-header">
          <div class="header-right">
            <button class="sidebar-toggle" (click)="toggleSidebar()" [class.active]="isExpanded">
              <span class="toggle-icon">☰</span>
            </button>

          </div>
          
          <div class="header-left">
            <!-- Theme selector -->
            <div class="theme-selector">
              <select class="theme-dropdown" (change)="onThemeChange($event)" [value]="themeService.currentTheme.name">
                <option *ngFor="let theme of themeService.themesList" [value]="theme.name" [style.background-color]="theme.colors.primary" [style.color]="theme.colors.primary === '#ffffff' || theme.colors.primary === '#f5f5f5' ? '#333' : '#fff'">
                  {{ theme.displayName }}
                </option>
              </select>
            </div>

            <!-- User info -->
            <div class="header-user" *ngIf="auth.user() as user">
              <div class="user-avatar">{{ user.firstName[0] }}{{ user.lastName[0] }}</div>
              <span class="user-name">{{ user.fullName }}</span>
            </div>
            
            <!-- Logout button with SVG icon -->
            <button class="btn-logout-header" (click)="auth.logout()" title="خروج">
              <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </header>
        
        <!-- Page content -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
    <ng-template #loginLayout>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
      background: var(--theme-background);
      position: relative;
    }

    /* Decorative ambient background blobs */
    .app-container::before,
    .app-container::after {
      content: '';
      position: fixed;
      border-radius: 50%;
      filter: blur(90px);
      opacity: 0.14;
      pointer-events: none;
      z-index: 0;
    }
    .app-container::before {
      width: 480px; height: 480px;
      background: var(--theme-primary);
      top: -160px; left: -120px;
    }
    .app-container::after {
      width: 420px; height: 420px;
      background: var(--theme-secondary);
      bottom: -140px; right: 140px;
    }

    /* Overlay backdrop */
    .sidebar-backdrop {
      position: fixed;
      top: 0; right: 0; bottom: 0; left: 0;
      background: rgba(10, 8, 30, 0.35);
      backdrop-filter: blur(4px);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999;
    }

    .sidebar-backdrop.visible {
      opacity: 1;
      visibility: visible;
    }

    /* Sidebar drawer — dark glass panel */
    .sidebar-drawer {
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh;
      width: 74px;
      background: var(--theme-sidebar-bg);
      color: var(--theme-sidebar-text);
      display: flex;
      flex-direction: column;
      z-index: 1001;
      transition: width 0.4s var(--ease-smooth);
      overflow: hidden;
      box-shadow: -8px 0 40px rgba(5, 2, 30, 0.35);
    }

    /* Animated edge light */
    .sidebar-drawer::before {
      content: '';
      position: absolute;
      top: 0; bottom: 0; right: 0;
      width: 1px;
      background: linear-gradient(180deg, transparent, color-mix(in srgb, var(--theme-secondary) 70%, transparent), transparent);
      opacity: 0.6;
    }

    .sidebar-drawer.expanded {
      width: 280px;
    }

    .sidebar-header {
      padding: 22px 16px;
      text-align: center;
      min-height: 104px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .sidebar-header::after {
      content: '';
      position: absolute;
      bottom: 0; right: 18px; left: 18px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
    }

    .company-logo {
      max-width: 100px;
      max-height: 60px;
      margin-bottom: 8px;
      transition: all 0.3s ease;
      object-fit: contain;
      filter: drop-shadow(0 4px 14px rgba(0,0,0,0.4));
    }

    .company-logo-small {
      width: 46px;
      height: 46px;
      object-fit: contain;
      transition: all 0.3s ease;
      filter: drop-shadow(0 4px 14px rgba(0,0,0,0.4));
      border-radius: 12px;
    }

    .company-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--theme-sidebar-text);
      margin: 0;
      text-align: center;
      white-space: nowrap;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease 0.1s;
    }

    .sidebar-drawer.expanded .company-name {
      opacity: 1;
      transform: translateY(0);
    }

    .nav-menu {
      list-style: none;
      padding: 18px 10px;
      margin: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 13px 14px;
      border-radius: 14px;
      color: var(--theme-sidebar-text-muted);
      text-decoration: none;
      transition: all 0.25s var(--ease-smooth);
      position: relative;
      overflow: hidden;
    }

    .nav-item::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, color-mix(in srgb, var(--theme-secondary) 22%, transparent), transparent 70%);
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    .nav-item:hover {
      color: var(--theme-sidebar-text);
      background: rgba(255, 255, 255, 0.06);
      transform: translateX(-3px);
    }

    .nav-item:hover::before { opacity: 1; }

    .nav-item.active {
      color: #ffffff;
      background: linear-gradient(135deg, var(--theme-primary), color-mix(in srgb, var(--theme-secondary) 55%, var(--theme-primary)));
      box-shadow: 0 8px 22px color-mix(in srgb, var(--theme-primary) 45%, transparent);
    }

    .nav-item.active::before { opacity: 0; }

    .nav-item .icon {
      font-size: 1.25rem;
      min-width: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s var(--ease-spring);
      position: relative;
    }

    .nav-item:hover .icon { transform: scale(1.15) rotate(-4deg); }

    .nav-label {
      white-space: nowrap;
      opacity: 0;
      transform: translateX(20px);
      transition: all 0.3s ease 0.05s;
      font-weight: 600;
      font-size: 0.93rem;
      position: relative;
    }

    .sidebar-drawer.expanded .nav-label {
      opacity: 1;
      transform: translateX(0);
    }

    /* Main wrapper */
    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
      margin-right: 74px;
      transition: margin-right 0.4s var(--ease-smooth);
      position: relative;
      z-index: 1;
    }

    .sidebar-drawer.expanded ~ .main-wrapper {
      margin-right: 280px;
    }

    /* Page Header — frosted glass */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 40px;
      background: color-mix(in srgb, var(--theme-surface) 78%, transparent);
      backdrop-filter: blur(16px) saturate(1.4);
      border-bottom: 1px solid color-mix(in srgb, var(--theme-border) 70%, transparent);
      position: sticky;
      top: 0;
      z-index: 100;
      transition: all 0.3s ease;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .sidebar-toggle {
      width: 42px;
      height: 42px;
      border: 1px solid var(--theme-border);
      background: var(--theme-surface);
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s var(--ease-smooth);
      color: var(--theme-text);
    }

    .sidebar-toggle:hover {
      border-color: var(--theme-primary);
      color: var(--theme-primary);
      box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-primary) 22%, transparent);
      transform: translateY(-1px);
    }

    .sidebar-toggle.active {
      background: var(--gradient-brand);
      color: white;
      border-color: transparent;
    }

    .toggle-icon { font-size: 1.2rem; }

    

    

    /* Theme selector */
    .theme-selector { display: flex; align-items: center; gap: 10px; }

    .theme-label { font-size: 0.8rem; color: var(--theme-text-muted); }

    .theme-options { display: flex; gap: 8px; }

    .theme-btn {
      width: 24px; height: 24px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      opacity: 0.7;
    }

    .theme-btn:hover { transform: scale(1.15); opacity: 1; }

    .theme-btn.active {
      border-color: var(--theme-text);
      opacity: 1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    /* User info in header */
    .header-user { display: flex; align-items: center; gap: 10px; }

    .user-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--theme-avatar-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
      color: white;
      box-shadow: 0 4px 12px color-mix(in srgb, var(--theme-primary) 35%, transparent);
      border: 2px solid rgba(255,255,255,0.6);
    }

    .user-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--theme-text);
    }

    /* Logout button */
    .btn-logout-header {
      width: 42px;
      height: 42px;
      border: 1px solid var(--theme-border);
      background: var(--theme-surface);
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s var(--ease-smooth);
      color: var(--theme-text-secondary);
      padding: 0;
    }

    .btn-logout-header:hover {
      background: color-mix(in srgb, var(--theme-error) 10%, var(--theme-surface));
      border-color: var(--theme-error);
      color: var(--theme-error);
      transform: translateY(-1px);
      box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-error) 25%, transparent);
    }

    .logout-icon { width: 18px; height: 18px; }

    /* Page content */
    .page-content {
      padding: 32px 40px 48px;
      flex: 1;
      animation: fadeIn 0.4s ease both;
    }

    @media (max-width: 768px) {
      .main-wrapper { margin-right: 62px; }
      .sidebar-drawer { width: 62px; }
      .sidebar-drawer.expanded { width: 260px; }
      .page-header { padding: 12px 16px; }
      .header-date, .user-name, .theme-label { display: none; }
      .page-content { padding: 16px 16px 32px; }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  isExpanded = false;

  private dateInterval: any;

  constructor(
    public auth: AuthService, 
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeService.currentTheme$.subscribe();
    this.updateDate();
    this.dateInterval = setInterval(() => {
      this.updateDate();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.dateInterval) {
      clearInterval(this.dateInterval);
    }
  }

  updateDate(): void {
  
  }

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  expandSidebar() {
    this.isExpanded = true;
  }

  collapseSidebar() {
    this.isExpanded = false;
  }

  setTheme(themeName: string) {
    this.themeService.setTheme(themeName);
  }

  onThemeChange(event: any) {
    const themeName = event.target.value;
    this.themeService.setTheme(themeName);
  }
}
