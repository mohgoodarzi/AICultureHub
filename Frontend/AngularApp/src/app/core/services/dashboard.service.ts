import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardDto, ChallengeDto, ChallengeResultDto, LeaderboardEntryDto, NotificationDto } from '../models/dashboard.model';
import { PaginatedResult, PagedRequest } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private API_URL = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardDto> {
    return this.http.get<DashboardDto>(`${this.API_URL}/dashboard`);
  }

  getLeaderboard(period: string = 'all', page: number = 1, pageSize: number = 20): Observable<LeaderboardEntryDto[]> {
    return this.http.get<LeaderboardEntryDto[]>(`${this.API_URL}/dashboard/leaderboard`, {
      params: { period, page: page.toString(), pageSize: pageSize.toString() }
    });
  }

  getNotifications(count: number = 20): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.API_URL}/dashboard/notifications`, {
      params: { count: count.toString() }
    });
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.API_URL}/dashboard/notifications/unread-count`);
  }

  markNotificationRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/dashboard/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/dashboard/notifications/read-all`, {});
  }
}
