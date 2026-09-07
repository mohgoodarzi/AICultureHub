import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ShamsiDate } from '../../core/utils/shamsi-date';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { CourseDto } from '../../core/models/course.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="course-detail" *ngIf="course">
      <a routerLink="/courses" class="back-link">→ بازگشت به دوره‌ها</a>
      <div class="course-header animate-fade-up">
        <div class="hero-grid-bg"></div>
        <div class="course-info">
          <span class="difficulty-chip">{{ course.difficulty }}</span>
          <h1>{{ course.title }}</h1>
          <p>{{ course.description }}</p>
          <div class="course-meta">
            <span class="meta-pill">📃 {{ course.lessonCount }} درس</span>
            <span class="meta-pill">⏱️ {{ course.estimatedDurationMinutes }} دقیقه</span>
            <span class="meta-pill">⭐ {{ course.points }} امتیاز</span>
            <span class="meta-pill">👥 {{ course.enrolledCount }} شرکت‌کننده</span>
          </div>
          <div class="course-actions" *ngIf="!course.userEnrollment">
            <button class="btn-enroll" (click)="enroll()">🚀 ثبت‌نام در دوره</button>
          </div>
          <div class="enrollment-info" *ngIf="course.userEnrollment">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="course.userEnrollment.progressPercentage"></div>
            </div>
            <span class="progress-label">{{ course.userEnrollment.progressPercentage }}٪ تکمیل شده</span>
          </div>
        </div>
        <div class="hero-ring r1"></div>
        <div class="hero-ring r2"></div>
      </div>

      <div class="lessons-section">
        <h2 class="section-title">📜 درس‌های دوره</h2>
        <div class="lesson-list">
          <div class="lesson-item animate-pop" *ngFor="let lesson of course.lessons; let i = index"
               [class.completed]="lesson.isCompleted">
            <span class="lesson-number" [class.done]="lesson.isCompleted">
              <span *ngIf="!lesson.isCompleted">{{ i + 1 }}</span>
              <span *ngIf="lesson.isCompleted">✓</span>
            </span>
            <div class="lesson-info">
              <h4>{{ lesson.title }}</h4>
              <span>⏱ {{ lesson.estimatedDurationMinutes }} دقیقه · ⭐ {{ lesson.points }} امتیاز</span>
            </div>
            <button class="btn-complete" *ngIf="!lesson.isCompleted && course.userEnrollment"
                    (click)="completeLesson(lesson.id)">تکمیل درس</button>
            <span class="completed-badge" *ngIf="lesson.isCompleted">🏆</span>
          </div>
        </div>
      </div>

      <!-- Course feedback / satisfaction survey -->
      <div class="vote-section">
        <div class="vote-container">
          <button class="vote-btn like-btn" [class.active]="userVote === true" (click)="vote(true)" title="پسندیدم">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span class="vote-count">{{ likeCount }}</span>
          </button>
          <button class="vote-btn dislike-btn" [class.active]="userVote === false" (click)="vote(false)" title="نپسندیدم">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" transform="rotate(180 12 12)"/></svg>
            <span class="vote-count">{{ dislikeCount }}</span>
          </button>
          <div class="satisfaction-bar" *ngIf="totalVotes > 0">
            <div class="satisfaction-label">رضایت: <strong>{{ satisfactionPercentage }}%</strong></div>
            <div class="satisfaction-track">
              <div class="satisfaction-fill" [style.width.%]="satisfactionPercentage"></div>
            </div>
            <div class="vote-summary">👍 {{ likeCount }} | 👎 {{ dislikeCount }} | مجموع: {{ totalVotes }}</div>
          </div>
        </div>
        <div class="vote-message" [class.error]="voteMessage.includes('لطفاً') || voteMessage.includes('خطا')" *ngIf="voteMessage">{{ voteMessage }}</div>
      </div>

      <!-- Feedback / Comments -->
      <div class="feedback-section">
        <h3 class="feedback-title">💬 بازخورد و نظرات</h3>
        <div class="feedback-form">
          <textarea [(ngModel)]="newFeedback" rows="3" placeholder="نظر یا بازخورد خود درباره این دوره را بنویسید..." maxlength="2000"></textarea>
          <div class="feedback-form-actions">
            <span class="feedback-hint">{{ newFeedback.length }}/2000</span>
            <button class="feedback-submit" (click)="submitFeedback()" [disabled]="submittingFeedback || !newFeedback || newFeedback.trim().length < 3">
              {{ submittingFeedback ? 'در حال ارسال...' : 'ارسال بازخورد' }}
            </button>
          </div>
        </div>
        <div class="feedback-list" *ngIf="feedbacks.length > 0">
          <div class="feedback-item" *ngFor="let fb of feedbacks">
            <div class="feedback-head">
              <span class="feedback-avatar">{{ (fb.userName || '؟')?.charAt(0) }}</span>
              <div class="feedback-meta">
                <span class="feedback-user">{{ fb.userName }}</span>
                <span class="feedback-date">{{ toShamsi(fb.createdDate) }}</span>
              </div>
            </div>
            <p class="feedback-text">{{ fb.commentText }}</p>
          </div>
        </div>
        <p class="feedback-empty" *ngIf="feedbacks.length === 0">هنوز بازخوردی ثبت نشده است — اولین نفر باشید!</p>
      </div>
    </div>
  `,
  styles: [`
    .course-detail { max-width: 900px; margin: 0 auto; }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 18px;
      padding: 8px 16px;
      border-radius: 100px;
      color: var(--theme-primary);
      background: color-mix(in srgb, var(--theme-primary) 8%, transparent);
      font-weight: 700;
      font-size: 0.86rem;
      transition: all 0.25s var(--ease-smooth);
    }
    .back-link:hover { background: color-mix(in srgb, var(--theme-primary) 15%, transparent); transform: translateX(4px); }

    .course-header {
      position: relative;
      color: white;
      padding: 38px 40px;
      border-radius: var(--radius-lg);
      margin-bottom: 26px;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      background:
        radial-gradient(800px 300px at 90% -20%, rgba(255,255,255,0.18), transparent 60%),
        var(--gradient-brand);
      background-size: 200% 200%;
      animation: gradientShift 14s ease infinite;
    }

    .hero-grid-bg {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(600px 300px at 70% 20%, #000 30%, transparent 75%);
      -webkit-mask-image: radial-gradient(600px 300px at 70% 20%, #000 30%, transparent 75%);
      animation: gridDrift 12s linear infinite;
      pointer-events: none;
    }

    .hero-ring { position: absolute; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.16); pointer-events: none; }
    .hero-ring.r1 { width: 300px; height: 300px; top: -140px; left: -100px; animation: floatY 8s ease-in-out infinite; }
    .hero-ring.r2 { width: 190px; height: 190px; bottom: -80px; right: 12%; animation: floatY 10s ease-in-out infinite 2s; }

    .difficulty-chip {
      position: relative;
      display: inline-block;
      padding: 6px 16px;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.3);
      backdrop-filter: blur(8px);
      border-radius: 100px;
      font-size: 0.78rem;
      font-weight: 800;
    }

    .course-header h1 { position: relative; font-size: 1.8rem; margin: 16px 0 10px; font-weight: 900; letter-spacing: -0.02em; }
    .course-header p { position: relative; opacity: 0.92; margin: 0 0 20px 0; line-height: 2; max-width: 640px; }

    .course-meta { display: flex; gap: 10px; flex-wrap: wrap; position: relative; }
    .meta-pill {
      padding: 7px 15px;
      border-radius: 100px;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.25);
      backdrop-filter: blur(6px);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .btn-enroll {
      position: relative;
      padding: 13px 28px;
      background: #fff;
      color: var(--theme-primary-dark);
      border: none;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.95rem;
      cursor: pointer;
      margin-top: 22px;
      font-family: inherit;
      box-shadow: 0 8px 22px rgba(0,0,0,0.2);
      transition: all 0.25s var(--ease-spring);
    }
    .btn-enroll:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 14px 32px rgba(0,0,0,0.28); }

    .enrollment-info { position: relative; margin-top: 22px; max-width: 460px; }
    .progress-bar { height: 12px; background: rgba(255,255,255,0.25); border-radius: 8px; margin-bottom: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: #fff; border-radius: 8px; transition: width 0.8s var(--ease-spring); box-shadow: 0 0 14px rgba(255,255,255,0.5); }
    .progress-label { font-size: 0.85rem; font-weight: 700; }

    .vote-section { margin-top: 40px; padding-top: 28px; border-top: 2px solid #e8ecf0; }
    .vote-container { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .vote-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border: 2px solid #e0e0e0; border-radius: 12px; background: #fff; cursor: pointer; transition: all 0.2s ease; font-size: 1rem; color: #666; font-family: inherit; }
    .vote-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .vote-count { font-weight: 700; font-size: 1.05rem; }
    .like-btn:hover, .like-btn.active { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
    .dislike-btn:hover, .dislike-btn.active { background: #fef9e7; border-color: #f59e0b; color: #f59e0b; }
    .vote-message { margin-top: 12px; font-size: 0.9rem; color: #10b981; padding: 8px 16px; border-radius: 8px; background: rgba(16,185,129,0.1); }
    .vote-message.error { color: #ef4444; background: rgba(239,68,68,0.1); }
    .satisfaction-bar { display: flex; flex-direction: column; gap: 8px; margin-right: 20px; }
    .satisfaction-label { font-size: 0.95rem; color: var(--theme-text-secondary); }
    .satisfaction-label strong { color: var(--theme-primary); font-size: 1.05rem; }
    .satisfaction-track { width: 200px; height: 8px; background: #e8ecf0; border-radius: 4px; overflow: hidden; }
    .satisfaction-fill { height: 100%; background: linear-gradient(90deg, var(--theme-primary), var(--theme-secondary)); border-radius: 4px; transition: width 0.4s ease; }
    .vote-summary { font-size: 0.82rem; color: var(--theme-text-muted); }
    .feedback-section { margin-top: 36px; padding-top: 28px; border-top: 2px solid #e8ecf0; }
    .feedback-title { font-size: 1.05rem; font-weight: 800; color: var(--theme-text); margin: 0 0 16px 0; }
    .feedback-form textarea {
      width: 100%; padding: 12px 14px; border: 1.5px solid var(--theme-border); border-radius: 12px;
      font-family: inherit; font-size: 0.92rem; resize: vertical; box-sizing: border-box;
      background: var(--theme-surface); color: var(--theme-text); min-height: 84px;
    }
    .feedback-form textarea:focus { outline: none; border-color: var(--theme-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-primary) 12%, transparent); }
    .feedback-form-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
    .feedback-hint { font-size: 0.75rem; color: var(--theme-text-muted); }
    .feedback-submit {
      padding: 10px 24px; border: none; border-radius: 10px;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      color: #fff; font-family: inherit; font-weight: 800; font-size: 0.88rem; cursor: pointer; transition: all 0.2s ease;
    }
    .feedback-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px color-mix(in srgb, var(--theme-primary) 40%, transparent); }
    .feedback-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .feedback-list { margin-top: 24px; display: flex; flex-direction: column; gap: 14px; }
    .feedback-item { background: var(--theme-surface-hover); border: 1px solid var(--theme-border); border-radius: 14px; padding: 14px 16px; }
    .feedback-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .feedback-avatar {
      width: 38px; height: 38px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
      color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.95rem;
    }
    .feedback-meta { display: flex; flex-direction: column; }
    .feedback-user { font-weight: 800; font-size: 0.85rem; color: var(--theme-text); }
    .feedback-date { font-size: 0.72rem; color: var(--theme-text-muted); }
    .feedback-text { margin: 0; font-size: 0.9rem; line-height: 1.9; color: var(--theme-text-secondary); text-align: justify; white-space: pre-line; }
    .feedback-empty { text-align: center; color: var(--theme-text-muted); font-size: 0.85rem; padding: 16px; }

    .lessons-section h2 { margin-bottom: 18px; }

    .lesson-list { display: flex; flex-direction: column; gap: 12px; }

    .lesson-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
      background: var(--theme-surface);
      border: 1px solid var(--theme-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      transition: all 0.3s var(--ease-smooth);
    }
    .lesson-item:hover {
      transform: translateX(-5px);
      border-color: color-mix(in srgb, var(--theme-primary) 30%, var(--theme-border));
      box-shadow: var(--theme-card-shadow);
    }
    .lesson-item.completed { background: color-mix(in srgb, var(--theme-success) 5%, var(--theme-surface)); border-color: color-mix(in srgb, var(--theme-success) 22%, var(--theme-border)); }

    .lesson-number {
      width: 42px; height: 42px;
      border-radius: 14px;
      background: color-mix(in srgb, var(--theme-primary) 10%, transparent);
      color: var(--theme-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }
    .lesson-number.done { background: linear-gradient(135deg, var(--theme-success), color-mix(in srgb, var(--theme-success) 70%, #fff)); color: #fff; }

    .lesson-info { flex: 1; }
    .lesson-info h4 { margin: 0 0 4px 0; color: var(--theme-text); font-weight: 800; font-size: 0.98rem; }
    .lesson-info span { font-size: 0.8rem; color: var(--theme-text-muted); font-weight: 600; }

    .btn-complete {
      padding: 9px 18px;
      background: var(--gradient-brand);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 800;
      font-size: 0.85rem;
      font-family: inherit;
      box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-primary) 25%, transparent);
      transition: all 0.25s var(--ease-spring);
    }
    .btn-complete:hover { transform: translateY(-2px); box-shadow: 0 8px 20px color-mix(in srgb, var(--theme-primary) 35%, transparent); }

    .completed-badge { font-size: 1.4rem; }
  `]
})
export class CourseDetailComponent implements OnInit {
  course: CourseDto | null = null;
  feedbacks: any[] = [];
  newFeedback = '';
  submittingFeedback = false;
  likeCount = 0;
  dislikeCount = 0;
  userVote: boolean | null = null;
  voteMessage = '';

  get totalVotes(): number { return this.likeCount + this.dislikeCount; }
  get satisfactionPercentage(): number { return this.totalVotes > 0 ? Math.round((this.likeCount / this.totalVotes) * 100) : 0; }

  constructor(private route: ActivatedRoute, private courseService: CourseService, private http: HttpClient) {}

  loadFeedbacks(courseId: number): void {
    this.http.get<any[]>(`${environment.apiUrl}/feedbacks/course/${courseId}`).subscribe({
      next: (list) => this.feedbacks = list || [],
      error: () => this.feedbacks = []
    });
  }

  submitFeedback(): void {
    if (!this.course || !this.newFeedback || this.newFeedback.trim().length < 3) return;
    this.submittingFeedback = true;
    this.http.post(`${environment.apiUrl}/feedbacks`, { courseId: this.course.id, commentText: this.newFeedback.trim() }).subscribe({
      next: () => {
        this.submittingFeedback = false;
        this.newFeedback = '';
        this.loadFeedbacks(this.course!.id);
      },
      error: (err) => {
        this.submittingFeedback = false;
        alert(err.error?.message || 'خطا در ثبت بازخورد');
      }
    });
  }

  toShamsi(date: string): string {
    return ShamsiDate.format(date, 'date');
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.courseService.getCourse(slug).subscribe({
        next: (data) => { this.course = data; this.loadVoteStatus(data.id); this.loadFeedbacks(data.id); }
      });
    }
  }

  loadVoteStatus(courseId: number): void {
    this.courseService.getVoteStatus(courseId).subscribe({
      next: (result) => { this.likeCount = result.likeCount; this.dislikeCount = result.dislikeCount; this.userVote = result.userVote ?? null; }
    });
  }

  vote(isLike: boolean): void {
    if (!this.course) return;
    this.courseService.vote(this.course.id, isLike).subscribe({
      next: (result) => {
        this.likeCount = result.likeCount;
        this.dislikeCount = result.dislikeCount;
        this.userVote = result.userVote ?? null;
        this.voteMessage = result.userVote === null ? 'رأی شما حذف شد ✓' : (result.userVote ? 'ممنون از پسندیدن شما! ✓' : 'رأی شما ثبت شد ✓');
        setTimeout(() => this.voteMessage = '', 3000);
      },
      error: (err) => {
        this.voteMessage = err.status === 401 ? 'برای رأی دادن لطفاً وارد شوید' : 'خطا: وضعیت ' + err.status;
        setTimeout(() => this.voteMessage = '', 4000);
      }
    });
  }

  enroll(): void {
    if (!this.course) return;
    this.courseService.enrollInCourse(this.course.id).subscribe({
      next: () => {
        if (this.course) {
          this.courseService.getCourse(this.course.slug).subscribe({ next: (data) => this.course = data });
        }
      }
    });
  }

  completeLesson(lessonId: number): void {
    this.courseService.completeLesson(lessonId).subscribe({
      next: () => {
        if (this.course) {
          this.courseService.getCourse(this.course.slug).subscribe({ next: (data) => this.course = data });
        }
      }
    });
  }
}
