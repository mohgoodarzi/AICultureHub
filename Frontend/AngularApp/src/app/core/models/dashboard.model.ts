import { BadgeDto, LevelDto, UserDto } from './auth.model';
import { ArticleListDto } from './article.model';
import { CourseListDto } from './course.model';

export interface DashboardDto {
  user: UserDto;
  currentLevel?: LevelDto;
  totalPoints: number;
  pointsToNextLevel: number;
  levelProgressPercentage: number;
  learningStreak: number;
  recentBadges: BadgeDto[];
  recommendedArticles: ArticleListDto[];
  recommendedCourses: CourseListDto[];
  dailyChallenge?: ChallengeDto;
  unreadNotifications: number;
  userRank?: number;
}

export interface ChallengeDto {
  id: number;
  title: string;
  description?: string;
  challengeType: string;
  questionText: string;
  options: string[];
  explanation?: string;
  points: number;
  difficulty: string;
  category?: CategoryDto;
  activeDate?: string;
  isCompleted: boolean;
  wasCorrect?: boolean;
}

export interface ChallengeResultDto {
  challengeId: number;
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string;
  pointsEarned: number;
  totalPoints: number;
}

export interface LeaderboardEntryDto {
  rank: number;
  userId: number;
  displayName: string;
  avatarUrl?: string;
  levelName: string;
  levelColor: string;
  totalPoints: number;
  badgesCount: number;
}

export interface NotificationDto {
  id: number;
  title: string;
  message?: string;
  notificationType: string;
  referenceType?: string;
  referenceId?: number;
  isRead: boolean;
  createdDate: string;
}

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  color?: string;
}
