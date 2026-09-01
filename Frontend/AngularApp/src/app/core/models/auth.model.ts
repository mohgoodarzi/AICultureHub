export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: UserDto;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
  employeeId?: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  department?: string;
  position?: string;
  location?: string;
  employeeId?: string;
  avatarUrl?: string;
  bio?: string;
  totalPoints: number;
  currentLevelPoints: number;
  learningStreak: number;
  currentLevel?: LevelDto;
  roles: string[];
  badges: BadgeDto[];
}

export interface LevelDto {
  id: number;
  levelNumber: number;
  name: string;
  description?: string;
  pointsRequired: number;
  color?: string;
  nextLevelPoints?: number;
}

export interface BadgeDto {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  color?: string;
  earnedDate?: string;
}
