import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { ShamsiDate } from './core/utils/shamsi-date';

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
            <div class="header-date">
              <span class="date-label">{{ currentDate }}</span>
            </div>
          </div>
          
          <div class="header-left">
            <!-- Theme selector -->
            <div class="theme-selector">
              <span class="theme-label">تم:</span>
              <div class="theme-options">
                <button 
                  *ngFor="let theme of themeService.themesList" 
                  class="theme-btn" 
                  [class.active]="themeService.currentTheme.name === theme.name"
                  [style.background]="theme.colors.primary"
                  [title]="theme.displayName"
                  (click)="setTheme(theme.name)">
                </button>
              </div>
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

    /* Overlay backdrop */
    .sidebar-backdrop {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.12);
      backdrop-filter: blur(2px);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 999;
    }

    .sidebar-backdrop.visible {
      opacity: 1;
      visibility: visible;
    }

    /* Sidebar drawer - fixed to right */
    .sidebar-drawer { 
      position: fixed;
      top: 0;
      right: 0;
      height: 100vh; 
      width: 72px;
      background: var(--theme-sidebar-bg);
      color: var(--theme-sidebar-text); 
      display: flex; 
      flex-direction: column; 
      z-index: 1001;
      transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.06);
    }

    .sidebar-drawer.expanded {
      width: 280px;
    }

    .sidebar-header { 
      padding: 20px 16px; 
      border-bottom: 1px solid var(--theme-border); 
      text-align: center; 
      min-height: 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .company-logo { 
      max-width: 100px; 
      max-height: 60px; 
      margin-bottom: 8px;
      transition: all 0.3s ease;
      object-fit: contain;
    }

    .company-logo-small {
      width: 44px;
      height: 44px;
      object-fit: contain;
      transition: all 0.3s ease;
    }

    .company-name { 
      font-size: 0.85rem; 
      font-weight: 600; 
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
      padding: 15px 0; 
      margin: 0; 
      flex: 1; 
    }

    .nav-item { 
      display: flex; 
      align-items: center; 
      gap: 14px; 
      padding: 14px 16px; 
      color: var(--theme-sidebar-text-muted); 
      text-decoration: none; 
      transition: all 0.2s ease;
      border-right: 3px solid transparent;
      position: relative;
      overflow: hidden;
    }

    .nav-item:hover { 
      background: var(--theme-surface-hover); 
      color: var(--theme-sidebar-text); 
    }

    .nav-item.active { 
      background: var(--theme-surface-hover); 
      color: var(--theme-primary); 
      border-right-color: var(--theme-primary);
    }

    .nav-item .icon { 
      font-size: 1.25rem; 
      min-width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }

    .nav-item:hover .icon {
      transform: scale(1.08);
    }

    .nav-label {
      white-space: nowrap;
      opacity: 0;
      transform: translateX(20px);
      transition: all 0.3s ease 0.05s;
      font-weight: 500;
      font-size: 0.95rem;
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
      margin-right: 72px;
      transition: margin-right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-drawer.expanded ~ .main-wrapper {
      margin-right: 280px;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 40px;
      background: var(--theme-surface);
      border-bottom: 1px solid var(--theme-border);
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
      gap: 24px;
    }

    .sidebar-toggle {
      width: 40px;
      height: 40px;
      border: 1px solid var(--theme-border);
      background: var(--theme-surface);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: var(--theme-text);
    }

    .sidebar-toggle:hover {
      background: var(--theme-surface-hover);
    }

    .sidebar-toggle.active {
      background: var(--theme-primary);
      color: white;
      border-color: var(--theme-primary);
    }

    .toggle-icon {
      font-size: 1.2rem;
    }

    .header-date {
      display: flex;
      flex-direction: column;
    }

    .date-label {
      font-size: 0.85rem;
      color: var(--theme-text-secondary);
      direction: rtl;
    }

    /* Theme selector */
    .theme-selector {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .theme-label {
      font-size: 0.8rem;
      color: var(--theme-text-muted);
    }

    .theme-options {
      display: flex;
      gap: 8px;
    }

    .theme-btn {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      opacity: 0.7;
    }

    .theme-btn:hover {
      transform: scale(1.15);
      opacity: 1;
    }

    .theme-btn.active {
      border-color: var(--theme-text);
      opacity: 1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    /* User info in header */
    .header-user {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-avatar { 
      width: 36px; 
      height: 36px; 
      border-radius: 50%; 
      background: var(--theme-avatar-gradient);
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-weight: 600; 
      font-size: 0.8rem;
      color: white;
    }

    .user-name { 
      font-size: 0.85rem; 
      font-weight: 600;
      color: var(--theme-text);
    }

    /* Logout button */
    .btn-logout-header {
      width: 40px;
      height: 40px;
      border: 1px solid var(--theme-border);
      background: var(--theme-surface);
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: var(--theme-text-secondary);
      padding: 0;
    }

    .btn-logout-header:hover {
      background: rgba(180, 106, 106, 0.1);
      border-color: var(--theme-error);
      color: var(--theme-error);
    }

    .logout-icon {
      width: 18px;
      height: 18px;
    }

    /* Page content - with left padding to not overlap sidebar */
    .page-content {
      padding: 30px 40px;
      flex: 1;
    }

    @media (max-width: 768px) {
      .main-wrapper {
        margin-right: 60px;
      }
      .sidebar-drawer {
        width: 60px;
      }
      .sidebar-drawer.expanded {
        width: 260px;
      }
      .page-header {
        padding: 12px 16px;
      }
      .header-date, .user-name, .theme-label {
        display: none;
      }
      .page-content {
        padding: 16px;
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  isExpanded = false;
  currentDate = '';
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
    this.currentDate = ShamsiDate.format(new Date(), 'full');
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
}
