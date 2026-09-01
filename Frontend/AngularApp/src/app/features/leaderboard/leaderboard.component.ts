import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="leaderboard-page">
      <h1>🏆 جدول امتیازات</h1>

      <div class="period-tabs">
        <button [class.active]="selectedPeriod === 'all'" (click)="loadLeaderboard('all')">همه زمان‌ها</button>
        <button [class.active]="selectedPeriod === 'monthly'" (click)="loadLeaderboard('monthly')">این ماه</button>
        <button [class.active]="selectedPeriod === 'weekly'" (click)="loadLeaderboard('weekly')">این هفته</button>
      </div>

      <div class="leaderboard-table">
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
            <span class="rank-badge" [attr.data-rank]="entry.rank">{{ entry.rank }}</span>
          </span>
          <span class="col-user">
            <div class="user-avatar" [style.background]="entry.levelColor">{{ entry.displayName[0] }}</div>
            {{ entry.displayName }}
          </span>
          <span class="col-level">
            <span class="level-tag" [style.background]="entry.levelColor">{{ entry.levelName }}</span>
          </span>
          <span class="col-points">{{ entry.totalPoints | number }}</span>
          <span class="col-badges">{{ entry.badgesCount }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-page { max-width: 900px; }
    h1 { color: var(--theme-text); margin-bottom: 24px; font-size: 1.8rem; }
    .period-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
    .period-tabs button { padding: 10px 20px; border: 1.5px solid var(--theme-border); background: var(--theme-surface); border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s; color: var(--theme-text); font-family: inherit; }
    .period-tabs button.active { background: var(--theme-primary); color: white; border-color: var(--theme-primary); }
    .period-tabs button:hover:not(.active) { background: var(--theme-surface-hover); }
    .leaderboard-table { background: var(--theme-surface); border-radius: 12px; overflow: hidden; box-shadow: var(--theme-card-shadow); border: 1px solid var(--theme-border); }
    .leaderboard-header { display: grid; grid-template-columns: 80px 2fr 1fr 1fr 1fr; padding: 16px 20px; background: var(--theme-background); font-weight: 600; color: var(--theme-text-secondary); font-size: 0.85rem; }
    .leaderboard-row { display: grid; grid-template-columns: 80px 2fr 1fr 1fr 1fr; padding: 14px 20px; align-items: center; border-bottom: 1px solid var(--theme-border); transition: background 0.2s; }
    .leaderboard-row:hover { background: var(--theme-surface-hover); }
    .leaderboard-row.top-3 { background: rgba(255, 215, 0, 0.05); }
    .rank-badge { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; font-weight: 700; font-size: 0.9rem; background: var(--theme-border); color: var(--theme-text-secondary); }
    .rank-badge[data-rank="1"] { background: #ffd700; color: #333; }
    .rank-badge[data-rank="2"] { background: #c0c0c0; color: #333; }
    .rank-badge[data-rank="3"] { background: #cd7f32; color: white; }
    .user-avatar { width: 36px; height: 36px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: 700; margin-left: 10px; font-size: 0.85rem; }
    .col-user { display: flex; align-items: center; font-weight: 600; color: var(--theme-text); }
    .level-tag { padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; color: white; font-weight: 600; }
    .col-points { font-weight: 700; color: var(--theme-primary); }
    .col-badges { color: var(--theme-text-secondary); }
    @media (max-width: 768px) { .leaderboard-header, .leaderboard-row { grid-template-columns: 60px 1.5fr 1fr 1fr; } .col-badges { display: none; } }
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
