export interface CourseDto {
  id: number;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  difficulty?: string;
  estimatedDurationMinutes: number;
  points: number;
  category?: CategoryDto;
  lessonCount: number;
  enrolledCount: number;
  likeCount?: number;
  dislikeCount?: number;
  completionCount: number;
  averageRating?: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdDate: string;
  lessons: LessonDto[];
  userEnrollment?: EnrollmentDto;
}

export interface CourseListDto {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  difficulty?: string;
  estimatedDurationMinutes: number;
  points: number;
  categoryName: string;
  lessonCount: number;
  enrolledCount: number;
  likeCount?: number;
  dislikeCount?: number;
  averageRating?: number;
  isFeatured: boolean;
}

export interface LessonDto {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  orderIndex: number;
  estimatedDurationMinutes: number;
  points: number;
  isCompleted: boolean;
  progressPercentage: number;
}

export interface EnrollmentDto {
  id: number;
  courseId: number;
  userId: number;
  enrolledDate: string;
  completedDate?: string;
  progressPercentage: number;
  status: string;
  lastAccessedDate?: string;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  difficulty?: string;
  estimatedDurationMinutes: number;
  categoryId?: number;
  isPublished: boolean;
  lessons: CreateLessonRequest[];
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  orderIndex: number;
  estimatedDurationMinutes: number;
  points: number;
}

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder: number;
}
