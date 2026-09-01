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
      <div class="page-header">
        <h1>دوره</h1>
        <input type="text" class="search-input" placeholder="جستجو..." [(ngModel)]="searchTerm" (input)="loadCourses()">
      </div>
      <div class="courses-grid">
        <a *ngFor="let course of courses" [routerLink]="['/courses', course.slug]" class="course-card">
          <div class="course-thumb" [style.background]="course.isFeatured ? 'linear-gradient(135deg, var(--theme-primary), var(--theme-primary-dark))' : 'var(--theme-background)'">
            <span *ngIf="!course.thumbnailUrl">📚</span>
            <img *ngIf="course.thumbnailUrl" [src]="course.thumbnailUrl" [alt]="course.title">
          </div>
          <div class="course-content">
            <div class="course-badges">
              <span class="difficulty" [attr.data-level]="course.difficulty">{{ getDifficultyLabel(course.difficulty) }}</span>
              <span class="featured" *ngIf="course.isFeatured">⭐ ویژه</span>
            </div>
            <h3>{{ course.title }}</h3>
            <p>{{ course.shortDescription }}</p>
            <div class="course-meta">
              <span>{{ course.lessonCount }} درس</span>
              <span>{{ course.enrolledCount }} شرکت‌کننده</span>
              <span>{{ course.points }} امتیاز</span>
            </div>
          </div>
        </a>
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
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.8rem; color: var(--theme-text); }
    .search-input { padding: 10px 16px; border: 1.5px solid var(--theme-border); border-radius: 8px; font-size: 0.95rem; width: 300px; background: var(--theme-surface); color: var(--theme-text); }
    .search-input:focus { outline: none; border-color: var(--theme-primary); }
    .courses-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .course-card { background: var(--theme-surface); border-radius: 12px; overflow: hidden; box-shadow: var(--theme-card-shadow); border: 1px solid var(--theme-border); text-decoration: none; transition: all 0.3s ease; }
    .course-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .course-thumb { height: 160px; display: flex; align-items: center; justify-content: center; }
    .course-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .course-thumb span { font-size: 3rem; }
    .course-content { padding: 16px; }
    .course-badges { display: flex; gap: 8px; margin-bottom: 8px; }
    .difficulty { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: var(--theme-border); color: var(--theme-text-secondary); }
    .difficulty[data-level="Beginner"] { background: rgba(90, 154, 90, 0.15); color: var(--theme-success); }
    .difficulty[data-level="Intermediate"] { background: rgba(201, 168, 92, 0.15); color: var(--theme-warning); }
    .difficulty[data-level="Advanced"] { background: rgba(180, 106, 106, 0.15); color: var(--theme-error); }
    .featured { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; background: rgba(201, 168, 92, 0.15); color: var(--theme-warning); }
    .course-content h3 { margin: 8px 0; color: var(--theme-text); font-size: 1.05rem; }
    .course-content p { color: var(--theme-text-secondary); font-size: 0.9rem; margin: 0 0 12px 0; }
    .course-meta { display: flex; gap: 16px; color: var(--theme-text-muted); font-size: 0.8rem; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; }
    .pagination button { padding: 8px 16px; border: 1.5px solid var(--theme-primary); background: var(--theme-surface); color: var(--theme-primary); border-radius: 6px; cursor: pointer; font-weight: 600; font-family: inherit; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .pagination button:hover:not(:disabled) { background: var(--theme-primary); color: white; }
    @media (max-width: 1024px) { .courses-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .courses-grid { grid-template-columns: 1fr; } .page-header { flex-direction: column; gap: 16px; align-items: flex-start; } }
  `]
})
export class CourseListComponent implements OnInit {
  courses: CourseListDto[] = [];
  searchTerm = '';
  currentPage = 1;
  pageSize = 9;
  totalCount = 0;
  totalPages = 0;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void { this.loadCourses(); }

  loadCourses(): void {
    this.courseService.getCourses(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (result) => { this.courses = result.items; this.totalCount = result.totalCount; this.totalPages = result.totalPages; }
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
