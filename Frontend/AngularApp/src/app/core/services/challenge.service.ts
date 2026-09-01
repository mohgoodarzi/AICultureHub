import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChallengeDto, ChallengeResultDto } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private API_URL = `${environment.apiUrl}/challenges`;

  constructor(private http: HttpClient) {}

  getDailyChallenge(): Observable<ChallengeDto> {
    return this.http.get<ChallengeDto>(`${this.API_URL}/daily`);
  }

  submitAnswer(id: number, answer: string): Observable<ChallengeResultDto> {
    return this.http.post<ChallengeResultDto>(`${this.API_URL}/${id}/submit`, { answer });
  }

  getHistory(count: number = 10): Observable<ChallengeDto[]> {
    return this.http.get<ChallengeDto[]>(`${this.API_URL}/history`, {
      params: { count: count.toString() }
    });
  }
}
