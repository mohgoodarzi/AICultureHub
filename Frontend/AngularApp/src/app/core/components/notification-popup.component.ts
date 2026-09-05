import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ActiveNotification {
  id: number;
  title: string;
  content: string;
  summary?: string | null;
  priority?: string;
  imageUrl?: string | null;
  createdDate: Date;
}

@Component({
  selector: 'app-notification-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="np-overlay" *ngIf="visible" (click)="dismiss()">
      <div class="np-card" (click)="$event.stopPropagation()" [attr.data-priority]="notification?.priority">
        <div class="np-shine"></div>
        <div class="np-glow g1"></div>
        <div class="np-glow g2"></div>

        <button class="np-close" (click)="dismiss()" aria-label="بستن">✕</button>

        <div class="np-icon-wrap">
          <div class="np-icon">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </div>
        </div>

        <h2 class="np-title" *ngIf="notification">{{ notification.title }}</h2>
        <p class="np-summary" *ngIf="notification?.summary as s">{{ s }}</p>
        <div class="np-content" *ngIf="notification">{{ notification.content }}</div>

        <div class="np-footer">
          <span class="np-date" *ngIf="notification">{{ notification.createdDate | date:'mediumDate' }}</span>
          <button class="np-btn" (click)="dismiss()">متوجه شدم</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .np-overlay {
      position: fixed;
      inset: 0;
      z-index: 5000;
      background: rgba(10, 8, 30, 0.55);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: npFadeIn 0.3s ease;
    }
    @keyframes npFadeIn { from { opacity: 0; } to { opacity: 1; } }

    .np-card {
      position: relative;
      width: 100%;
      max-width: 460px;
      background: linear-gradient(160deg, #ffffff 0%, #f4f2fd 100%);
      border-radius: 22px;
      padding: 34px 30px 26px 30px;
      box-shadow:
        0 30px 70px rgba(15, 10, 60, 0.35),
        0 8px 22px rgba(15, 10, 60, 0.18),
        inset 0 1px 0 rgba(255,255,255,0.9);
      border: 1px solid rgba(255,255,255,0.7);
      transform-style: preserve-3d;
      animation: npEnter3D 0.55s cubic-bezier(0.22, 1.2, 0.36, 1) both;
      overflow: hidden;
      font-family: inherit;
    }
    @keyframes npEnter3D {
      0%   { opacity: 0; transform: perspective(1100px) rotateX(-14deg) translateY(60px) scale(0.9); }
      60%  { opacity: 1; transform: perspective(1100px) rotateX(4deg) translateY(-8px) scale(1.02); }
      100% { opacity: 1; transform: perspective(1100px) rotateX(0deg) translateY(0) scale(1); }
    }

    /* Ambient glowing blobs */
    .np-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(46px);
      opacity: 0.35;
      pointer-events: none;
      animation: npFloat 7s ease-in-out infinite alternate;
    }
    .np-glow.g1 { width: 190px; height: 190px; background: var(--theme-primary); top: -70px; left: -50px; }
    .np-glow.g2 { width: 150px; height: 150px; background: var(--theme-secondary); bottom: -60px; right: -40px; animation-delay: 2.4s; }
    @keyframes npFloat { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(12px, 14px, 0) scale(1.15); } }

    /* Diagonal light sweep */
    .np-shine {
      position: absolute;
      top: -60%;
      right: -30%;
      width: 45%;
      height: 230%;
      background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%);
      animation: npSheen 4.5s ease-in-out 0.8s infinite;
      pointer-events: none;
    }
    @keyframes npSheen {
      0%   { transform: translateX(0) rotate(10deg); opacity: 0; }
      25%  { opacity: 1; }
      60%, 100% { transform: translateX(-260%) rotate(10deg); opacity: 0; }
    }

    .np-close {
      position: absolute;
      top: 14px;
      left: 14px;
      width: 34px;
      height: 34px;
      border-radius: 10px;
      border: 1.5px solid var(--theme-border);
      background: rgba(255,255,255,0.8);
      color: var(--theme-text-secondary);
      font-size: 0.95rem;
      cursor: pointer;
      z-index: 2;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .np-close:hover { background: var(--theme-error); color: #fff; border-color: var(--theme-error); transform: rotate(90deg); }

    .np-icon-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; position: relative; }
    .np-icon {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-secondary) 100%);
      box-shadow:
        0 10px 24px color-mix(in srgb, var(--theme-primary) 45%, transparent),
        inset 0 2px 4px rgba(255,255,255,0.5),
        inset 0 -3px 6px rgba(0,0,0,0.15);
      animation: npIconPulse 2.6s ease-in-out infinite;
    }
    @keyframes npIconPulse {
      0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 10px 24px color-mix(in srgb, var(--theme-primary) 45%, transparent), inset 0 2px 4px rgba(255,255,255,0.5); }
      50% { transform: translateY(-4px) scale(1.05); box-shadow: 0 16px 32px color-mix(in srgb, var(--theme-primary) 55%, transparent), inset 0 2px 4px rgba(255,255,255,0.5); }
    }

    .np-title {
      margin: 0 0 10px 0;
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--theme-text);
      line-height: 1.6;
      position: relative;
    }
    .np-summary {
      margin: 0 0 12px 0;
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--theme-primary);
      position: relative;
    }
    .np-content {
      font-size: 0.92rem;
      line-height: 1.9;
      color: var(--theme-text-secondary);
      max-height: 220px;
      overflow-y: auto;
      white-space: pre-line;
      position: relative;
    }

    .np-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 22px;
      gap: 12px;
      position: relative;
    }
    .np-date { font-size: 0.75rem; color: var(--theme-text-muted); }

    .np-btn {
      padding: 11px 26px;
      border: none;
      border-radius: 12px;
      font-family: inherit;
      font-size: 0.92rem;
      font-weight: 800;
      color: #fff;
      cursor: pointer;
      background: linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-dark) 100%);
      box-shadow: 0 8px 20px color-mix(in srgb, var(--theme-primary) 40%, transparent), inset 0 1px 2px rgba(255,255,255,0.4);
      transition: all 0.2s ease;
    }
    .np-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px color-mix(in srgb, var(--theme-primary) 55%, transparent), inset 0 1px 2px rgba(255,255,255,0.4); }
    .np-btn:active { transform: translateY(0); }

    
    

    @media (max-width: 540px) {
      .np-card { padding: 26px 20px 20px 20px; border-radius: 18px; }
      .np-title { font-size: 1.08rem; }
      .np-icon { width: 46px; height: 46px; }
      .np-footer { flex-direction: column-reverse; align-items: stretch; }
      .np-btn { width: 100%; }
    }
    @media (prefers-reduced-motion: reduce) {
      .np-card, .np-icon, .np-shine, .np-glow { animation: none; }
    }
  `]
})
export class NotificationPopupComponent implements OnInit {
  @Input() showOnLogin = true;
  @Output() closed = new EventEmitter<void>();

  visible = false;
  notification: ActiveNotification | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    if (this.showOnLogin && sessionStorage.getItem('notificationShown') !== '1') {
      this.load();
    }
  }

  load(): void {
    this.http.get<ActiveNotification>(`${environment.apiUrl}/auth/active-notification`).subscribe({
      next: (n) => {
        if (n) {
          this.notification = n;
          this.visible = true;
          sessionStorage.setItem('notificationShown', '1');
        }
      },
      error: () => { /* no notification or not logged in: show nothing */ }
    });
  }

  dismiss(): void {
    this.visible = false;
    this.closed.emit();
  }
}
