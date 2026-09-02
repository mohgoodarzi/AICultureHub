import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { CourseDto } from '../../core/models/course.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  constructor(private route: ActivatedRoute, private courseService: CourseService) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.courseService.getCourse(slug).subscribe({ next: (data) => this.course = data });
    }
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
