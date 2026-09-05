import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseDto, CourseListDto, CreateCourseRequest, LessonDto } from '../models/course.model';
import { PaginatedResult } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private API_URL = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  getCourses(page: number = 1, pageSize: number = 10, search?: string): Observable<PaginatedResult<CourseListDto>> {
    let params: any = { pageNumber: page.toString(), pageSize: pageSize.toString() };
    if (search) params.search = search;
    return this.http.get<PaginatedResult<CourseListDto>>(this.API_URL, { params });
  }

  getCourse(slug: string): Observable<CourseDto> {
    return this.http.get<CourseDto>(`${this.API_URL}/${slug}`);
  }

  getCourseById(id: number): Observable<CourseDto> {
    return this.http.get<CourseDto>(`${this.API_URL}/by-id/${id}`);
  }

  createCourse(request: CreateCourseRequest): Observable<CourseDto> {
    return this.http.post<CourseDto>(this.API_URL, request);
  }

  updateCourse(id: number, request: CreateCourseRequest): Observable<CourseDto> {
    return this.http.put<CourseDto>(`${this.API_URL}/${id}`, request);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  enrollInCourse(id: number): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${id}/enroll`, {});
  }

  completeLesson(lessonId: number): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/lessons/${lessonId}/complete`, {});
  }

  getLesson(lessonId: number): Observable<LessonDto> {
    return this.http.get<LessonDto>(`${this.API_URL}/lessons/${lessonId}`);
  }

  vote(id: number, isLike: boolean): Observable<VoteResult> {
    return this.http.post<VoteResult>(`${this.API_URL}/${id}/vote`, { isLike });
  }

  getVoteStatus(id: number): Observable<VoteResult> {
    return this.http.get<VoteResult>(`${this.API_URL}/${id}/vote-status`);
  }
}

export interface VoteResult {
  likeCount: number;
  dislikeCount: number;
  userVote: boolean | null;
}
