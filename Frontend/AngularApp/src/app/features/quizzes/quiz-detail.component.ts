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
      <a routerLink="/quizzes" class="back-link">← Back to Quizzes</a>
      <div class="quiz-header">
        <h1>{{ quiz.title }}</h1>
        <p>{{ quiz.description }}</p>
        <div class="quiz-info">
          <span>{{ quiz.questionCount }} questions</span>
          <span>{{ quiz.timeLimit }} minutes</span>
          <span>Pass: {{ quiz.passingScore }}%</span>
          <span>{{ quiz.points }} points</span>
        </div>
      </div>
      <div class="questions">
        <div class="question-card" *ngFor="let question of quiz.questions; let i = index">
          <h3>Question {{ i + 1 }} ({{ question.points }} pts)</h3>
          <p class="question-text">{{ question.questionText }}</p>
          <div class="answers">
            <button *ngFor="let answer of question.answers"
                    class="answer-btn"
                    [class.selected]="selectedAnswers[question.id] === answer.id"
                    (click)="selectAnswer(question.id, answer.id)">
              {{ answer.answerText }}
            </button>
          </div>
        </div>
      </div>
      <button class="btn-submit" (click)="submitQuiz()" [disabled]="!allAnswered()">Submit Quiz</button>
    </div>
    <div class="quiz-result" *ngIf="result">
      <h1>Quiz Complete!</h1>
      <div class="result-card" [class.passed]="result.isPassed" [class.failed]="!result.isPassed">
        <h2>{{ result.isPassed ? '🎉 Passed!' : '❌ Failed' }}</h2>
        <div class="score">{{ result.percentage | number:'1.0-0' }}%</div>
        <p>{{ result.correctAnswers }} of {{ result.totalQuestions }} correct</p>
        <p class="points-earned" *ngIf="result.pointsEarned > 0">+{{ result.pointsEarned }} points earned!</p>
      </div>
      <div class="question-review" *ngFor="let qr of result.questionResults; let i = index">
        <div class="review-header" [class.correct]="qr.isCorrect" [class.incorrect]="!qr.isCorrect">
          <span>{{ qr.isCorrect ? '✅' : '❌' }}</span>
          <h4>Question {{ i + 1 }}</h4>
        </div>
        <p>{{ qr.questionText }}</p>
        <p class="explanation" *ngIf="qr.explanation">Explanation: {{ qr.explanation }}</p>
      </div>
      <a routerLink="/quizzes" class="btn-primary">Back to Quizzes</a>
    </div>
  `,
  styles: [`
    .quiz-detail, .quiz-result { max-width: 800px; margin: 0 auto; }
    .back-link { display: inline-block; margin-bottom: 20px; color: #667eea; text-decoration: none; font-weight: 600; }
    .quiz-header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; }
    .quiz-header h1 { margin: 0 0 8px 0; }
    .quiz-info { display: flex; gap: 20px; margin-top: 16px; opacity: 0.9; }
    .question-card { background: white; padding: 20px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
    .question-card h3 { margin: 0 0 8px 0; color: #333; }
    .question-text { font-size: 1.05rem; color: #333; margin-bottom: 12px; }
    .answers { display: flex; flex-direction: column; gap: 8px; }
    .answer-btn { padding: 12px 16px; border: 2px solid #e0e0e0; background: white; border-radius: 8px; cursor: pointer; text-align: left; transition: all 0.3s; }
    .answer-btn:hover, .answer-btn.selected { border-color: #667eea; background: #f0f3ff; }
    .btn-submit { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 16px; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .result-card { text-align: center; background: white; padding: 40px; border-radius: 16px; margin-bottom: 24px; }
    .result-card.passed { border: 3px solid #27ae60; }
    .result-card.failed { border: 3px solid #e74c3c; }
    .score { font-size: 3rem; font-weight: 700; color: #333; margin: 16px 0; }
    .points-earned { color: #27ae60; font-weight: 700; font-size: 1.1rem; }
    .question-review { background: white; padding: 16px; border-radius: 10px; margin-bottom: 12px; border-left: 4px solid; }
    .question-review.correct { border-color: #27ae60; }
    .question-review.incorrect { border-color: #e74c3c; }
    .review-header { display: flex; align-items: center; gap: 8px; }
    .review-header h4 { margin: 0; }
    .explanation { color: #666; font-size: 0.9rem; font-style: italic; }
    .btn-primary { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
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
