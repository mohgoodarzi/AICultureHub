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
      <!-- Hero welcome -->
      <div class="hero animate-fade-up">
        <div class="hero-glow g1"></div>
        <div class="hero-glow g2"></div>
        <div class="hero-top">
          <div class="hero-chip">✦ سامانه هوش مصنوعی و تحول دیجیتال</div>
          <span class="hero-date">{{ currentDate }}</span>
        </div>
        <h1>
          سلام {{ auth.user()?.firstName }} 👋
          <span class="hero-underline"></span>
        </h1>
        <p>امروز مسیر یادگیری هوش مصنوعی‌ات را ادامه بده؛ هر قدم کوچک، تو را به متخصص تحول دیجیتال نزدیک‌تر می‌کند.</p>
        <div class="hero-actions">
          <a routerLink="/articles" class="hero-btn solid">📖 مشاهده مقالات</a>
          <a routerLink="/quizzes" class="hero-btn glass">🧪 شروع آزمون</a>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card animate-pop delay-1">
          <div class="stat-ico grad-1">⭐</div>
          <div class="stat-info">
            <div class="stat-value">{{ auth.user()?.totalPoints | number }}</div>
            <div class="stat-label">امتیاز کل</div>
          </div>
        </div>
        <div class="stat-card animate-pop delay-2">
          <div class="stat-ico grad-2">🎯</div>
          <div class="stat-info">
            <div class="stat-value">{{ auth.user()?.currentLevel?.name }}</div>
            <div class="stat-label">سطح فعلی</div>
          </div>
        </div>
        <div class="stat-card animate-pop delay-3">
          <div class="stat-ico grad-3">🔥</div>
          <div class="stat-info">
            <div class="stat-value">{{ auth.user()?.learningStreak }}</div>
            <div class="stat-label">روز متوالی</div>
          </div>
        </div>
        <div class="stat-card animate-pop delay-4">
          <div class="stat-ico grad-4">🏆</div>
          <div class="stat-info">
            <div class="stat-value">{{ auth.user()?.badges?.length }}</div>
            <div class="stat-label">نشان‌ها</div>
          </div>
        </div>
      </div>

      <!-- Level progress -->
      <div class="level-progress card" *ngIf="auth.user()?.currentLevel">
        <div class="progress-header">
          <span class="progress-title">پیشرفت سطح {{ auth.user()?.currentLevel?.name }}</span>
          <span class="progress-nums">{{ auth.user()?.currentLevelPoints }} / {{ auth.user()?.currentLevel?.pointsRequired }} امتیاز</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="levelProgress"></div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Daily challenge -->
        <div class="dashboard-card challenge-card glow-card">
          <h3 class="section-title">🔥 چالش روزانه</h3>
          <div class="challenge-content" *ngIf="dailyChallenge">
            <p class="challenge-title">{{ dailyChallenge.title }}</p>
            <p class="challenge-desc">{{ dailyChallenge.description }}</p>
            <div class="challenge-reward">
              <span class="points-chip">+{{ dailyChallenge.points }} امتیاز</span>
              <button class="btn-primary btn-challenge" (click)="completeChallenge(dailyChallenge.id)">انجام شد!</button>
            </div>
          </div>
          <p *ngIf="!dailyChallenge" class="empty-text">امروز چالشی نیست — فردا دوباره سر بزن! 🌱</p>
        </div>

        <!-- Badges -->
        <div class="dashboard-card badges-section glow-card">
          <h3 class="section-title">🏆 نشان‌های اخیر</h3>
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

        <!-- Recommendations -->
        <div class="dashboard-card articles-section glow-card">
          <h3 class="section-title">📚 دوره‌های پیشنهادی</h3>
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

    /* ---- Hero ---- */
    .hero {
      position: relative;
      border-radius: var(--radius-lg);
      padding: 40px 42px;
      margin-bottom: 26px;
      color: #fff;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      background:
        radial-gradient(900px 320px at 88% -20%, rgba(255,255,255,0.2), transparent 60%),
        radial-gradient(700px 300px at 0% 130%, rgba(255,255,255,0.12), transparent 55%),
        var(--gradient-brand);
      background-size: 200% 200%;
      animation: gradientShift 14s ease infinite;
    }

    .hero-glow {
      position: absolute;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.16);
      pointer-events: none;
    }
    .hero-glow.g1 { width: 380px; height: 380px; top: -180px; left: -110px; animation: floatY 8s ease-in-out infinite; }
    .hero-glow.g2 { width: 240px; height: 240px; bottom: -120px; right: 18%; animation: floatY 10s ease-in-out infinite 2s; }

    .hero-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; position: relative; }

    .hero-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border-radius: 100px;
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.28);
      backdrop-filter: blur(8px);
      font-size: 0.78rem;
      font-weight: 700;
    }

    .hero-date { font-size: 0.82rem; opacity: 0.85; font-weight: 600; }

    .hero h1 {
      position: relative;
      font-size: 2.2rem;
      font-weight: 900;
      margin: 0 0 10px;
      letter-spacing: -0.02em;
    }

    .hero-underline {
      display: block;
      width: 88px;
      height: 5px;
      border-radius: 4px;
      margin-top: 12px;
      background: linear-gradient(90deg, #fff, rgba(255,255,255,0.25));
    }

    .hero p {
      position: relative;
      max-width: 620px;
      line-height: 2;
      opacity: 0.92;
      font-size: 0.98rem;
      margin: 0 0 22px;
    }

    .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; position: relative; }

    .hero-btn {
      padding: 11px 22px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.92rem;
      transition: all 0.25s var(--ease-spring);
    }
    .hero-btn.solid {
      background: #fff;
      color: var(--theme-primary-dark);
      box-shadow: 0 8px 22px rgba(0,0,0,0.18);
    }
    .hero-btn.solid:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 14px 30px rgba(0,0,0,0.24); }
    .hero-btn.glass {
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.32);
      backdrop-filter: blur(8px);
      color: #fff;
    }
    .hero-btn.glass:hover { background: rgba(255,255,255,0.24); transform: translateY(-3px); }

    /* ---- Stats ---- */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 26px; }

    .stat-card {
      background: var(--theme-surface);
      padding: 22px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
      transition: all 0.3s var(--ease-smooth);
      position: relative;
      overflow: hidden;
    }
    .stat-card::after {
      content: '';
      position: absolute;
      top: 0; right: 0; bottom: 0;
      width: 3px;
      background: var(--gradient-brand);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
    .stat-card:hover::after { opacity: 1; }

    .stat-ico {
      width: 54px; height: 54px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: #fff;
      flex-shrink: 0;
      box-shadow: 0 8px 20px rgba(20, 15, 60, 0.18);
    }
    .grad-1 { background: linear-gradient(135deg, #f59e0b, #f97316); }
    .grad-2 { background: var(--gradient-brand); }
    .grad-3 { background: linear-gradient(135deg, #ef4444, #f97316); }
    .grad-4 { background: linear-gradient(135deg, var(--theme-secondary), var(--theme-primary)); }

    .stat-value { font-size: 1.45rem; font-weight: 900; color: var(--theme-text); line-height: 1.2; }
    .stat-label { color: var(--theme-text-muted); font-size: 0.82rem; font-weight: 600; margin-top: 2px; }

    /* ---- Level progress ---- */
    .level-progress { padding: 22px 24px; border-radius: var(--radius-md); margin-bottom: 26px; }
    .progress-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .progress-title { font-weight: 800; color: var(--theme-text); font-size: 0.94rem; }
    .progress-nums { font-size: 0.84rem; color: var(--theme-text-secondary); font-weight: 600; }
    .progress-bar { height: 12px; background: var(--theme-background); border-radius: 8px; overflow: hidden; border: 1px solid var(--theme-border); }
    .progress-fill {
      height: 100%;
      border-radius: 8px;
      background: var(--gradient-brand);
      background-size: 200% 100%;
      animation: gradientShift 5s ease infinite;
      transition: width 0.8s var(--ease-spring);
      position: relative;
    }

    /* ---- Cards grid ---- */
    .dashboard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; }

    .dashboard-card {
      background: var(--theme-surface);
      padding: 26px;
      border-radius: var(--radius-md);
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
      transition: all 0.3s var(--ease-smooth);
    }
    .dashboard-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }

    .challenge-title { font-weight: 800; color: var(--theme-text); margin-bottom: 8px; font-size: 1.02rem; }
    .challenge-desc { color: var(--theme-text-secondary); font-size: 0.9rem; margin-bottom: 18px; line-height: 1.9; }
    .challenge-reward { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }

    .points-chip {
      padding: 6px 14px;
      border-radius: 100px;
      background: color-mix(in srgb, var(--theme-warning) 14%, transparent);
      color: var(--theme-warning);
      font-weight: 800;
      font-size: 0.88rem;
      border: 1px solid color-mix(in srgb, var(--theme-warning) 30%, transparent);
    }

    .btn-challenge { padding: 10px 20px; border-radius: 10px; font-size: 0.9rem; }

    .badges-list { display: flex; flex-direction: column; gap: 14px; }
    .badge-item { display: flex; align-items: center; gap: 12px; }
    .badge-icon {
      width: 44px; height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 1rem;
      box-shadow: 0 6px 16px rgba(20, 15, 60, 0.18);
    }
    .badge-info { display: flex; flex-direction: column; }
    .badge-name { font-weight: 700; color: var(--theme-text); font-size: 0.92rem; }
    .badge-date { font-size: 0.76rem; color: var(--theme-text-muted); }

    .empty-text { color: var(--theme-text-muted); font-size: 0.9rem; text-align: center; padding: 24px; line-height: 1.8; }

    .recommendations { display: flex; flex-direction: column; gap: 10px; }
    .recommendation-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      background: var(--theme-background);
      border-radius: 12px;
      border: 1px solid transparent;
      transition: all 0.25s var(--ease-smooth);
    }
    .recommendation-item:hover {
      background: var(--theme-surface-hover);
      border-color: color-mix(in srgb, var(--theme-primary) 25%, transparent);
      transform: translateX(-4px);
    }
    .rec-title { font-weight: 700; color: var(--theme-text); font-size: 0.94rem; }
    .rec-meta { font-size: 0.78rem; color: var(--theme-text-muted); display: block; margin-top: 4px; }
    .rec-arrow { color: var(--theme-primary); font-size: 1.2rem; font-weight: 700; transition: transform 0.25s ease; }
    .recommendation-item:hover .rec-arrow { transform: translateX(-4px); }

    @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .hero { padding: 30px 24px; }
      .hero h1 { font-size: 1.7rem; }
    }
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
