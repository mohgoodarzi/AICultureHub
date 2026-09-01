import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { ArticleDto } from '../../core/models/article.model';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="article-detail" *ngIf="article">
      <a routerLink="/articles" class="back-link">← بازگشت به مقالات</a>
      <div class="article-header">
        <span class="article-category">{{ article.category?.name }}</span>
        <h1>{{ article.title }}</h1>
        <div class="article-meta">
          <span>نویسنده: {{ article.authorName }}</span>
          <span>{{ article.publishedDate | date:'mediumDate' }}</span>
          <span>{{ article.readingTimeMinutes }} دقیقه مطالعه</span>
          <span>{{ article.viewCount }} بازدید</span>
        </div>
      </div>
      <div class="article-body" [innerHTML]="article.content"></div>
      <div class="article-tags" *ngIf="article.tags?.length">
        <span class="tag" *ngFor="let tag of article.tags">{{ tag.name }}</span>
      </div>

      <div class="vote-section">
        <div class="vote-container">
          <button class="vote-btn like-btn" [class.active]="userVote === true" (click)="vote(true)" title="پسندیدن">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span class="vote-count">{{ likeCount }}</span>
          </button>

          <button class="vote-btn dislike-btn" [class.active]="userVote === false" (click)="vote(false)" title="نپسندیدن">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" transform="rotate(180 12 12)"/>
            </svg>
            <span class="vote-count">{{ dislikeCount }}</span>
          </button>
        </div>
        <div class="vote-message" *ngIf="voteMessage">{{ voteMessage }}</div>
      </div>
    </div>
  `,
  styles: [`
    .article-detail { max-width: 800px; margin: 0 auto; }
    .back-link { display: inline-block; margin-bottom: 20px; color: #667eea; text-decoration: none; font-weight: 600; }
    .article-header { margin-bottom: 30px; }
    .article-category { font-size: 0.85rem; color: #667eea; font-weight: 600; text-transform: uppercase; }
    .article-header h1 { font-size: 2rem; color: #333; margin: 10px 0; }
    .article-meta { display: flex; gap: 20px; color: #666; font-size: 0.9rem; flex-wrap: wrap; }
    .article-body { line-height: 1.8; color: #333; font-size: 1.05rem; }
    .article-tags { margin-top: 30px; display: flex; gap: 8px; flex-wrap: wrap; }
    .tag { padding: 6px 12px; background: #f0f3ff; color: #667eea; border-radius: 20px; font-size: 0.85rem; }
    .vote-section { margin-top: 40px; padding-top: 30px; border-top: 2px solid #e8ecf0; }
    .vote-container { display: flex; gap: 16px; align-items: center; }
    .vote-btn { display: flex; align-items: center; gap: 8px; padding: 12px 20px; border: 2px solid #e0e0e0; border-radius: 12px; background: white; cursor: pointer; transition: all 0.2s ease; font-size: 1rem; color: #666; }
    .vote-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .vote-btn svg { width: 24px; height: 24px; }
    .vote-count { font-weight: 700; font-size: 1.1rem; }
    .like-btn:hover, .like-btn.active { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
    .like-btn.active svg { fill: #ef4444; }
    .dislike-btn:hover, .dislike-btn.active { background: #fef9e7; border-color: #f59e0b; color: #f59e0b; }
    .dislike-btn.active svg { fill: #f59e0b; }
    .vote-message { margin-top: 12px; font-size: 0.9rem; color: #10b981; }
  `]
})
export class ArticleDetailComponent implements OnInit {
  article: ArticleDto | null = null;
  likeCount = 0;
  dislikeCount = 0;
  userVote: boolean | null = null;
  voteMessage = '';

  constructor(private route: ActivatedRoute, private articleService: ArticleService) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.articleService.getArticle(slug).subscribe({
        next: (article) => {
          this.article = article;
          this.articleService.recordView(article.id).subscribe();
          this.loadVoteStatus(article.id);
        }
      });
    }
  }

  loadVoteStatus(articleId: number): void {
    this.articleService.getVoteStatus(articleId).subscribe({
      next: (result) => {
        this.likeCount = result.likeCount;
        this.dislikeCount = result.dislikeCount;
        this.userVote = result.userVote ?? null;
      }
    });
  }

  vote(isLike: boolean): void {
    if (!this.article) return;

    this.articleService.vote(this.article.id, isLike).subscribe({
      next: (result) => {
        this.likeCount = result.likeCount;
        this.dislikeCount = result.dislikeCount;
        this.userVote = result.userVote ?? null;

        if (result.userVote === null) {
          this.voteMessage = 'رای شما حذف شد';
        } else if (result.userVote === true) {
          this.voteMessage = 'ممنون از پسندیدن شما!';
        } else {
          this.voteMessage = 'رای شما ثبت شد';
        }

        setTimeout(() => this.voteMessage = '', 3000);
      },
      error: () => {
        this.voteMessage = 'برای رأی دادن لطفاً وارد شوید';
        setTimeout(() => this.voteMessage = '', 3000);
      }
    });
  }
}
