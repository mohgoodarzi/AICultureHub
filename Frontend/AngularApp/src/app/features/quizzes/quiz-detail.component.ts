import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { QuizDto, QuizAttemptResultDto, SubmitQuizRequest, QuestionDto } from '../../core/models/quiz.model';

@Component({
  selector: 'app-quiz-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="quiz-detail" *ngIf="quiz && !result">
      <a routerLink="/quizzes" class="back-link">→ بازگشت به آزمون‌ها</a>
      <div class="quiz-header animate-fade-up">
        <div class="hero-grid-bg"></div>
        <span class="hero-chip">🧪 آزمون دانش</span>
        <h1>{{ quiz.title }}</h1>
        <p>{{ quiz.description }}</p>
        <div class="quiz-info">
          <span class="meta-pill">❓ {{ quiz.questionCount }} سوال</span>
          <span class="meta-pill">⏱ {{ quiz.timeLimit }} دقیقه</span>
          <span class="meta-pill">✅ حداقل {{ quiz.passingScore }}٪</span>
          <span class="meta-pill">⭐ {{ quiz.points }} امتیاز</span>
        </div>
      </div>
      <div class="questions">
        <div class="question-card animate-pop" *ngFor="let question of quiz.questions; let i = index">
          <h3><span class="q-num">{{ i + 1 }}</span> سوال {{ i + 1 }} <small>({{ question.points }} امتیاز)</small></h3>
          <p class="question-text">{{ question.questionText }}</p>
          <div class="answers">
            <button *ngFor="let answer of question.answers"
                    class="answer-btn"
                    [class.selected]="selectedAnswers[question.id] === answer.id"
                    (click)="selectAnswer(question.id, answer.id)">
              <span class="answer-check"></span>
              {{ answer.answerText }}
            </button>
          </div>
        </div>
      </div>
      <button class="btn-submit" (click)="submitQuiz()" [disabled]="!allAnswered()">
        {{ allAnswered() ? '✓ ثبت نهایی پاسخ‌ها' : 'به همه سوالات پاسخ دهید' }}
      </button>
    </div>
    <div class="quiz-result" *ngIf="result">
      <h1 class="result-title animate-fade-up">{{ result.isPassed ? '🎉 آفرین!' : '💡 تلاش دوباره' }}</h1>
      <div class="result-card animate-pop" [class.passed]="result.isPassed" [class.failed]="!result.isPassed">
        <div class="score-ring" [class.passed]="result.isPassed" [class.failed]="!result.isPassed">
          <span class="score">{{ result.percentage | number:'1.0-0' }}٪</span>
        </div>
        <p class="score-sub">{{ result.correctAnswers }} از {{ result.totalQuestions }} پاسخ صحیح</p>
        <p class="points-earned" *ngIf="result.pointsEarned > 0">+{{ result.pointsEarned }} امتیاز کسب کردید!</p>
      </div>
      <div class="question-review animate-fade-up" *ngFor="let qr of result.questionResults; let i = index">
        <div class="review-header" [class.correct]="qr.isCorrect" [class.incorrect]="!qr.isCorrect">
          <span>{{ qr.isCorrect ? '✅' : '❌' }}</span>
          <h4>سوال {{ i + 1 }}</h4>
        </div>
        <p>{{ qr.questionText }}</p>
        <p class="explanation" *ngIf="qr.explanation">💡 توضیح: {{ qr.explanation }}</p>
      </div>
      <a routerLink="/quizzes" class="btn-primary back-btn">بازگشت به آزمون‌ها</a>
    </div>
  `,
  styles: [`
    .quiz-detail, .quiz-result { max-width: 820px; margin: 0 auto; }

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

    .quiz-header {
      position: relative;
      color: white;
      padding: 36px 38px;
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

    .hero-chip {
      position: relative;
      display: inline-flex;
      padding: 6px 15px;
      border-radius: 100px;
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.28);
      backdrop-filter: blur(8px);
      font-size: 0.78rem;
      font-weight: 700;
      margin-bottom: 14px;
    }

    .quiz-header h1 { position: relative; margin: 0 0 10px 0; font-size: 1.7rem; font-weight: 900; letter-spacing: -0.02em; }
    .quiz-header p { position: relative; opacity: 0.9; line-height: 1.9; margin-bottom: 18px; }

    .quiz-info { display: flex; gap: 10px; flex-wrap: wrap; position: relative; }
    .meta-pill {
      padding: 7px 15px;
      border-radius: 100px;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.25);
      backdrop-filter: blur(6px);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .question-card {
      background: var(--theme-surface);
      padding: 24px;
      border-radius: var(--radius-md);
      margin-bottom: 18px;
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
      transition: all 0.3s var(--ease-smooth);
    }
    .question-card:hover { border-color: color-mix(in srgb, var(--theme-primary) 25%, var(--theme-border)); }

    .question-card h3 {
      margin: 0 0 12px 0;
      color: var(--theme-text-muted);
      font-size: 0.82rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .question-card h3 small { color: var(--theme-text-muted); font-weight: 600; }
    .q-num {
      width: 30px; height: 30px;
      border-radius: 10px;
      background: var(--gradient-brand);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      font-weight: 800;
    }

    .question-text { font-size: 1.05rem; color: var(--theme-text); margin-bottom: 16px; font-weight: 700; line-height: 1.9; }

    .answers { display: flex; flex-direction: column; gap: 10px; }

    .answer-btn {
      padding: 13px 16px;
      border: 2px solid var(--theme-border);
      background: var(--theme-surface);
      border-radius: 12px;
      cursor: pointer;
      text-align: right;
      transition: all 0.25s var(--ease-smooth);
      font-family: inherit;
      font-size: 0.93rem;
      color: var(--theme-text);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .answer-check {
      width: 20px; height: 20px;
      border-radius: 50%;
      border: 2px solid var(--theme-border);
      flex-shrink: 0;
      transition: all 0.25s var(--ease-spring);
      position: relative;
    }
    .answer-btn:hover {
      border-color: color-mix(in srgb, var(--theme-primary) 50%, var(--theme-border));
      background: color-mix(in srgb, var(--theme-primary) 4%, var(--theme-surface));
      transform: translateX(-3px);
    }
    .answer-btn.selected {
      border-color: var(--theme-primary);
      background: color-mix(in srgb, var(--theme-primary) 8%, var(--theme-surface));
      font-weight: 700;
      box-shadow: 0 4px 16px color-mix(in srgb, var(--theme-primary) 18%, transparent);
    }
    .answer-btn.selected .answer-check {
      border-color: var(--theme-primary);
      background: var(--theme-primary);
      box-shadow: inset 0 0 0 3.5px var(--theme-surface);
    }

    .btn-submit {
      width: 100%;
      padding: 16px;
      background: var(--gradient-brand);
      background-size: 180% 180%;
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
      margin-top: 18px;
      font-family: inherit;
      box-shadow: 0 8px 24px color-mix(in srgb, var(--theme-primary) 32%, transparent);
      transition: all 0.3s var(--ease-smooth);
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-2px); background-position: 100% 50%; box-shadow: 0 12px 30px color-mix(in srgb, var(--theme-primary) 42%, transparent); }
    .btn-submit:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

    .result-title { text-align: center; margin-bottom: 22px; font-size: 1.8rem; font-weight: 900; color: var(--theme-text); }

    .result-card {
      text-align: center;
      background: var(--theme-surface);
      padding: 44px;
      border-radius: var(--radius-lg);
      margin-bottom: 26px;
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
    }
    .result-card.passed { border: 2px solid color-mix(in srgb, var(--theme-success) 55%, transparent); box-shadow: 0 16px 44px color-mix(in srgb, var(--theme-success) 16%, transparent); }
    .result-card.failed { border: 2px solid color-mix(in srgb, var(--theme-error) 55%, transparent); box-shadow: 0 16px 44px color-mix(in srgb, var(--theme-error) 14%, transparent); }

    .score-ring {
      width: 150px; height: 150px;
      margin: 0 auto 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    .score-ring.passed { background: conic-gradient(var(--theme-success) 0% 100%, color-mix(in srgb, var(--theme-success) 12%, transparent) 0); mask: radial-gradient(farthest-side, transparent calc(100% - 12px), #000 calc(100% - 11px)); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 12px), #000 calc(100% - 11px)); }
    .score-ring.failed { background: conic-gradient(var(--theme-error) 0% 100%, color-mix(in srgb, var(--theme-error) 12%, transparent) 0); mask: radial-gradient(farthest-side, transparent calc(100% - 12px), #000 calc(100% - 11px)); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 12px), #000 calc(100% - 11px)); }

    .score { font-size: 3rem; font-weight: 900; color: var(--theme-text); }
    .score-sub { color: var(--theme-text-secondary); font-size: 0.95rem; margin-bottom: 8px; }
    .points-earned { color: var(--theme-success); font-weight: 800; font-size: 1.1rem; }

    .question-review {
      background: var(--theme-surface);
      padding: 18px 20px;
      border-radius: var(--radius-sm);
      margin-bottom: 12px;
      box-shadow: var(--shadow-sm);
      border-right: 4px solid;
      border-top: 1px solid var(--theme-border);
    }
    .question-review.correct { border-right-color: var(--theme-success); }
    .question-review.incorrect { border-right-color: var(--theme-error); }
    .review-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .review-header h4 { margin: 0; color: var(--theme-text); font-weight: 800; }
    .explanation { color: var(--theme-text-secondary); font-size: 0.88rem; font-style: italic; line-height: 1.8; }

    .back-btn { display: inline-block; padding: 13px 28px; border-radius: 12px; font-weight: 800; }
  `]
})
export class QuizDetailComponent implements OnInit {
  quiz: QuizDto | null = null;
  result: QuizAttemptResultDto | null = null;
  selectedAnswers: { [questionId: number]: number } = {};
  startTime = 0;

  constructor(private route: ActivatedRoute, private quizService: QuizService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.quizService.getQuiz(parseInt(id)).subscribe({
        next: (data) => { this.quiz = data; this.startTime = Date.now(); }
      });
    }
  }

  selectAnswer(questionId: number, answerId: number): void {
    this.selectedAnswers[questionId] = answerId;
  }

  allAnswered(): boolean {
    if (!this.quiz) return false;
    return this.quiz.questions.every(q => this.selectedAnswers[q.id] !== undefined);
  }

  submitQuiz(): void {
    if (!this.quiz) return;
    const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
    const request: SubmitQuizRequest = {
      answers: Object.entries(this.selectedAnswers).map(([qId, aId]) => ({
        questionId: parseInt(qId), selectedAnswerId: aId
      })),
      timeSpentSeconds: timeSpent
    };
    this.quizService.submitQuiz(this.quiz.id, request).subscribe({
      next: (result) => this.result = result
    });
  }
}
