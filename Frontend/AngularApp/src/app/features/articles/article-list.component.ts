import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../core/services/article.service';
import { ShamsiDate } from '../../core/utils/shamsi-date';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <h1>📚 مقالات</h1>

      <div class="filters">
        <input type="text" [(ngModel)]="searchTerm" (input)="search()" placeholder="جستجوی مقالات..." class="search-input">
        <select [(ngModel)]="selectedCategory" (change)="filterByCategory()" class="category-select">
          <option value="">همه دسته‌بندی‌ها</option>
          <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <div class="articles-grid">
        <a *ngFor="let article of articles" [routerLink]="['/articles', article.slug]" class="article-card">
          <div class="article-image" *ngIf="article.imageUrl" [style.background-image]="'url(' + article.imageUrl + ')'">
            <span class="category-badge">{{ article.category?.name }}</span>
          </div>
          <div class="article-content">
            <h3>{{ article.title }}</h3>
            <p class="summary">{{ article.summary }}</p>
            <div class="article-meta">
              <span class="author">{{ article.authorName }}</span>
              <span class="date">{{ formatDate(article.publishedDate) }}</span>
              <span class="read-time">{{ article.readingTimeMinutes }} دقیقه</span>
            </div>
          </div>
        </a>
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
    h1 { color: var(--theme-text); margin-bottom: 24px; font-size: 1.8rem; }
    .filters { display: flex; gap: 16px; margin-bottom: 24px; }
    .search-input { flex: 1; padding: 12px 16px; border: 1.5px solid var(--theme-border); border-radius: 8px; font-size: 1rem; background: var(--theme-surface); color: var(--theme-text); }
    .search-input:focus { outline: none; border-color: var(--theme-primary); }
    .category-select { padding: 12px 16px; border: 1.5px solid var(--theme-border); border-radius: 8px; font-size: 1rem; min-width: 200px; background: var(--theme-surface); color: var(--theme-text); }
    .articles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 24px; }
    .article-card { background: var(--theme-surface); border-radius: 12px; overflow: hidden; box-shadow: var(--theme-card-shadow); border: 1px solid var(--theme-border); text-decoration: none; transition: all 0.3s ease; display: block; }
    .article-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .article-image { height: 160px; background-size: cover; background-position: center; position: relative; background-color: var(--theme-background); }
    .category-badge { position: absolute; top: 12px; right: 12px; background: var(--theme-primary); color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .article-content { padding: 20px; }
    .article-content h3 { margin: 0 0 8px 0; color: var(--theme-text); font-size: 1.1rem; }
    .summary { color: var(--theme-text-secondary); font-size: 0.9rem; margin: 0 0 12px 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .article-meta { display: flex; gap: 12px; font-size: 0.8rem; color: var(--theme-text-muted); }
    .article-meta span { display: flex; align-items: center; gap: 4px; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; }
    .pagination button { padding: 10px 20px; background: var(--theme-primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; }
    .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
    .pagination button:hover:not(:disabled) { opacity: 0.9; }
    .pagination span { color: var(--theme-text-secondary); }
    @media (max-width: 1024px) { .articles-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 768px) { .articles-grid { grid-template-columns: 1fr; } .filters { flex-direction: column; } }
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

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.loadArticles();
    this.loadCategories();
  }

  loadArticles(): void {
    this.articleService.getArticles(this.currentPage, this.pageSize, this.searchTerm, this.selectedCategory ?? undefined).subscribe({
      next: (result) => {
        this.articles = result.items;
        this.totalPages = Math.ceil(result.totalCount / this.pageSize);
      }
    });
  }

  loadCategories(): void {
    this.articleService.getCategories().subscribe({
      next: (cats) => this.categories = cats
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
