import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ShamsiDate } from '../../core/utils/shamsi-date';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-article-voting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="article-voting" *ngIf="article">
      <div class="voting-controls">
        <button 
          class="vote-btn like-btn" 
          [class.active]="userVoteIsLike"
          (click)="toggleLike()">
          <span class="vote-icon">👍</span>
          <span class="vote-label">Like</span>
        </button>
        <button 
          class="vote-btn dislike-btn" 
          [class.active]="!userVoteIsLike && userHasVoted"
          (click)="toggleDislike()">
          <span class="vote-icon">👎</span>
          <span class="vote-label">Dislike</span>
        </button>
      </div>
      
      <div class="voting-stats">
        <div class="stat">
          <span class="stat-count" [style.color]="likeColor">{{ article.likeCount }}</span>
          <span class="stat-label">Love</span>
        </div>
        <div class="stat">
          <span class="stat-count" [style.color]="dislikeColor">{{ article.dislikeCount }}</span>
          <span class="stat-label">Hate</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .article-voting {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid var(--theme-border);
    }

    .vote-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s ease;
      margin-right: 8px;
      min-width: 60px;
    }

    .like-btn {
      background: var(--theme-success);
      color: white;
    }

    .like-btn.active {
      background: var(--theme-primary);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .dislike-btn {
      background: var(--theme-error);
      color: white;
    }

    .dislike-btn.active {
      background: #e57373;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .vote-icon {
      margin-right: 6px;
      font-size: 1rem;
    }

    .vote-label {
      font-size: 0.75rem;
    }

    .voting-stats {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      color: var(--theme-text-secondary);
    }

    .stat-count {
      font-weight: 600;
      color: var(--theme-primary);
    }
  `]
})
export class ArticleVotingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  article: any = null;
  userVoteIsLike: boolean | null = null;
  userHasVoted: boolean = false;
  
  likeColor = 'var(--theme-success)';
  dislikeColor = 'var(--theme-error)';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get article ID from route or state
    // this.article = history.state.article;
  }

  toggleLike(): void {
    this.http.post(`${this.authService.apiUrl}/articles/${this.article.id}/vote`, { isLike: true })
      .subscribe({
        next: () => {
          this.userVoteIsLike = true;
          this.userHasVoted = true;
          // Refresh article data
        }
      });
  }

  toggleDislike(): void {
    this.http.post(`${this.authService.apiUrl}/articles/${this.article.id}/vote`, { isLike: false })
      .subscribe({
        next: () => {
          this.userVoteIsLike = false;
          this.userHasVoted = true;
          // Refresh article data
        }
      });
  }
}