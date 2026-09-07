import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ShamsiDate } from '../../core/utils/shamsi-date';

@Component({
  selector: 'app-course-video-watch',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="watch-page">
      <a routerLink="/courses" class="back-link">← بازگشت به دوره‌ها</a>

      <div class="watch-layout" *ngIf="course">
        <!-- Main player -->
        <div class="player-wrap animate-fade-up">
          <div class="player-frame">
            <video *ngIf="course.videoUrl" [src]="course.videoUrl" controls autoplay preload="metadata"></video>
          </div>
          <h1 class="watch-title">{{ course.title }}</h1>
          <div class="watch-meta">
            <span class="meta-pill" *ngIf="course.difficulty">{{ difficultyLabel }}</span>
            <span class="meta-pill" *ngIf="course.estimatedDurationMinutes">⏱ {{ course.estimatedDurationMinutes }} دقیقه</span>
            <span class="meta-pill">🎓 دوره</span>
          </div>

          <div class="watch-description" *ngIf="course.videoDescription">
            <h4>درباره این ویدیو</h4>
            <p>{{ course.videoDescription }}</p>
          </div>
          <div class="watch-description" *ngIf="course.description && !course.videoDescription">
            <h4>درباره این دوره</h4>
            <p>{{ course.description }}</p>
          </div>

          <!-- Feedback / Comments -->
          <div class="feedback-section">
            <h3 class="feedback-title">💬 بازخورد و نظرات شما درباره این ویدیو</h3>
            <div class="feedback-form">
              <textarea [(ngModel)]="newFeedback" rows="3" placeholder="نظر یا بازخورد خود درباره این ویدیو را بنویسید..." maxlength="2000"></textarea>
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

        <!-- Sidebar -->
        <aside class="watch-side animate-fade-up delay-1">
          <div class="side-card" *ngIf="course.thumbnailUrl || course.videoUrl">
            <h4>مشخصات ویدیو</h4>
            <div class="side-row"><span>دوره:</span><strong>{{ course.title }}</strong></div>
            <div class="side-row"><span>تاریخ انتشار:</span><strong>{{ toShamsi(course.createdDate) }}</strong></div>
            <div class="side-row" *ngIf="course.points"><span>امتیاز دوره:</span><strong>{{ course.points }}</strong></div>
          </div>

          <a [routerLink]="['/courses', course.slug]" class="side-cta">مشاهده صفحه اصلی دوره ←</a>
        </aside>
      </div>

      <div class="watch-loading" *ngIf="loading">در حال بارگذاری ویدیو...</div>
      <div class="watch-error" *ngIf="error">{{ error }}</div>
    </div>
  `,
  styles: [`
    .watch-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px 0;
      direction: rtl;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 18px;
      color: var(--theme-primary);
      text-decoration: none;
      font-weight: 800;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }
    .back-link:hover { transform: translateX(4px); }

    .watch-layout {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 24px;
      align-items: start;
    }

    .player-frame {
      position: relative;
      border-radius: 18px;
      overflow: hidden;
      background: #0b0918;
      box-shadow: 0 24px 60px rgba(10, 8, 35, 0.4), 0 0 0 1px var(--theme-border);
    }
    .player-frame video {
      width: 100%;
      aspect-ratio: 16 / 9;
      display: block;
      background: #0b0918;
    }
    .watch-title {
      margin: 20px 0 10px 0;
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--theme-text);
      line-height: 1.6;
    }
    .watch-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
    .meta-pill {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--theme-text-secondary);
      background: var(--theme-surface-hover);
      border: 1px solid var(--theme-border);
    }

    .watch-description {
      background: var(--theme-surface);
      border: 1px solid var(--theme-border);
      border-radius: 14px;
      padding: 18px 22px;
      box-shadow: var(--theme-card-shadow);
    }
    .watch-description h4 {
      margin: 0 0 8px 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--theme-primary);
    }
    .watch-description p {
      margin: 0;
      font-size: 0.92rem;
      line-height: 2;
      color: var(--theme-text-secondary);
      text-align: justify;
      white-space: pre-line;
    }

    .watch-side { display: flex; flex-direction: column; gap: 16px; }
    .side-card {
      background: var(--theme-surface);
      border: 1px solid var(--theme-border);
      border-radius: 14px;
      padding: 18px 20px;
      box-shadow: var(--theme-card-shadow);
    }
    .side-card h4 {
      margin: 0 0 14px 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--theme-text);
    }
    .side-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 0.85rem;
      border-bottom: 1px dashed var(--theme-border);
    }
    .side-row:last-child { border-bottom: none; }
    .side-row span { color: var(--theme-text-muted); }
    .side-row strong { color: var(--theme-text); font-weight: 700; }

    .side-cta {
      display: block;
      text-align: center;
      padding: 13px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      color: #fff;
      font-weight: 800;
      font-size: 0.9rem;
      text-decoration: none;
      box-shadow: 0 8px 20px color-mix(in srgb, var(--theme-primary) 35%, transparent);
      transition: all 0.2s ease;
    }
    .side-cta:hover { transform: translateY(-2px); }

        .feedback-section {
      margin-top: 26px;
      background: var(--theme-surface);
      border: 1px solid var(--theme-border);
      border-radius: 14px;
      padding: 20px 22px;
      box-shadow: var(--theme-card-shadow);
    }
    .feedback-title { margin: 0 0 16px 0; font-size: 1rem; font-weight: 800; color: var(--theme-text); }
    .feedback-form textarea {
      width: 100%;
      padding: 12px 14px;
      border: 1.5px solid var(--theme-border);
      border-radius: 12px;
      font-family: inherit;
      font-size: 0.92rem;
      resize: vertical;
      box-sizing: border-box;
      background: var(--theme-surface);
      color: var(--theme-text);
      min-height: 84px;
    }
    .feedback-form textarea:focus { outline: none; border-color: var(--theme-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-primary) 12%, transparent); }
    .feedback-form-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
    .feedback-hint { font-size: 0.75rem; color: var(--theme-text-muted); }
    .feedback-submit {
      padding: 10px 24px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark));
      color: #fff;
      font-family: inherit;
      font-weight: 800;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .feedback-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px color-mix(in srgb, var(--theme-primary) 40%, transparent); }
    .feedback-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .feedback-list { margin-top: 20px; display: flex; flex-direction: column; gap: 12px; }
    .feedback-item { background: var(--theme-surface-hover); border: 1px solid var(--theme-border); border-radius: 12px; padding: 12px 16px; }
    .feedback-head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .feedback-avatar {
      width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
      color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem;
    }
    .feedback-meta { display: flex; flex-direction: column; }
    .feedback-user { font-weight: 800; font-size: 0.82rem; color: var(--theme-text); }
    .feedback-date { font-size: 0.7rem; color: var(--theme-text-muted); }
    .feedback-text { margin: 0; font-size: 0.88rem; line-height: 1.9; color: var(--theme-text-secondary); text-align: justify; white-space: pre-line; }
    .feedback-empty { text-align: center; color: var(--theme-text-muted); font-size: 0.85rem; padding: 12px; }

    .watch-loading, .watch-error {
      text-align: center;
      padding: 60px 20px;
      color: var(--theme-text-muted);
      font-size: 0.95rem;
    }
    .watch-error { color: var(--theme-error); }

    @media (max-width: 900px) {
      .watch-layout { grid-template-columns: 1fr; }
      .watch-title { font-size: 1.2rem; }
    }
  `]
})
export class CourseVideoWatchComponent implements OnInit {
  course: any = null;
  loading = true;
  error = '';
  feedbacks: any[] = [];
  newFeedback = '';
  submittingFeedback = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ویدیو یافت نشد';
      this.loading = false;
      return;
    }
    this.http.get<any>(`${environment.apiUrl}/courses/by-id/${id}`).subscribe({
      next: (course) => {
        this.course = course;
        this.loading = false;
        this.loadFeedbacks(course.id);
      },
      error: () => {
        this.error = 'خطا در بارگذاری ویدیو';
        this.loading = false;
      }
    });
  }

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
        this.loadFeedbacks(this.course.id);
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

  get difficultyLabel(): string {
    const labels: { [key: string]: string } = {
      'Beginner': 'مقدماتی',
      'Intermediate': 'متوسط',
      'Advanced': 'پیشرفته'
    };
    return labels[this.course?.difficulty || ''] || this.course?.difficulty || '';
  }


}
