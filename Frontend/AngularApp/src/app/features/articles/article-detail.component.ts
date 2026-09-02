import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService, VoteResult } from '../../core/services/article.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="article-detail">
      <a routerLink="/articles" class="back-link">← بازگشت به مقالات</a>

      <div *ngIf="loading" class="loading">در حال بارگذاری...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <ng-container *ngIf="article">
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
      </ng-container>

      <div class="vote-section">
        <h3 style="margin: 0 0 16px 0; color: #333;">آیا این مقاله را پسندیدید؟</h3>
        <div class="vote-container">
          <button class="vote-btn like-btn" [class.active]="userVote === true" (click)="vote(true)">
            👍 LIKE
            <span class="vote-count">{{ likeCount }}</span>
          </button>

          <button class="vote-btn dislike-btn" [class.active]="userVote === false" (click)="vote(false)">
            👎 DISLIKE
            <span class="vote-count">{{ dislikeCount }}</span>
          </button>
        </div>
        <div class="vote-message" *ngIf="voteMessage">{{ voteMessage }}</div>
      </div>
    </div>
  `,
  styles: [`
    .article-detail { max-width: 800px; margin: 0 auto; padding: 20px; }
    .back-link { display: inline-block; margin-bottom: 20px; color: #667eea; text-decoration: none; font-weight: 600; }
    .loading { text-align: center; padding: 40px; color: #666; }
    .error { text-align: center; padding: 40px; color: #ef4444; }
    .article-header { margin-bottom: 30px; }
    .article-category { font-size: 0.85rem; color: #667eea; font-weight: 600; text-transform: uppercase; }
    .article-header h1 { font-size: 2rem; color: #333; margin: 10px 0; }
    .article-meta { display: flex; gap: 20px; color: #666; font-size: 0.9rem; flex-wrap: wrap; }
    .article-body { line-height: 1.8; color: #333; font-size: 1.05rem; }
    .article-tags { margin-top: 30px; display: flex; gap: 8px; flex-wrap: wrap; }
    .tag { padding: 6px 12px; background: #f0f3ff; color: #667eea; border-radius: 20px; font-size: 0.85rem; }
    .vote-section { margin-top: 40px; padding-top: 30px; border-top: 2px solid #e8ecf0; }
    .vote-container { display: flex; gap: 16px; align-items: center; }
    .vote-btn { display: flex; align-items: center; gap: 8px; padding: 14px 24px; border: 2px solid #ddd; border-radius: 12px; background: white; cursor: pointer; font-size: 1rem; font-weight: 600; color: #333; min-width: 100px; justify-content: center; }
    .vote-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: #f9fafb; }
    .vote-count { background: #eee; padding: 2px 8px; border-radius: 10px; font-size: 0.9rem; }
    .like-btn.active { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
    .like-btn.active .vote-count { background: #ef4444; color: white; }
    .dislike-btn.active { background: #fef9e7; border-color: #f59e0b; color: #f59e0b; }
    .dislike-btn.active .vote-count { background: #f59e0b; color: white; }
    .vote-message { margin-top: 12px; font-size: 0.9rem; color: #10b981; padding: 8px 16px; border-radius: 8px; background: rgba(16, 185, 129, 0.1); }
  `]
})
export class ArticleDetailComponent implements OnInit {
  article: any = null;
  loading = true;
  error = '';
  likeCount = 0;
  dislikeCount = 0;
  userVote: boolean | null = null;
  voteMessage = '';

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    console.log('Article slug:', slug);

    if (!slug) {
      this.error = 'مقاله یافت نشد';
      this.loading = false;
      return;
    }

    this.articleService.getArticle(slug).subscribe({
      next: (article) => {
        console.log('Article loaded:', article);
        this.article = article;
        this.loading = false;
        this.loadVoteStatus(article.id);
      },
      error: (err) => {
        console.error('Failed to load article:', err);
        this.error = 'خطا در بارگذاری مقاله';
        this.loading = false;
      }
    });
  }

  loadVoteStatus(articleId: number): void {
    this.articleService.getVoteStatus(articleId).subscribe({
      next: (result) => {
        console.log('Vote status loaded:', result);
        this.likeCount = result.likeCount;
        this.dislikeCount = result.dislikeCount;
        this.userVote = result.userVote;
      },
      error: (err) => {
        console.error('Failed to load vote status:', err);
      }
    });
  }

  vote(isLike: boolean): void {
    if (!this.article) return;

    console.log('Voting:', this.article.id, isLike);
    this.voteMessage = 'در حال ثبت رأی...';
    this.cdr.detectChanges();

    this.articleService.vote(this.article.id, isLike).subscribe({
      next: (result) => {
        console.log('Vote result:', result);
        this.likeCount = result.likeCount;
        this.dislikeCount = result.dislikeCount;
        this.userVote = result.userVote;

        if (result.userVote === null) {
          this.voteMessage = 'رای شما حذف شد ✓';
        } else if (result.userVote === true) {
          this.voteMessage = 'ممنون از پسندیدن شما! ✓';
        } else {
          this.voteMessage = 'رای شما ثبت شد ✓';
        }

        this.cdr.detectChanges();
        setTimeout(() => { this.voteMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        console.error('Vote error:', err);
        this.voteMessage = 'خطا در ثبت رأی';
        this.cdr.detectChanges();
        setTimeout(() => { this.voteMessage = ''; this.cdr.detectChanges(); }, 4000);
      }
    });
  }
}
