import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArticleDto, ArticleListDto, CreateArticleRequest, UpdateArticleRequest, CategoryDto, TagDto } from '../models/article.model';
import { PaginatedResult } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private API_URL = `${environment.apiUrl}/articles`;

  constructor(private http: HttpClient) {}

  getArticles(page: number = 1, pageSize: number = 10, search?: string, categoryId?: number): Observable<PaginatedResult<ArticleListDto>> {
    let params: any = { pageNumber: page.toString(), pageSize: pageSize.toString() };
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId.toString();
    return this.http.get<PaginatedResult<ArticleListDto>>(this.API_URL, { params });
  }

  getArticle(slug: string): Observable<ArticleDto> {
    return this.http.get<ArticleDto>(`${this.API_URL}/${slug}`);
  }

  getArticleById(id: number): Observable<ArticleDto> {
    return this.http.get<ArticleDto>(`${this.API_URL}/by-id/${id}`);
  }

  createArticle(request: CreateArticleRequest): Observable<ArticleDto> {
    return this.http.post<ArticleDto>(this.API_URL, request);
  }

  updateArticle(id: number, request: UpdateArticleRequest): Observable<ArticleDto> {
    return this.http.put<ArticleDto>(`${this.API_URL}/${id}`, request);
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  toggleBookmark(id: number): Observable<{ isBookmarked: boolean }> {
    return this.http.post<{ isBookmarked: boolean }>(`${this.API_URL}/${id}/bookmark`, {});
  }

  recordView(id: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/view`, {});
  }

  vote(id: number, isLike: boolean): Observable<VoteResult> {
    return this.http.post<VoteResult>(`${this.API_URL}/${id}/vote`, { isLike });
  }

  getVoteStatus(id: number): Observable<VoteResult> {
    return this.http.get<VoteResult>(`${this.API_URL}/${id}/vote-status`);
  }

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${this.API_URL}/categories`);
  }

  getTags(): Observable<TagDto[]> {
    return this.http.get<TagDto[]>(`${this.API_URL}/tags`);
  }
}

export interface VoteResult {
  likeCount: number;
  dislikeCount: number;
  userVote: boolean | null;
}
