import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="leaderboard-page">
      <div class="page-hero animate-fade-up">
        <span class="hero-chip">✦ رقابت و پیشرفت</span>
        <h1>🏆 جدول امتیازات</h1>
        <p>بهترین‌های سازمان در یادگیری هوش مصنوعی — رتبه خود را بالا ببرید و نشان جمع کنید!</p>
      </div>

      <div class="period-tabs">
        <button [class.active]="selectedPeriod === 'all'" (click)="loadLeaderboard('all')">همه زمان‌ها</button>
        <button [class.active]="selectedPeriod === 'monthly'" (click)="loadLeaderboard('monthly')">این ماه</button>
        <button [class.active]="selectedPeriod === 'weekly'" (click)="loadLeaderboard('weekly')">این هفته</button>
      </div>

      <div class="leaderboard-table animate-fade-up">
        <div class="leaderboard-header">
          <span class="col-rank">رتبه</span>
          <span class="col-user">کاربر</span>
          <span class="col-level">سطح</span>
          <span class="col-points">امتیاز</span>
          <span class="col-badges">نشان‌ها</span>
        </div>
        <div class="leaderboard-row" *ngFor="let entry of leaderboard; let i = index"
             [class.top-3]="entry.rank <= 3">
          <span class="col-rank">
            <span class="rank-badge" [attr.data-rank]="entry.rank">{{ entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : entry.rank }}</span>
          </span>
          <span class="col-user">
            <div class="user-avatar" [style.background]="entry.levelColor">{{ entry.displayName[0] }}</div>
            {{ entry.displayName }}
          </span>
          <span class="col-level">
            <span class="level-tag" [style.background]="entry.levelColor">{{ entry.levelName }}</span>
          </span>
          <span class="col-points">{{ entry.totalPoints | number }}</span>
          <span class="col-badges">🎖 {{ entry.badgesCount }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-page { max-width: 940px; }

    .period-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      padding: 6px;
      background: var(--theme-surface);
      border: 1px solid var(--theme-border);
      border-radius: 14px;
      width: fit-content;
      box-shadow: var(--shadow-sm);
    }
    .period-tabs button {
      padding: 9px 22px;
      border: none;
      background: transparent;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.3s var(--ease-smooth);
      color: var(--theme-text-secondary);
      font-family: inherit;
      font-size: 0.88rem;
    }
    .period-tabs button.active {
      background: var(--gradient-brand);
      color: white;
      box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-primary) 30%, transparent);
    }
    .period-tabs button:hover:not(.active) { background: var(--theme-surface-hover); color: var(--theme-text); }

    .leaderboard-table {
      background: var(--theme-surface);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
    }
    .leaderboard-header {
      display: grid;
      grid-template-columns: 80px 2fr 1fr 1fr 1fr;
      padding: 16px 22px;
      background: var(--gradient-brand);
      font-weight: 800;
      color: #fff;
      font-size: 0.84rem;
    }
    .leaderboard-row {
      display: grid;
      grid-template-columns: 80px 2fr 1fr 1fr 1fr;
      padding: 15px 22px;
      align-items: center;
      border-bottom: 1px solid var(--theme-border);
      transition: all 0.25s var(--ease-smooth);
    }
    .leaderboard-row:last-child { border-bottom: none; }
    .leaderboard-row:hover {
      background: var(--theme-surface-hover);
      transform: translateX(-3px);
    }
    .leaderboard-row.top-3 { background: color-mix(in srgb, var(--theme-warning) 5%, transparent); }

    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px; height: 38px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.9rem;
      background: var(--theme-background);
      color: var(--theme-text-secondary);
      border: 1px solid var(--theme-border);
    }
    .rank-badge[data-rank="1"] { background: linear-gradient(135deg, #ffd700, #ffb300); color: #5b4500; border: none; box-shadow: 0 4px 14px rgba(255, 183, 0, 0.4); font-size: 1.2rem; }
    .rank-badge[data-rank="2"] { background: linear-gradient(135deg, #e0e0e0, #b8bfc9); color: #3d434d; border: none; box-shadow: 0 4px 14px rgba(160, 170, 185, 0.4); font-size: 1.2rem; }
    .rank-badge[data-rank="3"] { background: linear-gradient(135deg, #e8a268, #cd7f32); color: #4d2c0d; border: none; box-shadow: 0 4px 14px rgba(205, 127, 50, 0.4); font-size: 1.2rem; }

    .user-avatar {
      width: 38px; height: 38px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      margin-left: 12px;
      font-size: 0.9rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .col-user { display: flex; align-items: center; font-weight: 700; color: var(--theme-text); }

    .level-tag { padding: 5px 13px; border-radius: 100px; font-size: 0.76rem; color: white; font-weight: 800; box-shadow: 0 3px 10px rgba(0,0,0,0.14); }

    .col-points { font-weight: 900; color: var(--theme-primary); font-size: 0.98rem; }
    .col-badges { color: var(--theme-text-secondary); font-weight: 700; }

    @media (max-width: 768px) {
      .leaderboard-header, .leaderboard-row { grid-template-columns: 60px 1.5fr 1fr 1fr; }
      .col-badges { display: none; }
      .period-tabs { width: 100%; }
      .period-tabs button { flex: 1; padding: 9px 8px; }
    }
  `]
})
export class LeaderboardComponent implements OnInit {
  leaderboard: any[] = [];
  selectedPeriod = 'all';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadLeaderboard('all');
  }

  loadLeaderboard(period: string): void {
    this.selectedPeriod = period;
    this.dashboardService.getLeaderboard(period).subscribe({
      next: (data) => this.leaderboard = data
    });
  }
}
