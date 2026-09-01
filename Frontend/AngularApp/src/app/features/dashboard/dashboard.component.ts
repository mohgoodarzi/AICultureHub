import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { CourseService } from '../../core/services/course.service';
import { ChallengeService } from '../../core/services/challenge.service';
import { ShamsiDate } from '../../core/utils/shamsi-date';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-page">
      <div class="welcome-section">
        <h1>خوش آمدید، {{ auth.user()?.firstName }} {{ auth.user()?.lastName }}!</h1>
        <p class="date">{{ currentDate }}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card points-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-info">
            <div class="stat-value">{{ auth.user()?.totalPoints | number }}</div>
            <div class="stat-label">امتیاز کل</div>
          </div>
        </div>
        <div class="stat-card level-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-info">
            <div class="stat-value">{{ auth.user()?.currentLevel?.name }}</div>
            <div class="stat-label">سطح فعلی</div>
          </div>
        </div>
        <div class="stat-card streak-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-info">
            <div class="stat-value">{{ auth.user()?.learningStreak }}</div>
            <div class="stat-label">روز متوالی</div>
          </div>
        </div>
        <div class="stat-card badges-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-info">
            <div class="stat-value">{{ auth.user()?.badges?.length }}</div>
            <div class="stat-label">نشان‌ها</div>
          </div>
        </div>
      </div>

      <div class="level-progress" *ngIf="auth.user()?.currentLevel">
        <div class="progress-header">
          <span>پیشرفت سطح {{ auth.user()?.currentLevel?.name }}</span>
          <span>{{ auth.user()?.currentLevelPoints }} / {{ auth.user()?.currentLevel?.pointsRequired }} امتیاز</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="levelProgress"></div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card challenge-card">
          <h3>🔥 چالش روزانه</h3>
          <div class="challenge-content" *ngIf="dailyChallenge">
            <p class="challenge-title">{{ dailyChallenge.title }}</p>
            <p class="challenge-desc">{{ dailyChallenge.description }}</p>
            <div class="challenge-reward">
              <span class="points">+{{ dailyChallenge.points }} امتیاز</span>
              <button class="btn-challenge" (click)="completeChallenge(dailyChallenge.id)">انجام شد!</button>
            </div>
          </div>
          <p *ngIf="!dailyChallenge" class="empty-text">امروز چالشی نیست</p>
        </div>

        <div class="dashboard-card badges-section">
          <h3>🏆 نشان‌های اخیر</h3>
          <div class="badges-list">
            <div class="badge-item" *ngFor="let badge of recentBadges">
              <div class="badge-icon" [style.background]="badge.color">{{ badge.name[0] }}</div>
              <div class="badge-info">
                <span class="badge-name">{{ badge.name }}</span>
                <span class="badge-date">{{ formatDate(badge.earnedDate) }}</span>
              </div>
            </div>
            <p *ngIf="!recentBadges?.length" class="empty-text">هنوز نشانی کسب نکردید</p>
          </div>
        </div>

        <div class="dashboard-card articles-section">
          <h3>📚 دوره‌های پیشنهادی</h3>
          <div class="recommendations">
            <a *ngFor="let course of recommendedCourses" [routerLink]="['/courses', course.slug]" class="recommendation-item">
              <div class="rec-info">
                <span class="rec-title">{{ course.title }}</span>
                <span class="rec-meta">{{ course.lessonCount }} درس • {{ course.points }} امتیاز</span>
              </div>
              <span class="rec-arrow">←</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { max-width: 1200px; }
    .welcome-section { margin-bottom: 24px; }
    .welcome-section h1 { color: var(--theme-text); margin: 0 0 8px 0; font-size: 1.8rem; }
    .date { color: var(--theme-text-secondary); font-size: 0.95rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: var(--theme-surface); padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 16px; box-shadow: var(--theme-card-shadow); border: 1px solid var(--theme-border); transition: all 0.3s ease; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
    .stat-icon { font-size: 2rem; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--theme-text); }
    .stat-label { color: var(--theme-text-secondary); font-size: 0.85rem; }
    .level-progress { background: var(--theme-surface); padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: var(--theme-card-shadow); border: 1px solid var(--theme-border); }
    .progress-header { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.9rem; color: var(--theme-text-secondary); }
    .progress-bar { height: 8px; background: var(--theme-border); border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, var(--theme-primary), var(--theme-primary-dark)); transition: width 0.3s; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .dashboard-card { background: var(--theme-surface); padding: 24px; border-radius: 12px; box-shadow: var(--theme-card-shadow); border: 1px solid var(--theme-border); transition: all 0.3s ease; }
    .dashboard-card h3 { margin: 0 0 16px 0; color: var(--theme-text); font-size: 1.1rem; }
    .challenge-title { font-weight: 600; color: var(--theme-text); margin-bottom: 8px; }
    .challenge-desc { color: var(--theme-text-secondary); font-size: 0.9rem; margin-bottom: 16px; }
    .challenge-reward { display: flex; justify-content: space-between; align-items: center; }
    .points { color: var(--theme-primary); font-weight: 700; }
    .btn-challenge { padding: 8px 16px; background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark)); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-family: inherit; }
    .btn-challenge:hover { opacity: 0.9; }
    .badges-list { display: flex; flex-direction: column; gap: 12px; }
    .badge-item { display: flex; align-items: center; gap: 12px; }
    .badge-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1rem; }
    .badge-info { display: flex; flex-direction: column; }
    .badge-name { font-weight: 600; color: var(--theme-text); font-size: 0.9rem; }
    .badge-date { font-size: 0.75rem; color: var(--theme-text-muted); }
    .empty-text { color: var(--theme-text-muted); font-size: 0.9rem; text-align: center; padding: 20px; }
    .recommendations { display: flex; flex-direction: column; gap: 8px; }
    .recommendation-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--theme-background); border-radius: 8px; text-decoration: none; transition: background 0.2s; }
    .recommendation-item:hover { background: var(--theme-surface-hover); }
    .rec-title { font-weight: 600; color: var(--theme-text); font-size: 0.95rem; }
    .rec-meta { font-size: 0.8rem; color: var(--theme-text-secondary); display: block; margin-top: 4px; }
    .rec-arrow { color: var(--theme-primary); font-size: 1.2rem; }
    @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  currentDate = '';
  dailyChallenge: any = null;
  recentBadges: any[] = [];
  recommendedCourses: any[] = [];
  levelProgress = 0;

  constructor(
    public auth: AuthService,
    private dashboardService: DashboardService,
    private courseService: CourseService,
    private challengeService: ChallengeService
  ) {}

  ngOnInit(): void {
    this.currentDate = ShamsiDate.format(new Date(), 'full');
    const user = this.auth.user();
    if (user?.currentLevel && user?.currentLevelPoints) {
      const required = user.currentLevel.pointsRequired || 100;
      this.levelProgress = Math.min(100, (user.currentLevelPoints / required) * 100);
    }
    this.recentBadges = user?.badges?.slice(0, 4) || [];
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.challengeService.getDailyChallenge().subscribe({
      next: (challenge) => { this.dailyChallenge = challenge; }
    });
    this.courseService.getCourses(1, 5).subscribe({
      next: (result) => { this.recommendedCourses = result.items.slice(0, 3); }
    });
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return ShamsiDate.format(date, 'short');
  }

  completeChallenge(challengeId: number): void {
    this.challengeService.submitAnswer(challengeId, '').subscribe({
      next: () => {
        this.dailyChallenge = null;
        this.auth.refreshUser();
      }
    });
  }
}
