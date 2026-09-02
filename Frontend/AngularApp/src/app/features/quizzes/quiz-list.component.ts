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
      <div class="page-hero animate-fade-up">
        <span class="hero-chip">✦ سنجش دانش</span>
        <h1>🧪 آزمون‌ها</h1>
        <p>دانش هوش مصنوعی خود را بسنجید، امتیاز جمع کنید و در جدول امتیازات بالا بروید!</p>
      </div>

      <div class="quizzes-grid">
        <a *ngFor="let quiz of quizzes" [routerLink]="['/quizzes', quiz.id]" class="quiz-card animate-pop">
          <div class="quiz-top">
            <span class="difficulty" [attr.data-level]="quiz.difficulty">{{ getDifficultyLabel(quiz.difficulty) }}</span>
            <span class="points">⭐ {{ quiz.points }}</span>
          </div>
          <div class="quiz-icon">🎯</div>
          <h3>{{ quiz.title }}</h3>
          <p>{{ quiz.description }}</p>
          <div class="quiz-meta">
            <span class="meta-pill">❓ {{ quiz.questionCount }} سوال</span>
            <span class="meta-pill">⏱ {{ quiz.timeLimit }} دقیقه</span>
            <span class="meta-pill">✅ حداقل {{ quiz.passingScore }}٪</span>
          </div>
          <span class="quiz-cta">شروع آزمون ←</span>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; }

    .quizzes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

    .quiz-card {
      background: var(--theme-surface);
      padding: 24px;
      border-radius: var(--radius-md);
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
      text-decoration: none;
      transition: all 0.35s var(--ease-smooth);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .quiz-card::before {
      content: '';
      position: absolute;
      top: 0; right: 0; left: 0;
      height: 3px;
      background: var(--gradient-brand);
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.35s ease;
    }
    .quiz-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-md);
      border-color: color-mix(in srgb, var(--theme-primary) 30%, var(--theme-border));
    }
    .quiz-card:hover::before { transform: scaleX(1); }

    .quiz-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }

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

    .points {
      font-size: 0.85rem;
      color: var(--theme-primary);
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 100px;
      background: color-mix(in srgb, var(--theme-primary) 8%, transparent);
    }

    .quiz-icon {
      font-size: 2.4rem;
      margin-bottom: 12px;
      filter: drop-shadow(0 4px 10px color-mix(in srgb, var(--theme-primary) 30%, transparent));
      transition: transform 0.35s var(--ease-spring);
    }
    .quiz-card:hover .quiz-icon { transform: scale(1.15) rotate(-8deg); }

    .quiz-card h3 { margin: 0 0 8px 0; color: var(--theme-text); font-weight: 800; font-size: 1.06rem; line-height: 1.6; }
    .quiz-card p {
      color: var(--theme-text-secondary);
      font-size: 0.87rem;
      margin: 0 0 16px 0;
      line-height: 1.8;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .quiz-meta { display: flex; gap: 8px; flex-wrap: wrap; }
    .meta-pill {
      padding: 5px 12px;
      border-radius: 100px;
      background: var(--theme-background);
      border: 1px solid var(--theme-border);
      color: var(--theme-text-muted);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .quiz-cta {
      margin-top: 16px;
      color: var(--theme-primary);
      font-weight: 800;
      font-size: 0.86rem;
      opacity: 0;
      transform: translateY(4px);
      transition: all 0.3s ease;
    }
    .quiz-card:hover .quiz-cta { opacity: 1; transform: translateY(0); }

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
