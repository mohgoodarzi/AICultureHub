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
      name: 'sage',
      displayName: 'سبز آرام',
      colors: {
        primary: '#5a8a5e',
        primaryLight: '#8ab89a',
        primaryDark: '#3d6a3e',
        secondary: '#6a9a6a',
        secondaryLight: '#9ac4a2',
        accent: '#4a7a4e',
        background: '#f2f5f2',
        surface: '#ffffff',
        surfaceHover: '#eef2ee',
        text: '#2d3a2d',
        textSecondary: '#4a5a4a',
        textMuted: '#7a8a7a',
        border: '#d4e0d4',
        success: '#5a9a5a',
        warning: '#c9985c',
        error: '#b46a6a',
        sidebarBg: 'linear-gradient(180deg, #e8efe8 0%, #dce8dc 50%, #d0e0d0 100%)',
        sidebarGradient: '#e8efe8',
        sidebarText: '#3a4a3a',
        sidebarTextMuted: '#6a7a6a',
        cardShadow: '0 2px 12px rgba(60, 90, 60, 0.08)',
        avatarGradient: 'linear-gradient(135deg, #5a8a5e, #7aa87e)'
      }
    },
    {
      name: 'dusty',
      displayName: 'خاکستری ملایم',
      colors: {
        primary: '#6a8098',
        primaryLight: '#98b0c4',
        primaryDark: '#4a6078',
        secondary: '#7a909a',
        secondaryLight: '#a4b4c0',
        accent: '#5a7088',
        background: '#f4f6f8',
        surface: '#ffffff',
        surfaceHover: '#eef1f4',
        text: '#2d3842',
        textSecondary: '#4a5662',
        textMuted: '#7a8692',
        border: '#d0d8e0',
        success: '#5a8a78',
        warning: '#c9985c',
        error: '#b46a6a',
        sidebarBg: 'linear-gradient(180deg, #ecf0f4 0%, #dce4ec 50%, #d0d8e4 100%)',
        sidebarGradient: '#ecf0f4',
        sidebarText: '#3a4652',
        sidebarTextMuted: '#7a8692',
        cardShadow: '0 2px 12px rgba(60, 80, 100, 0.08)',
        avatarGradient: 'linear-gradient(135deg, #6a8098, #8a9ab0)'
      }
    },
    {
      name: 'blush',
      displayName: 'رز ملایم',
      colors: {
        primary: '#98788a',
        primaryLight: '#c4a8b4',
        primaryDark: '#785868',
        secondary: '#a88a9a',
        secondaryLight: '#c4b0bc',
        accent: '#886878',
        background: '#f8f5f6',
        surface: '#ffffff',
        surfaceHover: '#f2eef0',
        text: '#3d2d35',
        textSecondary: '#5a4a52',
        textMuted: '#8a7a82',
        border: '#e8dce0',
        success: '#6a8a7a',
        warning: '#c9986c',
        error: '#b46878',
        sidebarBg: 'linear-gradient(180deg, #f0eced 0%, #e6e0e2 50%, #dcd4d8 100%)',
        sidebarGradient: '#f0eced',
        sidebarText: '#4a3a42',
        sidebarTextMuted: '#8a7a82',
        cardShadow: '0 2px 12px rgba(90, 70, 80, 0.08)',
        avatarGradient: 'linear-gradient(135deg, #98788a, #b094a4)'
      }
    },
    {
      name: 'white',
      displayName: 'سفید تمیز',
      colors: {
        primary: '#5a7a9a',
        primaryLight: '#8aaac0',
        primaryDark: '#3a5a7a',
        secondary: '#7a8ea0',
        secondaryLight: '#a4b4c4',
        accent: '#4a6a8a',
        background: '#f8f9fa',
        surface: '#ffffff',
        surfaceHover: '#f0f3f6',
        text: '#2c3842',
        textSecondary: '#4a5868',
        textMuted: '#8a96a2',
        border: '#e0e6ec',
        success: '#4a8a6a',
        warning: '#c9a85c',
        error: '#b45a68',
        sidebarBg: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f2f5f8 100%)',
        sidebarGradient: '#ffffff',
        sidebarText: '#3a4858',
        sidebarTextMuted: '#7a8a98',
        cardShadow: '0 2px 12px rgba(60, 80, 100, 0.06)',
        avatarGradient: 'linear-gradient(135deg, #5a7a9a, #8aaac0)'
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
