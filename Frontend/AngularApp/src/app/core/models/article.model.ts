export interface ArticleDto {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  category: CategoryDto;
  author?: UserBasicDto;
  authorName?: string;
  imageUrl?: string;
  videoUrl?: string;
  readingTimeMinutes: number;
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedDate?: string;
  difficulty?: string;
  createdDate: string;
  tags: TagDto[];
  isBookmarked: boolean;
  isRead: boolean;
  userVote?: boolean | null;
}

export interface ArticleListDto {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  imageUrl?: string;
  videoUrl?: string;
  readingTimeMinutes: number;
  categoryName: string;
  authorName?: string;
  publishedDate?: string;
  difficulty?: string;
  viewCount: number;
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

export interface TagDto {
  id: number;
  name: string;
  slug: string;
}

export interface UserBasicDto {
  id: number;
  username: string;
  fullName: string;
  avatarUrl?: string;
}

export interface CreateArticleRequest {
  title: string;
  summary?: string;
  content: string;
  categoryId: number;
  imageUrl?: string;
  videoUrl?: string;
  difficulty?: string;
  isPublished: boolean;
  tagIds: number[];
}

export interface UpdateArticleRequest {
  title?: string;
  summary?: string;
  content?: string;
  categoryId?: number;
  imageUrl?: string;
  videoUrl?: string;
  difficulty?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  tagIds?: number[];
}
