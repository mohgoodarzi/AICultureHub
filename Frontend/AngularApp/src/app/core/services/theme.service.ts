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
      // Company logo palette: vermilion #F04F24, blue #008CBF, teal-green #00965E
      // Muted/balanced for a premium corporate+AI identity; default theme.
      name: 'corporate',
      displayName: 'هویت سازمانی (لوگو)',
      colors: {
        primary: '#c94a30',          // muted vermilion (logo orange, darkened & desaturated)
        primaryLight: '#e8846b',     // soft vermilion tint
        primaryDark: '#8f2f1c',      // deep brick
        secondary: '#0f7ea8',        // corporate blue (logo blue, slightly deepened)
        secondaryLight: '#5fb6d6',   // soft sky tint
        accent: '#0b8a66',           // corporate teal-green (muted)
        background: '#f7f5f3',       // warm paper
        surface: '#ffffff',
        surfaceHover: '#faf4f1',     // warm vermilion-tinted hover
        text: '#2b211d',             // warm charcoal
        textSecondary: '#5c4f49',
        textMuted: '#94877f',
        border: '#ecdcd4',           // warm border
        success: '#0f8a5f',          // harmonized with logo teal
        warning: '#d98324',          // muted amber (harmonizes with vermilion)
        error: '#c0392b',            // brick red instead of neon red
        sidebarBg: 'linear-gradient(180deg, #31160e 0%, #451f12 55%, #4e2415 100%)',
        sidebarGradient: '#31160e',
        sidebarText: '#f6e9e3',
        sidebarTextMuted: '#c69e8d',
        cardShadow: '0 8px 28px rgba(143, 47, 28, 0.13)',
        avatarGradient: 'linear-gradient(135deg, #c94a30, #0f7ea8)' // vermilion → corporate blue
      }
    },
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
        primary: '#0f7ea8',          // corporate blue from logo
        primaryLight: '#5fb6d6',
        primaryDark: '#0a5572',
        secondary: '#0b8a66',        // logo teal as secondary
        secondaryLight: '#5fc4a4',
        accent: '#c94a30',           // logo vermilion as accent (muted)
        background: '#f3f8fa',
        surface: '#ffffff',
        surfaceHover: '#ecf5f8',
        text: '#122430',
        textSecondary: '#3d5560',
        textMuted: '#748c97',
        border: '#d8e9ef',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        sidebarBg: 'linear-gradient(180deg, #08222e 0%, #0d3346 55%, #103c52 100%)',
        sidebarGradient: '#08222e',
        sidebarText: '#e2f1f8',
        sidebarTextMuted: '#8fb2c2',
        cardShadow: '0 8px 28px rgba(15, 90, 125, 0.12)',
        avatarGradient: 'linear-gradient(135deg, #0f7ea8, #0b8a66)'
      }
    },
    {
      name: 'cyber',
      displayName: 'فیروزه سایبری',
      colors: {
        primary: '#0b8a66',          // logo teal-green, deepened
        primaryLight: '#3fbf95',
        primaryDark: '#075c44',
        secondary: '#0f7ea8',        // logo blue
        secondaryLight: '#5fb6d6',
        accent: '#c94a30',           // logo vermilion as warm accent
        background: '#f2faf7',
        surface: '#ffffff',
        surfaceHover: '#e9f6f1',
        text: '#12312b',
        textSecondary: '#3d554e',
        textMuted: '#6f8f87',
        border: '#d3ece3',
        success: '#16a34a',
        warning: '#d98324',
        error: '#ef4444',
        sidebarBg: 'linear-gradient(180deg, #062922 0%, #0b4032 55%, #0d4c3b 100%)',
        sidebarGradient: '#062922',
        sidebarText: '#dcf5ec',
        sidebarTextMuted: '#7fb0a1',
        cardShadow: '0 8px 28px rgba(10, 90, 66, 0.12)',
        avatarGradient: 'linear-gradient(135deg, #0b8a66, #0f7ea8)'
      }
    },
    {
      name: 'midnight',
      displayName: 'نیمه‌شب رویایی',
      colors: {
        primary: '#b03a6b',          // muted rose (harmonizes with logo vermilion family)
        primaryLight: '#e08cae',
        primaryDark: '#7c2148',
        secondary: '#0f7ea8',        // corporate blue anchor from logo
        secondaryLight: '#7cc0dc',
        accent: '#c94a30',           // vermilion echo
        background: '#faf5f7',
        surface: '#ffffff',
        surfaceHover: '#f9eef3',
        text: '#331722',
        textSecondary: '#6b3a4d',
        textMuted: '#a97e8f',
        border: '#f3dce6',
        success: '#10b981',
        warning: '#d98324',
        error: '#ef4444',
        sidebarBg: 'linear-gradient(180deg, #2e0e1c 0%, #471229 55%, #521531 100%)',
        sidebarGradient: '#2e0e1c',
        sidebarText: '#fbe9f1',
        sidebarTextMuted: '#c48fa5',
        cardShadow: '0 8px 28px rgba(124, 33, 72, 0.12)',
        avatarGradient: 'linear-gradient(135deg, #b03a6b, #0f7ea8)'
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
