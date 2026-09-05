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
      <a routerLink="/articles" class="back-link">→ بازگشت به مقالات</a>

      <div *ngIf="loading" class="loading">در حال بارگذاری...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <ng-container *ngIf="article">
        <div class="article-hero animate-fade-up">
          <div class="hero-grid-bg"></div>
          <span class="article-category-chip" *ngIf="article.category">{{ article.category.name }}</span>
          <h1>{{ article.title }}</h1>
          <div class="article-meta">
            <span class="meta-item">✍️ {{ article.authorName }}</span>
            <span class="meta-item">🗓 {{ article.publishedDate | date:'mediumDate' }}</span>
            <span class="meta-item">⏱ {{ article.readingTimeMinutes }} دقیقه مطالعه</span>
            <span class="meta-item">👁 {{ article.viewCount }} بازدید</span>
          </div>
        </div>

        <article class="article-body-card animate-fade-up delay-1">
          <div class="article-body" [innerHTML]="article.content"></div>

          <div class="article-video" *ngIf="article.videoUrl">
            <video [src]="article.videoUrl" controls preload="metadata" style="width:100%; border-radius:12px; margin-top:24px;"></video>
          </div>

          <div class="article-tags" *ngIf="article.tags?.length">
            <span class="tag" *ngFor="let tag of article.tags">#{{ tag.name }}</span>
          </div>

          <div class="vote-section">
            <div class="vote-divider"><span>به این مقاله امتیاز دهید</span></div>
            <h3 class="vote-title">آیا این مقاله برای شما مفید بود؟</h3>
            <div class="vote-container">
              <button class="vote-btn like-btn" [class.active]="userVote === true" (click)="vote(true)">
                <span class="vote-emoji">👍</span>
                <span class="vote-label">مفید بود</span>
                <span class="vote-count">{{ likeCount }}</span>
              </button>

              <button class="vote-btn dislike-btn" [class.active]="userVote === false" (click)="vote(false)">
                <span class="vote-emoji">👎</span>
                <span class="vote-label">مفید نبود</span>
                <span class="vote-count">{{ dislikeCount }}</span>
              </button>
            </div>
            <div class="vote-message" *ngIf="voteMessage">{{ voteMessage }}</div>
          </div>
        </article>
      </ng-container>

      <div class="vote-section" *ngIf="!article && !loading">
        <div class="vote-divider"><span>به این مقاله امتیاز دهید</span></div>
        <h3 class="vote-title">آیا این مقاله برای شما مفید بود؟</h3>
        <div class="vote-container">
          <button class="vote-btn like-btn" [class.active]="userVote === true" (click)="vote(true)">
            <span class="vote-emoji">👍</span>
            <span class="vote-label">مفید بود</span>
            <span class="vote-count">{{ likeCount }}</span>
          </button>

          <button class="vote-btn dislike-btn" [class.active]="userVote === false" (click)="vote(false)">
            <span class="vote-emoji">👎</span>
            <span class="vote-label">مفید نبود</span>
            <span class="vote-count">{{ dislikeCount }}</span>
          </button>
        </div>
        <div class="vote-message" *ngIf="voteMessage">{{ voteMessage }}</div>
      </div>
    </div>
  `,
  styles: [`
    .article-detail { max-width: 860px; margin: 0 auto; }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 18px;
      padding: 8px 16px;
      border-radius: 100px;
      color: var(--theme-primary);
      background: color-mix(in srgb, var(--theme-primary) 8%, transparent);
      font-weight: 700;
      font-size: 0.86rem;
      transition: all 0.25s var(--ease-smooth);
    }
    .back-link:hover {
      background: color-mix(in srgb, var(--theme-primary) 15%, transparent);
      transform: translateX(4px);
    }

    .loading, .error { text-align: center; padding: 48px; color: var(--theme-text-muted); }
    .error { color: var(--theme-error); }

    /* ---- Article hero ---- */
    .article-hero {
      position: relative;
      border-radius: var(--radius-lg);
      padding: 40px 42px;
      margin-bottom: 26px;
      color: #fff;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      background:
        radial-gradient(800px 300px at 90% -20%, rgba(255,255,255,0.18), transparent 60%),
        var(--gradient-brand);
      background-size: 200% 200%;
      animation: gradientShift 14s ease infinite;
    }

    .hero-grid-bg {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(600px 300px at 70% 20%, #000 30%, transparent 75%);
      -webkit-mask-image: radial-gradient(600px 300px at 70% 20%, #000 30%, transparent 75%);
      animation: gridDrift 12s linear infinite;
      pointer-events: none;
    }

    .article-category-chip {
      position: relative;
      display: inline-block;
      padding: 6px 16px;
      border-radius: 100px;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.3);
      backdrop-filter: blur(8px);
      font-size: 0.78rem;
      font-weight: 800;
      margin-bottom: 16px;
    }

    .article-hero h1 {
      position: relative;
      font-size: 1.9rem;
      font-weight: 900;
      margin: 0 0 16px;
      line-height: 1.5;
      letter-spacing: -0.02em;
    }

    .article-meta {
      position: relative;
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      font-size: 0.84rem;
      opacity: 0.94;
    }
    .meta-item { display: flex; align-items: center; gap: 5px; font-weight: 600; }

    /* ---- Body card ---- */
    .article-body-card {
      background: var(--theme-surface);
      border-radius: var(--radius-lg);
      padding: 40px 44px;
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
    }

    .article-body {
      line-height: 2.1;
      color: var(--theme-text);
      font-size: 1.02rem;
    }
    .article-body :where(h1, h2, h3) {
      color: var(--theme-text);
      margin: 28px 0 14px;
      font-weight: 800;
    }
    .article-body :where(h2) { font-size: 1.35rem; padding-right: 14px; border-right: 4px solid var(--theme-primary); }
    .article-body :where(h3) { font-size: 1.12rem; }
    .article-body :where(p) { margin-bottom: 14px; }
    .article-body :where(ul, ol) { padding-right: 22px; margin-bottom: 16px; }
    .article-body :where(li) { margin-bottom: 8px; }
    .article-body :where(blockquote) {
      border-right: 4px solid var(--theme-secondary);
      background: color-mix(in srgb, var(--theme-secondary) 7%, transparent);
      padding: 14px 18px;
      border-radius: 10px;
      margin: 18px 0;
      color: var(--theme-text-secondary);
    }
    .article-body :where(strong) { color: var(--theme-primary-dark); }
    .article-body :where(code) {
      background: var(--theme-background);
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.9em;
      direction: ltr;
      display: inline-block;
    }
    .article-body :where(pre) {
      background: #17123a;
      color: #e2e0f5;
      padding: 18px;
      border-radius: 12px;
      overflow-x: auto;
      direction: ltr;
      text-align: left;
    }

    .article-tags { margin-top: 28px; display: flex; gap: 8px; flex-wrap: wrap; }
    .tag {
      padding: 6px 14px;
      background: color-mix(in srgb, var(--theme-primary) 8%, transparent);
      color: var(--theme-primary);
      border-radius: 100px;
      font-size: 0.8rem;
      font-weight: 700;
      border: 1px solid color-mix(in srgb, var(--theme-primary) 20%, transparent);
      transition: all 0.2s ease;
    }
    .tag:hover { background: color-mix(in srgb, var(--theme-primary) 15%, transparent); }

    /* ---- Voting ---- */
    .vote-section { margin-top: 36px; }

    .vote-divider {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 22px;
      color: var(--theme-text-muted);
      font-size: 0.8rem;
      font-weight: 700;
    }
    .vote-divider::before, .vote-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--theme-border), transparent);
    }

    .vote-title { text-align: center; margin: 0 0 20px 0; color: var(--theme-text); font-size: 1.1rem; font-weight: 800; }

    .vote-container { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

    .vote-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 26px;
      border: 2px solid var(--theme-border);
      border-radius: 16px;
      background: var(--theme-surface);
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--theme-text-secondary);
      font-family: inherit;
      transition: all 0.3s var(--ease-spring);
      box-shadow: var(--shadow-sm);
    }
    .vote-btn:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: var(--shadow-md);
    }
    .vote-emoji { font-size: 1.3rem; }
    .vote-count {
      background: var(--theme-background);
      padding: 3px 12px;
      border-radius: 100px;
      font-size: 0.88rem;
      min-width: 34px;
      text-align: center;
    }

    .like-btn.active {
      background: linear-gradient(135deg, #ef4444, #f87171);
      border-color: transparent;
      color: white;
      box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35);
    }
    .like-btn.active .vote-count { background: rgba(255,255,255,0.25); color: white; }

    .dislike-btn.active {
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      border-color: transparent;
      color: white;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35);
    }
    .dislike-btn.active .vote-count { background: rgba(255,255,255,0.25); color: white; }

    .vote-message {
      margin-top: 16px;
      text-align: center;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--theme-success);
      padding: 10px 18px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--theme-success) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-success) 22%, transparent);
      animation: popIn 0.3s var(--ease-spring) both;
    }

    @media (max-width: 768px) {
      .article-hero { padding: 28px 22px; }
      .article-hero h1 { font-size: 1.45rem; }
      .article-body-card { padding: 26px 20px; }
    }
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
