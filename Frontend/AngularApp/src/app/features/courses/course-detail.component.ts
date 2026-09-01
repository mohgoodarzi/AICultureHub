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
      <a routerLink="/courses" class="back-link">← Back to Courses</a>
      <div class="course-header">
        <div class="course-info">
          <span class="difficulty">{{ course.difficulty }}</span>
          <h1>{{ course.title }}</h1>
          <p>{{ course.description }}</p>
          <div class="course-meta">
            <span>📚 {{ course.lessonCount }} lessons</span>
            <span>⏱️ {{ course.estimatedDurationMinutes }} min</span>
            <span>⭐ {{ course.points }} points</span>
            <span>👥 {{ course.enrolledCount }} enrolled</span>
          </div>
          <div class="course-actions" *ngIf="!course.userEnrollment">
            <button class="btn-primary" (click)="enroll()">Enroll in Course</button>
          </div>
          <div class="enrollment-info" *ngIf="course.userEnrollment">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="course.userEnrollment.progressPercentage"></div>
            </div>
            <span>{{ course.userEnrollment.progressPercentage }}% Complete</span>
          </div>
        </div>
      </div>
      <div class="lessons-section">
        <h2>Lessons</h2>
        <div class="lesson-list">
          <div class="lesson-item" *ngFor="let lesson of course.lessons; let i = index"
               [class.completed]="lesson.isCompleted">
            <span class="lesson-number">{{ i + 1 }}</span>
            <div class="lesson-info">
              <h4>{{ lesson.title }}</h4>
              <span>{{ lesson.estimatedDurationMinutes }} min · {{ lesson.points }} pts</span>
            </div>
            <button class="btn-complete" *ngIf="!lesson.isCompleted && course.userEnrollment"
                    (click)="completeLesson(lesson.id)">Complete</button>
            <span class="completed-badge" *ngIf="lesson.isCompleted">✅</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .course-detail { max-width: 900px; margin: 0 auto; }
    .back-link { display: inline-block; margin-bottom: 20px; color: #667eea; text-decoration: none; font-weight: 600; }
    .course-header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; }
    .difficulty { padding: 4px 12px; background: rgba(255,255,255,0.2); border-radius: 12px; font-size: 0.8rem; }
    .course-header h1 { font-size: 1.8rem; margin: 12px 0; }
    .course-header p { opacity: 0.9; margin: 0 0 16px 0; }
    .course-meta { display: flex; gap: 20px; font-size: 0.9rem; opacity: 0.9; }
    .btn-primary { padding: 12px 24px; background: white; color: #667eea; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 16px; }
    .enrollment-info { margin-top: 16px; }
    .progress-bar { height: 8px; background: rgba(255,255,255,0.3); border-radius: 4px; margin-bottom: 8px; }
    .progress-fill { height: 100%; background: white; border-radius: 4px; }
    .lessons-section h2 { color: #333; margin-bottom: 16px; }
    .lesson-list { display: flex; flex-direction: column; gap: 12px; }
    .lesson-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: white; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
    .lesson-item.completed { opacity: 0.7; }
    .lesson-number { width: 36px; height: 36px; border-radius: 50%; background: #f0f3ff; color: #667eea; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .lesson-info { flex: 1; }
    .lesson-info h4 { margin: 0 0 4px 0; color: #333; }
    .lesson-info span { font-size: 0.85rem; color: #666; }
    .btn-complete { padding: 8px 16px; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .completed-badge { font-size: 1.3rem; }
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
