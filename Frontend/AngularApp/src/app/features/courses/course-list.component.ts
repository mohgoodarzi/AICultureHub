import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { CourseListDto } from '../../core/models/course.model';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="page-hero animate-fade-up">
        <span class="hero-chip">✦ مسیر یادگیری</span>
        <h1>🎓 دوره‌های آموزشی</h1>
        <p>دوره‌های ساختاریافته برای ارتقای مهارت‌های هوش مصنوعی و تحول دیجیتال — از مبانی تا سطح پیشرفته.</p>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" placeholder="جستجوی دوره‌ها..." [(ngModel)]="searchTerm" (input)="loadCourses()">
        </div>
      </div>

      <div class="courses-grid">
        <div *ngFor="let course of courses" class="course-card-wrapper">
          <a [routerLink]="['/courses', course.slug]" class="course-card animate-pop">
          <div class="course-thumb" [class.featured-thumb]="course.isFeatured">
            <div class="thumb-pattern"></div>
            <span *ngIf="!course.thumbnailUrl" class="thumb-emoji">📚</span>
            <img *ngIf="course.thumbnailUrl" [src]="course.thumbnailUrl" [alt]="course.title">
            <span class="featured-badge" *ngIf="course.isFeatured">⭐ ویژه</span>
          </div>
          <div class="course-content">
            <div class="course-badges">
              <span class="difficulty" [attr.data-level]="course.difficulty">{{ getDifficultyLabel(course.difficulty) }}</span>
            </div>
            <h3>{{ course.title }}</h3>
            <p>{{ course.shortDescription }}</p>
            <div class="course-meta">
              <span>📃 {{ course.lessonCount }} درس</span>
              <span>👥 {{ course.enrolledCount }} شرکت‌کننده</span>
              <span>⚡ {{ course.points }} امتیاز</span>
            </div>
            <span class="course-cta">مشاهده دوره ←</span>
          </div>
        </a>
        <div class="course-voting-mini">
          <button class="vote-mini like" [class.active]="userVotes[course.id] === true" (click)="vote($event, course.id, true)" title="پسندیدم">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span>{{ course.likeCount || 0 }}</span>
          </button>
          <button class="vote-mini dislike" [class.active]="userVotes[course.id] === false" (click)="vote($event, course.id, false)" title="نپسندیدم">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" transform="rotate(180 12 12)"/></svg>
            <span>{{ course.dislikeCount || 0 }}</span>
          </button>
        </div>
      </div>

      <div class="pagination" *ngIf="totalCount > pageSize">
        <button (click)="prevPage()" [disabled]="currentPage <= 1">قبلی</button>
        <span>صفحه {{ currentPage }} از {{ totalPages }}</span>
        <button (click)="nextPage()" [disabled]="currentPage >= totalPages">بعدی</button>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; }

    .toolbar { display: flex; justify-content: flex-end; margin-bottom: 26px; }

    .search-box { position: relative; display: flex; align-items: center; width: 340px; max-width: 100%; }
    .search-icon { position: absolute; right: 14px; font-size: 0.95rem; opacity: 0.6; pointer-events: none; }
    .search-input {
      width: 100%;
      padding: 12px 42px 12px 16px;
      border: 1.5px solid var(--theme-border);
      border-radius: 12px;
      font-size: 0.93rem;
      background: var(--theme-surface);
      color: var(--theme-text);
      transition: all 0.25s var(--ease-smooth);
      font-family: inherit;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--theme-primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 12%, transparent);
    }

    .courses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .course-card-wrapper { display: flex; flex-direction: column; }
    .course-card { flex: 1; }
    .course-voting-mini { display: flex; gap: 8px; padding: 10px 0; justify-content: center; }
    .vote-mini { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border: 1px solid var(--theme-border); border-radius: 20px; background: var(--theme-surface); cursor: pointer; font-size: 0.8rem; color: var(--theme-text-muted); transition: all 0.2s ease; font-family: inherit; }
    .vote-mini:hover { transform: scale(1.05); }
    .vote-mini.like:hover, .vote-mini.like.active { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
    .vote-mini.dislike:hover, .vote-mini.dislike.active { background: #fef9e7; border-color: #f59e0b; color: #f59e0b; }

    .course-card {
      background: var(--theme-surface);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
      text-decoration: none;
      transition: all 0.35s var(--ease-smooth);
      display: flex;
      flex-direction: column;
    }
    .course-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-md);
      border-color: color-mix(in srgb, var(--theme-primary) 30%, var(--theme-border));
    }

    .course-thumb {
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: var(--theme-background);
    }
    .course-thumb.featured-thumb { background: var(--gradient-brand); }
    .thumb-pattern {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12) 0, transparent 8px),
        radial-gradient(circle at 70% 60%, rgba(255,255,255,0.10) 0, transparent 6px),
        radial-gradient(circle at 45% 85%, rgba(255,255,255,0.10) 0, transparent 7px);
      background-size: 90px 90px;
    }
    .thumb-emoji { font-size: 3.2rem; position: relative; filter: drop-shadow(0 6px 14px rgba(0,0,0,0.2)); transition: transform 0.35s var(--ease-spring); }
    .course-card:hover .thumb-emoji { transform: scale(1.18) rotate(-6deg); }
    .course-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
    .course-card:hover .course-thumb img { transform: scale(1.07); }

    .featured-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 5px 13px;
      border-radius: 100px;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(6px);
      font-size: 0.73rem;
      font-weight: 800;
      color: var(--theme-warning);
      box-shadow: 0 4px 12px rgba(0,0,0,0.18);
    }

    .course-content { padding: 20px 22px 22px; display: flex; flex-direction: column; flex: 1; }
    .course-badges { display: flex; gap: 8px; margin-bottom: 10px; }
    .difficulty {
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 0.73rem;
      font-weight: 800;
      background: var(--theme-background);
      color: var(--theme-text-secondary);
      border: 1px solid var(--theme-border);
    }
    .difficulty[data-level="Beginner"] { background: color-mix(in srgb, var(--theme-success) 12%, transparent); color: var(--theme-success); border-color: color-mix(in srgb, var(--theme-success) 25%, transparent); }
    .difficulty[data-level="Intermediate"] { background: color-mix(in srgb, var(--theme-warning) 12%, transparent); color: var(--theme-warning); border-color: color-mix(in srgb, var(--theme-warning) 25%, transparent); }
    .difficulty[data-level="Advanced"] { background: color-mix(in srgb, var(--theme-error) 12%, transparent); color: var(--theme-error); border-color: color-mix(in srgb, var(--theme-error) 25%, transparent); }

    .course-content h3 { margin: 0 0 8px; color: var(--theme-text); font-size: 1.06rem; font-weight: 800; line-height: 1.6; }
    .course-content p {
      color: var(--theme-text-secondary);
      font-size: 0.87rem;
      margin: 0 0 14px 0;
      line-height: 1.8;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .course-meta {
      display: flex;
      gap: 14px;
      color: var(--theme-text-muted);
      font-size: 0.77rem;
      font-weight: 600;
      flex-wrap: wrap;
    }

    .course-cta {
      margin-top: 14px;
      color: var(--theme-primary);
      font-weight: 800;
      font-size: 0.84rem;
      opacity: 0;
      transform: translateY(4px);
      transition: all 0.3s ease;
    }
    .course-card:hover .course-cta { opacity: 1; transform: translateY(0); }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 28px; }
    .pagination button {
      padding: 10px 22px;
      background: var(--gradient-brand);
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      font-family: inherit;
      transition: all 0.25s ease;
      box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-primary) 25%, transparent);
    }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
    .pagination button:hover:not(:disabled) { transform: translateY(-2px); }
    .pagination span { color: var(--theme-text-secondary); font-weight: 600; font-size: 0.9rem; }

    @media (max-width: 1024px) { .courses-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .courses-grid { grid-template-columns: 1fr; } .toolbar { justify-content: stretch; } .search-box { width: 100%; } }
  `]
})
export class CourseListComponent implements OnInit {
  courses: CourseListDto[] = [];
  searchTerm = '';
  currentPage = 1;
  pageSize = 9;
  totalCount = 0;
  totalPages = 0;
  userVotes: { [courseId: number]: boolean | null } = {};

  constructor(private courseService: CourseService) {}

  ngOnInit(): void { this.loadCourses(); }

  loadCourses(): void {
    this.courseService.getCourses(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (result) => {
        this.courses = result.items;
        this.totalCount = result.totalCount;
        this.totalPages = result.totalPages;
        this.loadVoteStatuses();
      }
    });
  }

  loadVoteStatuses(): void {
    this.courses.forEach(course => {
      this.courseService.getVoteStatus(course.id).subscribe({
        next: (result) => { this.userVotes[course.id] = result.userVote; course.likeCount = result.likeCount; course.dislikeCount = result.dislikeCount; }
      });
    });
  }

  vote(event: Event, courseId: number, isLike: boolean): void {
    event.preventDefault();
    event.stopPropagation();
    this.courseService.vote(courseId, isLike).subscribe({
      next: (result) => {
        this.userVotes[courseId] = result.userVote;
        const course = this.courses.find(c => c.id === courseId);
        if (course) { course.likeCount = result.likeCount; course.dislikeCount = result.dislikeCount; }
      },
      error: (err) => {
        if (err.status === 401) alert('لطفاً وارد شوید');
      }
    });
  }

  prevPage(): void { this.currentPage--; this.loadCourses(); }
  nextPage(): void { this.currentPage++; this.loadCourses(); }

  getDifficultyLabel(level: string | undefined): string {
    const labels: { [key: string]: string } = {
      'Beginner': 'مبتدی',
      'Intermediate': 'متوسط',
      'Advanced': 'پیشرفته'
    };
    return labels[level || ''] || level || '';
  }
}
