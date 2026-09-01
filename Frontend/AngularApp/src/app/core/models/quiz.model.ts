export interface QuizDto {
  id: number;
  title: string;
  description?: string;
  category?: CategoryDto;
  courseId?: number;
  difficulty: string;
  timeLimit: number;
  passingScore: number;
  points: number;
  questionCount: number;
  isPublished: boolean;
  questions: QuestionDto[];
}

export interface QuestionDto {
  id: number;
  questionText: string;
  questionType: string;
  explanation?: string;
  points: number;
  orderIndex: number;
  imageUrl?: string;
  answers: AnswerDto[];
}

export interface AnswerDto {
  id: number;
  answerText: string;
  orderIndex: number;
}

export interface QuizAttemptResultDto {
  attemptId: number;
  score: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  isPassed: boolean;
  timeSpentSeconds: number;
  pointsEarned: number;
  attemptDate: string;
  questionResults: QuestionResultDto[];
}

export interface QuestionResultDto {
  questionId: number;
  questionText: string;
  selectedAnswerId?: number;
  isCorrect: boolean;
  pointsEarned: number;
  explanation?: string;
  answers: AnswerDto[];
}

export interface SubmitQuizRequest {
  answers: QuizAnswerSubmission[];
  timeSpentSeconds: number;
}

export interface QuizAnswerSubmission {
  questionId: number;
  selectedAnswerId?: number;
}

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  color?: string;
}
