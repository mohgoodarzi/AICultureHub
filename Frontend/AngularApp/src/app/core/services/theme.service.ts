import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ColorTheme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    accent: string;
    background: string;
    surface: string;
    surfaceHover: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    sidebarBg: string;
    sidebarGradient: string;
    sidebarText: string;
    sidebarTextMuted: string;
    cardShadow: string;
    avatarGradient: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'app-theme';

  private themes: ColorTheme[] = [
    {
      name: 'neural',
      displayName: 'بنفش عصبی',
      colors: {
        primary: '#7c3aed',
        primaryLight: '#a78bfa',
        primaryDark: '#5b21b6',
        secondary: '#06b6d4',
        secondaryLight: '#67e8f9',
        accent: '#f472b6',
        background: '#f5f6fb',
        surface: '#ffffff',
        surfaceHover: '#f3f0fc',
        text: '#1e1b33',
        textSecondary: '#4c4a68',
        textMuted: '#8b89a6',
        border: '#e5e1f5',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        sidebarBg: 'linear-gradient(180deg, #17123a 0%, #241b52 55%, #2d1b69 100%)',
        sidebarGradient: '#17123a',
        sidebarText: '#ece9fb',
        sidebarTextMuted: '#9f9ace',
        cardShadow: '0 8px 28px rgba(84, 45, 162, 0.12)',
        avatarGradient: 'linear-gradient(135deg, #7c3aed, #06b6d4)'
      }
    },
    {
      name: 'quantum',
      displayName: 'آبی کوانتوم',
      colors: {
        primary: '#2563eb',
        primaryLight: '#60a5fa',
        primaryDark: '#1e3a8a',
        secondary: '#0ea5e9',
        secondaryLight: '#7dd3fc',
        accent: '#8b5cf6',
        background: '#f4f7fd',
        surface: '#ffffff',
        surfaceHover: '#eff4fd',
        text: '#131c31',
        textSecondary: '#44506b',
        textMuted: '#7e8aa5',
        border: '#dbe4f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        sidebarBg: 'linear-gradient(180deg, #0b1739 0%, #12235a 55%, #16295e 100%)',
        sidebarGradient: '#0b1739',
        sidebarText: '#e3ecfd',
        sidebarTextMuted: '#8ba0cc',
        cardShadow: '0 8px 28px rgba(28, 56, 130, 0.12)',
        avatarGradient: 'linear-gradient(135deg, #2563eb, #0ea5e9)'
      }
    },
    {
      name: 'cyber',
      displayName: 'فیروزه سایبری',
      colors: {
        primary: '#0d9488',
        primaryLight: '#2dd4bf',
        primaryDark: '#115e59',
        secondary: '#6366f1',
        secondaryLight: '#a5b4fc',
        accent: '#f59e0b',
        background: '#f2faf8',
        surface: '#ffffff',
        surfaceHover: '#ebf7f4',
        text: '#12312e',
        textSecondary: '#3d5551',
        textMuted: '#6f8f8a',
        border: '#d3ece7',
        success: '#16a34a',
        warning: '#f59e0b',
        error: '#ef4444',
        sidebarBg: 'linear-gradient(180deg, #062926 0%, #0b3f39 55%, #0d4a42 100%)',
        sidebarGradient: '#062926',
        sidebarText: '#dcf5f0',
        sidebarTextMuted: '#7fb0a8',
        cardShadow: '0 8px 28px rgba(10, 90, 80, 0.12)',
        avatarGradient: 'linear-gradient(135deg, #0d9488, #6366f1)'
      }
    },
    {
      name: 'midnight',
      displayName: 'نیمه‌شب رویایی',
      colors: {
        primary: '#ec4899',
        primaryLight: '#f9a8d4',
        primaryDark: '#9d174d',
        secondary: '#8b5cf6',
        secondaryLight: '#c4b5fd',
        accent: '#06b6d4',
        background: '#faf5f9',
        surface: '#ffffff',
        surfaceHover: '#fbf0f7',
        text: '#331227',
        textSecondary: '#6b3a58',
        textMuted: '#a97e96',
        border: '#f6ddec',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        sidebarBg: 'linear-gradient(180deg, #2d0a2e 0%, #471048 55%, #55124f 100%)',
        sidebarGradient: '#2d0a2e',
        sidebarText: '#fce9f5',
        sidebarTextMuted: '#c48fb4',
        cardShadow: '0 8px 28px rgba(120, 30, 90, 0.12)',
        avatarGradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)'
      }
    }
  ];

  private currentThemeSubject = new BehaviorSubject<ColorTheme>(this.themes[0]);
  currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    this.loadTheme();
  }

  get themesList(): ColorTheme[] {
    return this.themes;
  }

  get currentTheme(): ColorTheme {
    return this.currentThemeSubject.value;
  }

  setTheme(themeName: string): void {
    const theme = this.themes.find(t => t.name === themeName);
    if (theme) {
      this.currentThemeSubject.next(theme);
      localStorage.setItem(this.STORAGE_KEY, themeName);
      this.applyTheme(theme);
    }
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    if (savedTheme) {
      const theme = this.themes.find(t => t.name === savedTheme);
      if (theme) {
        this.currentThemeSubject.next(theme);
        this.applyTheme(theme);
        return;
      }
    }
    this.applyTheme(this.themes[0]);
  }

  private applyTheme(theme: ColorTheme): void {
    const root = document.documentElement;
    const c = theme.colors;

    root.style.setProperty('--theme-primary', c.primary);
    root.style.setProperty('--theme-primary-light', c.primaryLight);
    root.style.setProperty('--theme-primary-dark', c.primaryDark);
    root.style.setProperty('--theme-secondary', c.secondary);
    root.style.setProperty('--theme-secondary-light', c.secondaryLight);
    root.style.setProperty('--theme-accent', c.accent);
    root.style.setProperty('--theme-background', c.background);
    root.style.setProperty('--theme-surface', c.surface);
    root.style.setProperty('--theme-surface-hover', c.surfaceHover);
    root.style.setProperty('--theme-text', c.text);
    root.style.setProperty('--theme-text-secondary', c.textSecondary);
    root.style.setProperty('--theme-text-muted', c.textMuted);
    root.style.setProperty('--theme-border', c.border);
    root.style.setProperty('--theme-success', c.success);
    root.style.setProperty('--theme-warning', c.warning);
    root.style.setProperty('--theme-error', c.error);
    root.style.setProperty('--theme-sidebar-bg', c.sidebarBg);
    root.style.setProperty('--theme-sidebar-gradient', c.sidebarGradient);
    root.style.setProperty('--theme-sidebar-text', c.sidebarText);
    root.style.setProperty('--theme-sidebar-text-muted', c.sidebarTextMuted);
    root.style.setProperty('--theme-card-shadow', c.cardShadow);
    root.style.setProperty('--theme-avatar-gradient', c.avatarGradient);
  }
}
