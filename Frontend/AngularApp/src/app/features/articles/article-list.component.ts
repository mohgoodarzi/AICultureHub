import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../core/services/article.service';
import { AuthService } from '../../core/services/auth.service';
import { ShamsiDate } from '../../core/utils/shamsi-date';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-hero animate-fade-up">
        <span class="hero-chip">✦ دانش و بینش</span>
        <h1>📚 مقالات</h1>
        <p>آخرین بینش‌ها درباره هوش مصنوعی، یادگیری ماشین و تحول دیجیتال — نوشته‌شده برای همه سطوح سازمان.</p>
      </div>

      <div class="filters">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" [(ngModel)]="searchTerm" (input)="search()" placeholder="جستجوی مقالات..." class="search-input">
        </div>
        <select [(ngModel)]="selectedCategory" (change)="filterByCategory()" class="category-select">
          <option value="">همه دسته‌بندی‌ها</option>
          <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <div class="articles-grid">
        <div *ngFor="let article of articles" class="article-card-wrapper animate-pop">
          <a [routerLink]="['/articles', article.slug]" class="article-card">
            <div class="article-image" *ngIf="article.imageUrl">
              <img [src]="article.imageUrl" [alt]="article.title" loading="lazy">
              <div class="image-overlay"></div>
              <span class="category-badge">{{ article.category?.name }}</span>
            </div>
            <div class="article-content">
              <h3>{{ article.title }}</h3>
              <p class="summary">{{ article.summary }}</p>
              <div class="article-meta">
                <span class="author"><i>✍️</i> {{ article.authorName }}</span>
                <span class="date"><i>🗓</i> {{ formatDate(article.publishedDate) }}</span>
                <span class="read-time"><i>⏱</i> {{ article.readingTimeMinutes }} دقیقه</span>
              </div>
              <span class="read-more">ادامه مطلب ←</span>
            </div>
          </a>
          <div class="article-voting-mini">
            <button class="vote-mini like" [class.active]="userVotes[article.id] === true" (click)="vote($event, article.id, true)" title="پسندیدن">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <span>{{ article.likeCount || 0 }}</span>
            </button>
            <button class="vote-mini dislike" [class.active]="userVotes[article.id] === false" (click)="vote($event, article.id, false)" title="نپسندیدن">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" transform="rotate(180 12 12)"/></svg>
              <span>{{ article.dislikeCount || 0 }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">قبلی</button>
        <span>صفحه {{ currentPage }} از {{ totalPages }}</span>
        <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">بعدی</button>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; }

    .filters { display: flex; gap: 14px; margin-bottom: 26px; align-items: center; }

    .search-box {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      right: 14px;
      font-size: 0.95rem;
      opacity: 0.6;
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      padding: 12px 42px 12px 16px;
      border: 1.5px solid var(--theme-border);
      border-radius: 12px;
      font-size: 0.95rem;
      background: var(--theme-surface);
      color: var(--theme-text);
      transition: all 0.25s var(--ease-smooth);
      font-family: inherit;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--theme-primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 12%, transparent);
    }
    .category-select {
      padding: 12px 16px;
      border: 1.5px solid var(--theme-border);
      border-radius: 12px;
      font-size: 0.92rem;
      min-width: 210px;
      background: var(--theme-surface);
      color: var(--theme-text);
      font-family: inherit;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .category-select:focus {
      outline: none;
      border-color: var(--theme-primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 12%, transparent);
    }

    .articles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 24px; }

    .article-card-wrapper { display: flex; flex-direction: column; gap: 10px; }

    .article-card {
      background: var(--theme-surface);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
      text-decoration: none;
      transition: all 0.35s var(--ease-smooth);
      display: flex;
      flex-direction: column;
      flex: 1;
      position: relative;
    }
    .article-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-md);
      border-color: color-mix(in srgb, var(--theme-primary) 30%, var(--theme-border));
    }

    .article-image {
      height: 170px;
      position: relative;
      background-color: var(--theme-surface-hover);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .article-image img {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      display: block;
      transition: transform 0.3s ease;
    }
    .article-card:hover .article-image img { transform: scale(1.04); }
    .image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgba(15, 10, 40, 0.55));
      opacity: 0.85;
      transition: opacity 0.3s ease;
    }
    .article-card:hover .image-overlay { opacity: 1; }

    .category-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      color: var(--theme-primary-dark);
      padding: 5px 13px;
      border-radius: 100px;
      font-size: 0.73rem;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(0,0,0,0.18);
    }

    .article-content { padding: 20px 22px 22px; display: flex; flex-direction: column; flex: 1; }
    .article-content h3 {
      margin: 0 0 10px 0;
      color: var(--theme-text);
      font-size: 1.08rem;
      font-weight: 800;
      line-height: 1.6;
    }
    .summary {
      color: var(--theme-text-secondary);
      font-size: 0.88rem;
      margin: 0 0 14px 0;
      line-height: 1.8;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .article-meta {
      display: flex;
      gap: 14px;
      font-size: 0.76rem;
      color: var(--theme-text-muted);
      flex-wrap: wrap;
    }
    .article-meta span { display: flex; align-items: center; gap: 4px; font-weight: 600; }
    .article-meta i { font-style: normal; font-size: 0.85rem; }

    .read-more {
      margin-top: 14px;
      color: var(--theme-primary);
      font-weight: 800;
      font-size: 0.84rem;
      opacity: 0;
      transform: translateY(4px);
      transition: all 0.3s ease;
    }
    .article-card:hover .read-more { opacity: 1; transform: translateY(0); }

    .article-voting-mini { display: flex; gap: 8px; justify-content: flex-start; padding: 0 4px; }
    .vote-mini {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border: 1.5px solid var(--theme-border);
      border-radius: 100px;
      background: var(--theme-surface);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--theme-text-muted);
      transition: all 0.25s var(--ease-spring);
      font-family: inherit;
    }
    .vote-mini:hover { transform: scale(1.08) translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .vote-mini.like:hover, .vote-mini.like.active { background: #fef2f2; border-color: #ef4444; color: #ef4444; }
    .vote-mini.dislike:hover, .vote-mini.dislike.active { background: #fef9e7; border-color: #f59e0b; color: #f59e0b; }
    .vote-mini svg { width: 15px; height: 15px; }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 28px; }
    .pagination button {
      padding: 10px 22px;
      background: var(--gradient-brand);
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      font-family: inherit;
      transition: all 0.25s ease;
      box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-primary) 25%, transparent);
    }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
    .pagination button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px color-mix(in srgb, var(--theme-primary) 32%, transparent); }
    .pagination span { color: var(--theme-text-secondary); font-weight: 600; font-size: 0.9rem; }

    @media (max-width: 1024px) { .articles-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .articles-grid { grid-template-columns: 1fr; } .filters { flex-direction: column; align-items: stretch; } }
  `]
})
export class ArticleListComponent implements OnInit {
  articles: any[] = [];
  categories: any[] = [];
  searchTerm = '';
  selectedCategory: number | null = null;
  currentPage = 1;
  pageSize = 9;
  totalPages = 1;
  userVotes: { [articleId: number]: boolean | null } = {};

  constructor(private articleService: ArticleService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadArticles();
    this.loadCategories();
  }

  loadArticles(): void {
    this.articleService.getArticles(this.currentPage, this.pageSize, this.searchTerm, this.selectedCategory ?? undefined).subscribe({
      next: (result) => {
        this.articles = result.items;
        this.totalPages = Math.ceil(result.totalCount / this.pageSize);
        this.loadVoteStatuses();
      }
    });
  }

  loadCategories(): void {
    this.articleService.getCategories().subscribe({
      next: (cats) => this.categories = cats
    });
  }

  loadVoteStatuses(): void {
    if (!this.authService.isLoggedIn()) return;
    this.articles.forEach(article => {
      this.articleService.getVoteStatus(article.id).subscribe({
        next: (result) => {
          this.userVotes[article.id] = result.userVote;
        }
      });
    });
  }

  vote(event: Event, articleId: number, isLike: boolean): void {
    event.preventDefault();
    event.stopPropagation();

    this.articleService.vote(articleId, isLike).subscribe({
      next: (result) => {
        this.userVotes[articleId] = result.userVote;
        const article = this.articles.find(a => a.id === articleId);
        if (article) {
          article.likeCount = result.likeCount;
          article.dislikeCount = result.dislikeCount;
        }
      },
      error: (err) => {
        console.error('Vote error:', err);
        if (err.status === 401) {
          alert('لطفاً وارد شوید (Please login)');
        } else {
          alert('خطا: وضعیت ' + err.status);
        }
      }
    });
  }

  search(): void {
    this.currentPage = 1;
    this.loadArticles();
  }

  filterByCategory(): void {
    this.currentPage = 1;
    this.loadArticles();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadArticles();
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return ShamsiDate.format(date, 'short');
  }
}
