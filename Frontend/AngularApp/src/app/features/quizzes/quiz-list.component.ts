import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { QuizDto } from '../../core/models/quiz.model';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <h1>آزمون</h1>
      <div class="quizzes-grid">
        <a *ngFor="let quiz of quizzes" [routerLink]="['/quizzes', quiz.id]" class="quiz-card">
          <div class="quiz-header">
            <span class="difficulty" [attr.data-level]="quiz.difficulty">{{ getDifficultyLabel(quiz.difficulty) }}</span>
            <span class="points">⭐ {{ quiz.points }} امتیاز</span>
          </div>
          <h3>{{ quiz.title }}</h3>
          <p>{{ quiz.description }}</p>
          <div class="quiz-meta">
            <span>{{ quiz.questionCount }} سوال</span>
            <span>{{ quiz.timeLimit }} دقیقه</span>
            <span>حداقل: {{ quiz.passingScore }}%</span>
          </div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; }
    h1 { color: var(--theme-text); margin-bottom: 24px; font-size: 1.8rem; }
    .quizzes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .quiz-card { background: var(--theme-surface); padding: 20px; border-radius: 12px; box-shadow: var(--theme-card-shadow); border: 1px solid var(--theme-border); text-decoration: none; transition: all 0.3s ease; }
    .quiz-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .quiz-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .difficulty { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: var(--theme-border); color: var(--theme-text-secondary); }
    .difficulty[data-level="Beginner"] { background: rgba(90, 154, 90, 0.15); color: var(--theme-success); }
    .difficulty[data-level="Intermediate"] { background: rgba(201, 168, 92, 0.15); color: var(--theme-warning); }
    .difficulty[data-level="Advanced"] { background: rgba(180, 106, 106, 0.15); color: var(--theme-error); }
    .points { font-size: 0.85rem; color: var(--theme-primary); font-weight: 600; }
    .quiz-card h3 { margin: 0 0 8px 0; color: var(--theme-text); }
    .quiz-card p { color: var(--theme-text-secondary); font-size: 0.9rem; margin: 0 0 12px 0; }
    .quiz-meta { display: flex; gap: 16px; color: var(--theme-text-muted); font-size: 0.8rem; }
    @media (max-width: 1024px) { .quizzes-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .quizzes-grid { grid-template-columns: 1fr; } }
  `]
})
export class QuizListComponent implements OnInit {
  quizzes: QuizDto[] = [];
  constructor(private quizService: QuizService) {}
  ngOnInit(): void {
    this.quizService.getQuizzes().subscribe({ next: (result) => this.quizzes = result.items });
  }

  getDifficultyLabel(level: string | undefined): string {
    const labels: { [key: string]: string } = {
      'Beginner': 'مبتدی',
      'Intermediate': 'متوسط',
      'Advanced': 'پیشرفته'
    };
    return labels[level || ''] || level || '';
  }
}
