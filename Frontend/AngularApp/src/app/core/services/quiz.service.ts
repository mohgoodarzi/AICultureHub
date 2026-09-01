import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuizDto, QuizAttemptResultDto, SubmitQuizRequest } from '../models/quiz.model';
import { PaginatedResult, PagedRequest } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private API_URL = `${environment.apiUrl}/quizzes`;

  constructor(private http: HttpClient) {}

  getQuizzes(page: number = 1, pageSize: number = 10, search?: string): Observable<PaginatedResult<QuizDto>> {
    let params: any = { pageNumber: page.toString(), pageSize: pageSize.toString() };
    if (search) params.search = search;
    return this.http.get<PaginatedResult<QuizDto>>(this.API_URL, { params });
  }

  getQuiz(id: number): Observable<QuizDto> {
    return this.http.get<QuizDto>(`${this.API_URL}/${id}`);
  }

  submitQuiz(id: number, request: SubmitQuizRequest): Observable<QuizAttemptResultDto> {
    return this.http.post<QuizAttemptResultDto>(`${this.API_URL}/${id}/submit`, request);
  }

  getHistory(): Observable<QuizAttemptResultDto[]> {
    return this.http.get<QuizAttemptResultDto[]>(`${this.API_URL}/history`);
  }
}
