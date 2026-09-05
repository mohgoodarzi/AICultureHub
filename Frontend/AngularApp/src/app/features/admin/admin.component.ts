import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Pipe({ name: 'compactJoin', standalone: true })
export class CompactJoinPipe implements PipeTransform {
  transform(values: (string | null | undefined)[] | null | undefined): string {
    if (!values) return '-';
    const joined = values.filter(v => !!v && String(v).trim() !== '').join(' / ');
    return joined || '-';
  }
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, CompactJoinPipe],
  template: `
    <div class="admin-page">
      <!-- Admin Hero Header -->
      <div class="admin-hero animate-fade-up">
        <div class="admin-hero-grid"></div>
        <div class="admin-hero-content">
          <span class="hero-chip">🛡 مرکز کنترل سازمانی</span>
          <h1>پنل مدیریت</h1>
          <p>مدیریت کاربران، محتوا، دوره‌ها و دسترسی‌های پلتفرم هوش مصنوعی</p>
        </div>
        <div class="admin-hero-stats" *ngIf="analytics">
          <div class="mini-stat"><span class="mini-value">{{ analytics.totalUsers }}</span><span class="mini-label">کاربر</span></div>
          <div class="mini-stat"><span class="mini-value">{{ analytics.totalArticles }}</span><span class="mini-label">مقاله</span></div>
          <div class="mini-stat"><span class="mini-value">{{ analytics.totalCourses }}</span><span class="mini-label">دوره</span></div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="admin-tabs animate-fade-up delay-1">
        <button [class.active]="activeTab === 'analytics'" (click)="activeTab = 'analytics'"><span class="tab-ico">📊</span>آمار</button>
        <button [class.active]="activeTab === 'articles'" (click)="activeTab = 'articles'; loadArticles()"><span class="tab-ico">📝</span>مقالات</button>
        <button [class.active]="activeTab === 'feedback'" (click)="activeTab = 'feedback'; loadFeedbackStats()"><span class="tab-ico">💬</span>بازخورد مقالات</button>
        <button [class.active]="activeTab === 'coursefeedback'" (click)="activeTab = 'coursefeedback'; loadCourseFeedbackStats()"><span class="tab-ico">🎓</span>بازخورد دوره‌ها</button>
        <button [class.active]="activeTab === 'categories'" (click)="activeTab = 'categories'; loadAllCategories()"><span class="tab-ico">🗂</span>دسته‌بندی‌ها</button>
        <button [class.active]="activeTab === 'courses'" (click)="activeTab = 'courses'; loadCourses()"><span class="tab-ico">🎓</span>دوره‌ها</button>
        <button [class.active]="activeTab === 'quizzes'" (click)="activeTab = 'quizzes'; loadAdminQuizzes()"><span class="tab-ico">🧪</span>آزمون‌ها</button>
        <button [class.active]="activeTab === 'users'" (click)="activeTab = 'users'"><span class="tab-ico">👥</span>کاربران</button>
        <button [class.active]="activeTab === 'org'" (click)="activeTab = 'org'; loadOrgData()"><span class="tab-ico">🏢</span>واحدها و سمت‌ها</button>
        <button [class.active]="activeTab === 'roles'" (click)="activeTab = 'roles'; loadRoles()"><span class="tab-ico">🔑</span>نقش‌ها</button>
        <button [class.active]="activeTab === 'announcements'" (click)="activeTab = 'announcements'"><span class="tab-ico">📣</span>اطلاعیه‌ها</button>
        <button [class.active]="activeTab === 'aipolicy'" (click)="activeTab = 'aipolicy'; loadAiPolicy()"><span class="tab-ico">📜</span>خط‌مشی AI</button>
        <button [class.active]="activeTab === 'settings'" (click)="activeTab = 'settings'; loadUploadLimits()"><span class="tab-ico">⚙️</span>تنظیمات</button>
      </div>

      <!-- Analytics Section -->
      <div class="analytics-section" *ngIf="activeTab === 'analytics' && analytics">
        <div class="stats-grid">
          <div class="stat-card animate-pop delay-1"><div class="stat-ico si-1">👥</div><div class="stat-body"><div class="stat-value">{{ analytics.totalUsers }}</div><div class="stat-label">کاربران</div></div></div>
          <div class="stat-card animate-pop delay-2"><div class="stat-ico si-2">⚡</div><div class="stat-body"><div class="stat-value">{{ analytics.activeUsers }}</div><div class="stat-label">کاربران فعال</div></div></div>
          <div class="stat-card animate-pop delay-3"><div class="stat-ico si-7">🚫</div><div class="stat-body"><div class="stat-value">{{ analytics.inactiveUsers }}</div><div class="stat-label">کاربران غیرفعال</div></div></div>
          <div class="stat-card animate-pop delay-3"><div class="stat-ico si-3">📝</div><div class="stat-body"><div class="stat-value">{{ analytics.totalArticles }}</div><div class="stat-label">مقالات</div></div></div>
          <div class="stat-card animate-pop delay-4"><div class="stat-ico si-4">🎓</div><div class="stat-body"><div class="stat-value">{{ analytics.totalCourses }}</div><div class="stat-label">دوره‌ها</div></div></div>
          <div class="stat-card animate-pop delay-2"><div class="stat-ico si-5">🧪</div><div class="stat-body"><div class="stat-value">{{ analytics.quizAttempts }}</div><div class="stat-label">آزمون‌ها</div></div></div>
          <div class="stat-card animate-pop delay-3"><div class="stat-ico si-6">🎯</div><div class="stat-body"><div class="stat-value">{{ analytics.averageQuizScore | number:'1.0-0' }}٪</div><div class="stat-label">میانگین نمره</div></div></div>
        </div>
      </div>

      <!-- Feedback Statistics Section -->
      <div class="crud-section" *ngIf="activeTab === 'feedback'">
        <div class="crud-header">
          <h3>📊 آمار بازخورد مقالات</h3>
        </div>

        <div class="stats-grid" style="margin-bottom: 20px;">
          <div class="stat-card"><div class="stat-ico si-like">👍</div><div class="stat-body"><div class="stat-value">{{ totalLikes }}</div><div class="stat-label">مجموع لایک‌ها</div></div></div>
          <div class="stat-card"><div class="stat-ico si-dislike">👎</div><div class="stat-body"><div class="stat-value">{{ totalDislikes }}</div><div class="stat-label">مجموع دیسلایک‌ها</div></div></div>
          <div class="stat-card"><div class="stat-ico si-total">🗳</div><div class="stat-body"><div class="stat-value">{{ totalVotes }}</div><div class="stat-label">مجموع آرا</div></div></div>
          <div class="stat-card"><div class="stat-ico si-satisfaction">📈</div><div class="stat-body"><div class="stat-value" [style.color]="overallSatisfaction >= 70 ? 'var(--theme-success)' : overallSatisfaction >= 40 ? 'var(--theme-warning)' : 'var(--theme-error)'">{{ overallSatisfaction }}٪</div><div class="stat-label">رضایت کلی</div></div></div>
        </div>

        <table class="crud-table">
          <thead>
            <tr>
              <th>مقاله</th>
              <th>دسته‌بندی</th>
              <th>لایک</th>
              <th>دیسلایک</th>
              <th>مجموع</th>
              <th>رضایت</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of feedbackStats">
              <td>{{ item.articleTitle }}</td>
              <td>{{ item.categoryName }}</td>
              <td><span style="color: #ef4444;">{{ item.likeCount }}</span></td>
              <td><span style="color: #f59e0b;">{{ item.dislikeCount }}</span></td>
              <td>{{ item.totalVotes }}</td>
              <td>
                <div class="satisfaction-cell">
                  <div class="satisfaction-bar-mini">
                    <div class="satisfaction-fill-mini" [style.width.%]="item.satisfactionPercentage"></div>
                  </div>
                  <span [style.color]="item.satisfactionPercentage >= 70 ? 'var(--theme-success)' : item.satisfactionPercentage >= 40 ? 'var(--theme-warning)' : 'var(--theme-error)'">
                    {{ item.satisfactionPercentage }}%
                  </span>
                </div>
              </td>
            </tr>
            <tr *ngIf="feedbackStats.length === 0">
              <td colspan="6" style="text-align: center; color: var(--theme-text-muted);">داده‌ای وجود ندارد</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Course Feedback Statistics Section -->
      <div class="crud-section" *ngIf="activeTab === 'coursefeedback'">
        <div class="crud-header">
          <h3>🎓 آمار بازخورد دوره‌ها</h3>
          <button class="btn-primary" (click)="loadCourseFeedbackStats()">🔄 بروزرسانی</button>
        </div>

        <div class="stats-grid" style="margin-bottom: 20px;">
          <div class="stat-card">
            <div class="stat-value">{{ courseTotalLikes }}</div>
            <div class="stat-label">مجموع لایک‌ها</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ courseTotalDislikes }}</div>
            <div class="stat-label">مجموع دیسلایک‌ها</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ courseTotalVotes }}</div>
            <div class="stat-label">مجموع آرا</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" [style.color]="courseOverallSatisfaction >= 70 ? 'var(--theme-success)' : courseOverallSatisfaction >= 40 ? 'var(--theme-warning)' : 'var(--theme-error)'">
              {{ courseOverallSatisfaction }}%
            </div>
            <div class="stat-label">رضایت کلی</div>
          </div>
        </div>

        <table class="crud-table">
          <thead>
            <tr>
              <th>دوره</th>
              <th>دسته‌بندی</th>
              <th>لایک</th>
              <th>دیسلایک</th>
              <th>مجموع</th>
              <th>رضایت</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of courseFeedbackStats">
              <td>{{ item.courseTitle }}</td>
              <td>{{ item.categoryName || '-' }}</td>
              <td><span style="color: #ef4444;">{{ item.likeCount }}</span></td>
              <td><span style="color: #f59e0b;">{{ item.dislikeCount }}</span></td>
              <td>{{ item.totalVotes }}</td>
              <td>
                <div class="satisfaction-cell">
                  <div class="satisfaction-bar-mini">
                    <div class="satisfaction-fill-mini" [style.width.%]="item.satisfactionPercentage"></div>
                  </div>
                  <span [style.color]="item.satisfactionPercentage >= 70 ? 'var(--theme-success)' : item.satisfactionPercentage >= 40 ? 'var(--theme-warning)' : 'var(--theme-error)'">
                    {{ item.satisfactionPercentage }}%
                  </span>
                </div>
              </td>
            </tr>
            <tr *ngIf="courseFeedbackStats.length === 0">
              <td colspan="6" style="text-align: center; color: var(--theme-text-muted);">داده‌ای وجود ندارد</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Categories Section -->
      <div class="crud-section" *ngIf="activeTab === 'categories'">
        <div class="crud-header">
          <h3>مدیریت دسته‌بندی‌ها</h3>
          <button class="btn-primary" (click)="openCategoryModal()">+ دسته‌بندی جدید</button>
        </div>

        <table class="crud-table">
          <thead>
            <tr>
              <th>نام</th>
              <th>توضیحات</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let cat of allCategories">
              <td>{{ cat.name }}</td>
              <td>{{ cat.description || '-' }}</td>
              <td>
                <span class="status-badge" [class.published]="cat.isActive">
                  {{ cat.isActive ? 'فعال' : 'غیرفعال' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-edit" (click)="editCategory(cat)">ویرایش</button>
                <button class="btn-toggle" (click)="toggleCategory(cat)">
                  {{ cat.isActive ? 'غیرفعال کردن' : 'فعال کردن' }}
                </button>
                <button class="btn-delete" (click)="deleteCategory(cat.id)">حذف</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Articles Section -->
      <div class="crud-section" *ngIf="activeTab === 'articles'">
        <div class="crud-header">
          <h3>مدیریت مقالات</h3>
          <button class="btn-primary" (click)="openArticleModal()">+ مقاله جدید</button>
        </div>

        <table class="crud-table">
          <thead>
            <tr>
              <th>عنوان</th>
              <th>دسته‌بندی</th>
              <th>نویسنده</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let article of articles">
              <td>{{ article.title }}</td>
              <td>{{ article.category?.name || '-' }}</td>
              <td>{{ article.authorName }}</td>
              <td>
                <span class="status-badge" [class.published]="article.isPublished">
                  {{ article.isPublished ? 'منتشر شده' : 'پیش‌نویس' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-edit" (click)="editArticle(article)">ویرایش</button>
                <button class="btn-delete" (click)="deleteArticle(article.id)">حذف</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Courses Section -->
      <div class="crud-section" *ngIf="activeTab === 'courses'">
        <div class="crud-header">
          <h3>مدیریت دوره‌ها</h3>
          <button class="btn-primary" (click)="openCourseModal()">+ دوره جدید</button>
        </div>

        <table class="crud-table">
          <thead>
            <tr>
              <th>عنوان</th>
              <th>سطح</th>
              <th>درس‌ها</th>
              <th>شرکت‌کنندگان</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let course of courses">
              <td>{{ course.title }}</td>
              <td>{{ course.difficulty }}</td>
              <td>{{ course.lessonCount || 0 }}</td>
              <td>{{ course.enrolledCount }}</td>
              <td>
                <span class="status-badge" [class.published]="course.isPublished">
                  {{ course.isPublished ? 'منتشر شده' : 'پیش‌نویس' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-edit" (click)="editCourse(course)">ویرایش</button>
                <button class="btn-delete" (click)="deleteCourse(course.id)">حذف</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quizzes Management Section -->
      <div class="crud-section" *ngIf="activeTab === 'quizzes'">
        <div class="crud-header">
          <h3>🧪 مدیریت آزمون‌ها</h3>
          <button class="btn-primary" (click)="openQuizModal()">+ آزمون جدید</button>
        </div>

        <table class="crud-table">
          <thead>
            <tr>
              <th>عنوان</th>
              <th>دسته‌بندی</th>
              <th>سطح</th>
              <th>تعداد سوالات</th>
              <th>زمان</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let quiz of adminQuizzes">
              <td>{{ quiz.title }}</td>
              <td>{{ quiz.categoryName || '-' }}</td>
              <td>{{ quiz.difficulty }}</td>
              <td>{{ quiz.questionCount }}</td>
              <td>{{ quiz.timeLimit }} دقیقه</td>
              <td>
                <span class="status-badge" [class.published]="quiz.isPublished">
                  {{ quiz.isPublished ? 'منتشر شده' : 'پیش‌نویس' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-edit" (click)="editQuiz(quiz)">ویرایش</button>
                <button class="btn-delete" (click)="deleteQuiz(quiz.id)">حذف</button>
              </td>
            </tr>
            <tr *ngIf="adminQuizzes.length === 0">
              <td colspan="7" style="text-align:center;color:var(--theme-text-muted)">آزمونی وجود ندارد</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quiz Editor Modal -->
      <div class="modal" *ngIf="showQuizModal">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h3>{{ editingQuiz ? 'ویرایش آزمون' : 'آزمون جدید' }}</h3>
            <button class="btn-close" (click)="closeQuizModal()">×</button>
          </div>
          <form (ngSubmit)="saveQuiz()">
            <div class="form-row">
              <div class="form-group">
                <label>عنوان آزمون <span class="required">*</span></label>
                <input type="text" [(ngModel)]="quizForm.title" name="qtitle" required>
              </div>
              <div class="form-group">
                <label>دسته‌بندی</label>
                <select [(ngModel)]="quizForm.categoryId" name="qcat">
                  <option [ngValue]="null">بدون دسته‌بندی</option>
                  <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>توضیحات</label>
              <textarea [(ngModel)]="quizForm.description" name="qdesc" rows="2"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>سطح دشواری</label>
                <select [(ngModel)]="quizForm.difficulty" name="qdiff">
                  <option value="Beginner">مقدماتی</option>
                  <option value="Intermediate">متوسط</option>
                  <option value="Advanced">پیشرفته</option>
                </select>
              </div>
              <div class="form-group">
                <label>زمان (دقیقه)</label>
                <input type="number" [(ngModel)]="quizForm.timeLimit" name="qtime" min="1">
              </div>
              <div class="form-group">
                <label>نمره قبولی (%)</label>
                <input type="number" [(ngModel)]="quizForm.passingScore" name="qpass" min="1" max="100">
              </div>
              <div class="form-group">
                <label>امتیاز کل</label>
                <input type="number" [(ngModel)]="quizForm.points" name="qpoints" min="1">
              </div>
            </div>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="quizForm.isPublished" name="qpub">
                منتشر شده (قابل مشاهده برای کاربران)
              </label>
            </div>

            <div class="quiz-questions-editor">
              <div class="qq-header">
                <h4>سوالات ({{ quizForm.questions.length }})</h4>
                <button type="button" class="btn-primary" (click)="addQuizQuestion()">+ سوال جدید</button>
              </div>

              <div class="qq-card" *ngFor="let q of quizForm.questions; let qi = index">
                <div class="qq-head">
                  <strong>سوال {{ qi + 1 }}</strong>
                  <button type="button" class="btn-delete" (click)="removeQuizQuestion(qi)">حذف سوال</button>
                </div>
                <div class="form-group">
                  <label>متن سوال <span class="required">*</span></label>
                  <textarea [(ngModel)]="q.questionText" name="qtext{{qi}}" rows="2" required></textarea>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>امتیاز سوال</label>
                    <input type="number" [(ngModel)]="q.points" name="qpts{{qi}}" min="1">
                  </div>
                  <div class="form-group" style="flex:2;">
                    <label>توضیح پاسخ (اختیاری — بعد از آزمون نمایش داده می‌شود)</label>
                    <input type="text" [(ngModel)]="q.explanation" name="qexp{{qi}}">
                  </div>
                </div>
                <div class="qq-answers">
                  <label class="qq-answers-label">گزینه‌ها (گزینه صحیح را انتخاب کنید):</label>
                  <div class="qq-answer" *ngFor="let a of q.answers; let ai = index">
                    <label class="radio-label">
                      <input type="radio" [name]="'correct' + qi" [value]="ai" [(ngModel)]="q.correctIndex">
                      <span class="radio-mark"></span>
                    </label>
                    <input type="text" [(ngModel)]="a.answerText" name="ans{{qi}}_{{ai}}" placeholder="متن گزینه {{ ai + 1 }}">
                    <button type="button" class="btn-delete" (click)="removeQuizAnswer(q, ai)" [disabled]="q.answers.length <= 2">×</button>
                  </div>
                  <button type="button" class="btn-edit" (click)="addQuizAnswer(q)" [disabled]="q.answers.length >= 6">+ گزینه</button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" (click)="closeQuizModal()">انصراف</button>
              <button type="submit" class="btn-primary">ذخیره آزمون</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Users Section -->
      <div class="crud-section" *ngIf="activeTab === 'users'">
        <div class="crud-header">
          <h3>مدیریت کاربران</h3>
          <div style="display:flex; gap:12px; align-items:center;">
            <input type="text" [(ngModel)]="userSearch" (ngModelChange)="onUserSearch()" placeholder="جستجو: نام، ایمیل، شماره پرسنلی..." class="user-search-input">
            <button class="btn-primary" (click)="openUserModal()">+ کاربر جدید</button>
          </div>
        </div>
        <table class="crud-table">
          <thead>
            <tr>
              <th>نام</th>
              <th>شماره پرسنلی</th>
              <th>ایمیل</th>
              <th>واحد / سمت</th>
              <th>امتیاز</th>
              <th>نقش</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>
                <div class="user-cell">
                  <div class="user-avatar-sm">
                    <img *ngIf="user.avatarUrl" [src]="user.avatarUrl" [alt]="user.fullName">
                    <span *ngIf="!user.avatarUrl">{{ (user.firstName || '؟')?.charAt(0) }}</span>
                  </div>
                  <span>{{ user.firstName }} {{ user.lastName }}</span>
                </div>
              </td>
              <td>{{ user.employeeId || '-' }}</td>
              <td>{{ user.email }}</td>
              <td>{{ [user.departmentName, user.positionName] | compactJoin }}</td>
              <td>{{ user.totalPoints }}</td>
              <td>{{ user.roles?.join(', ') }}</td>
              <td>
                <span class="status-badge" [class.published]="user.isActive">
                  {{ user.isActive ? 'فعال' : 'غیرفعال' }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-edit" (click)="openUserRolesModal(user)">نقش‌ها</button>
                <button class="btn-edit" (click)="editUser(user)">ویرایش</button>
                <button class="btn-toggle" [class.deactivated]="user.isActive" (click)="toggleUserActive(user)">
                  {{ user.isActive ? 'غیرفعال کردن' : 'فعال کردن' }}
                </button>
                <button class="btn-delete" (click)="deleteUser(user)">حذف</button>
              </td>
            </tr>
            <tr *ngIf="users.length === 0">
              <td colspan="8" style="text-align:center;color:var(--theme-text-muted)">کاربری یافت نشد</td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" *ngIf="userTotalPages > 1">
          <button (click)="goToUserPage(userPage - 1)" [disabled]="userPage === 1">قبلی</button>
          <button *ngFor="let p of userPageNumbers" [class.active]="p === userPage" (click)="goToUserPage(p)">{{ p }}</button>
          <span>صفحه {{ userPage }} از {{ userTotalPages }}</span>
          <button (click)="goToUserPage(userPage + 1)" [disabled]="userPage === userTotalPages">بعدی</button>
        </div>
      </div>

      <!-- Organization Master Data Section (Units + Positions) -->
      <div class="crud-section" *ngIf="activeTab === 'org'">
        <div class="org-grid">
          <!-- Units (Departments) -->
          <div class="org-pane">
            <div class="crud-header">
              <h3>🏢 واحدهای سازمانی</h3>
              <button class="btn-primary" (click)="openOrgModal('unit')">+ واحد جدید</button>
            </div>
            <table class="crud-table">
              <thead>
                <tr><th>نام</th><th>کد</th><th>وضعیت</th><th>عملیات</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let unit of departments">
                  <td>{{ unit.name }}</td>
                  <td>{{ unit.code || '-' }}</td>
                  <td>
                    <span class="status-badge" [class.published]="unit.isActive">
                      {{ unit.isActive ? 'فعال' : 'غیرفعال' }}
                    </span>
                  </td>
                  <td class="actions">
                    <button class="btn-edit" (click)="openOrgModal('unit', unit)">ویرایش</button>
                    <button class="btn-delete" (click)="deleteUnit(unit.id)">حذف</button>
                  </td>
                </tr>
                <tr *ngIf="departments.length === 0"><td colspan="4" style="text-align:center;color:var(--theme-text-muted)">داده‌ای وجود ندارد</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Positions -->
          <div class="org-pane">
            <div class="crud-header">
              <h3>💼 سمت‌های سازمانی</h3>
              <button class="btn-primary" (click)="openOrgModal('position')">+ سمت جدید</button>
            </div>
            <table class="crud-table">
              <thead>
                <tr><th>نام</th><th>واحد</th><th>وضعیت</th><th>عملیات</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let pos of positions">
                  <td>{{ pos.name }}</td>
                  <td>{{ pos.departmentName || '-' }}</td>
                  <td>
                    <span class="status-badge" [class.published]="pos.isActive">
                      {{ pos.isActive ? 'فعال' : 'غیرفعال' }}
                    </span>
                  </td>
                  <td class="actions">
                    <button class="btn-edit" (click)="openOrgModal('position', pos)">ویرایش</button>
                    <button class="btn-delete" (click)="deletePosition(pos.id)">حذف</button>
                  </td>
                </tr>
                <tr *ngIf="positions.length === 0"><td colspan="4" style="text-align:center;color:var(--theme-text-muted)">داده‌ای وجود ندارد</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Org Master Data Modal -->
      <div class="modal" *ngIf="showOrgModal" (click)="closeOrgModal()">
        <div class="modal-content" style="max-width: 480px;" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingOrgKind === 'unit' ? (editingOrgId ? 'ویرایش واحد سازمانی' : 'واحد سازمانی جدید') : (editingOrgId ? 'ویرایش سمت' : 'سمت جدید') }}</h3>
            <button class="btn-close" (click)="closeOrgModal()">✕</button>
          </div>
          <div class="form-group">
            <label>نام</label>
            <input type="text" [(ngModel)]="orgForm.name" name="orgName" placeholder="نام...">
          </div>
          <div class="form-group" *ngIf="editingOrgKind === 'unit'">
            <label>کد</label>
            <input type="text" [(ngModel)]="orgForm.code" name="orgCode" placeholder="کد واحد (اختیاری)">
          </div>
          <div class="form-group" *ngIf="editingOrgKind === 'position'">
            <label>واحد سازمانی</label>
            <select [(ngModel)]="orgForm.departmentId" name="orgDeptId">
              <option [ngValue]="null">بدون واحد</option>
              <option *ngFor="let unit of departments" [ngValue]="unit.id">{{ unit.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>توضیحات</label>
            <input type="text" [(ngModel)]="orgForm.description" name="orgDesc" placeholder="توضیحات (اختیاری)">
          </div>
          <div class="modal-actions">
            <button class="btn-primary" (click)="saveOrg()" [disabled]="!orgForm.name">ذخیره</button>
            <button class="btn-cancel" (click)="closeOrgModal()">انصراف</button>
          </div>
        </div>
      </div>

      <!-- Announcements Section -->
      <div class="crud-section" *ngIf="activeTab === 'announcements'">
        <div class="crud-header">
          <h3>مدیریت اطلاعیه‌ها</h3>
          <button class="btn-primary" (click)="openAnnouncementModal()">+ اطلاعیه جدید</button>
        </div>
        <table class="crud-table">
          <thead>
            <tr>
              <th>عنوان</th>
              <th>محتوا</th>
              <th>اولویت</th>
              <th>تاریخ</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ann of announcements">
              <td>{{ ann.title }}</td>
              <td>{{ ann.content | slice:0:50 }}...</td>
              <td>
                <span class="priority-badge" [attr.data-priority]="ann.priority">
                  {{ ann.priority }}
                </span>
              </td>
              <td>{{ formatDate(ann.createdDate) }}</td>
              <td class="actions">
                <button class="btn-delete" (click)="deleteAnnouncement(ann.id)">حذف</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Upload Settings Section -->
      <div class="crud-section" *ngIf="activeTab === 'settings'">
        <div class="crud-header">
          <h3>⚙️ تنظیمات سامانه</h3>
        </div>
        <div class="org-grid">
          <div class="org-pane" style="max-width: 480px;">
            <h3 style="margin:0 0 6px 0; font-size:1rem; font-weight:800; color:var(--theme-text);">📁 حداکثر حجم آپلود رسانه</h3>
            <p class="policy-hint">این مقادیر توسط مدیر قابل تغییر است و بلافاصله برای همه کاربران اعمال می‌شود (بدون نیاز به تغییر کد).</p>
            <div class="form-group">
              <label>حداکثر حجم تصویر (مگابایت)</label>
              <input type="number" min="1" max="200" [(ngModel)]="uploadLimits.maxImageSizeMB" name="maxImageSizeMB">
            </div>
            <div class="form-group">
              <label>حداکثر حجم ویدیو (مگابایت)</label>
              <input type="number" min="1" max="200" [(ngModel)]="uploadLimits.maxVideoSizeMB" name="maxVideoSizeMB">
            </div>
            <div class="modal-actions">
              <button class="btn-primary" (click)="saveUploadLimits()" [disabled]="uploadSettingsSaving">
                {{ uploadSettingsSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Policy Section -->
      <div class="crud-section" *ngIf="activeTab === 'aipolicy'">
        <div class="crud-header">
          <h3>📜 مدیریت خط‌مشی هوش مصنوعی</h3>
          <div style="display:flex; gap:10px;">
            <button class="btn-edit" (click)="addPolicyItem()">+ مورد جدید</button>
            <button class="btn-primary" (click)="saveAiPolicy()" [disabled]="savingPolicy">{{ savingPolicy ? 'در حال ذخیره...' : 'ذخیره خط‌مشی' }}</button>
          </div>
        </div>
        <p class="policy-hint">محتوای این بخش در صفحه «خط‌مشی هوش مصنوعی» سایت نمایش داده می‌شود. ترتیب را با دکمه‌های بالا/پایین تغییر دهید.</p>
        <table class="crud-table">
          <thead>
            <tr><th style="width:60px;">ترتیب</th><th>عنوان</th><th>متن</th><th style="width:150px;">عملیات</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of policyItems; let i = index">
              <td>
                <div class="policy-order">
                  <button class="btn-edit" (click)="movePolicyItem(i, -1)" [disabled]="i === 0">▲</button>
                  <span>{{ i + 1 }}</span>
                  <button class="btn-edit" (click)="movePolicyItem(i, 1)" [disabled]="i === policyItems.length - 1">▼</button>
                </div>
              </td>
              <td><input type="text" class="policy-input policy-title-input" [(ngModel)]="item.title" placeholder="عنوان"></td>
              <td><textarea class="policy-input" [(ngModel)]="item.text" rows="2" placeholder="متن مورد..."></textarea></td>
              <td class="actions">
                <button class="btn-delete" (click)="removePolicyItem(i)">حذف</button>
              </td>
            </tr>
            <tr *ngIf="policyItems.length === 0">
              <td colspan="4" style="text-align:center;color:var(--theme-text-muted)">موردی وجود ندارد — با «+ مورد جدید» شروع کنید</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Roles Section -->
      <div class="crud-section" *ngIf="activeTab === 'roles'">
        <div class="crud-header">
          <h3>مدیریت نقش‌ها</h3>
          <button class="btn-primary" (click)="openRoleModal()">+ نقش جدید</button>
        </div>
        <table class="crud-table">
          <thead>
            <tr>
              <th>نام</th>
              <th>توضیحات</th>
              <th>تعداد کاربران</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let role of roles">
              <td>{{ role.name }}</td>
              <td>{{ role.description }}</td>
              <td>{{ role.userCount }}</td>
              <td class="actions">
                <button class="btn-edit" (click)="openRolePermissionsModal(role)">دسترسی‌ها</button>
                <button class="btn-delete" (click)="deleteRole(role.id)">حذف</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Article Modal -->
    <div class="modal" *ngIf="showArticleModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingArticle ? 'ویرایش مقاله' : 'مقاله جدید' }}</h3>
          <button class="btn-close" (click)="closeArticleModal()">×</button>
        </div>
        <form (ngSubmit)="saveArticle()">
          <div class="form-group">
            <label>عنوان</label>
            <input type="text" [(ngModel)]="articleForm.title" name="title" required>
          </div>
          <div class="form-group">
            <label>توضیح کوتاه</label>
            <textarea [(ngModel)]="articleForm.summary" name="summary" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>محتوا</label>
            <textarea [(ngModel)]="articleForm.content" name="content" rows="6"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>دسته‌بندی</label>
              <select [(ngModel)]="articleForm.categoryId" name="categoryId">
                <option value="">انتخاب کنید</option>
                <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>سطح دشواری</label>
              <select [(ngModel)]="articleForm.difficulty" name="difficulty">
                <option value="Beginner">مبتدی</option>
                <option value="Intermediate">متوسط</option>
                <option value="Advanced">پیشرفته</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>زمان مطالعه (دقیقه)</label>
              <input type="number" [(ngModel)]="articleForm.readingTimeMinutes" name="readingTimeMinutes">
            </div>
            <div class="form-group">
              <label>منتشر شده</label>
              <input type="checkbox" [(ngModel)]="articleForm.isPublished" name="isPublished">
            </div>
          </div>
          <div class="form-group">
            <label>تصویر مقاله</label>
            <input type="file" (change)="onImageSelected($event, 'article')" accept="image/*" class="file-input">
            <div class="image-preview" *ngIf="articleForm.imageUrl">
              <img [src]="articleForm.imageUrl" alt="Preview">
              <button type="button" class="btn-remove" (click)="articleForm.imageUrl = ''">حذف</button>
            </div>
            <div class="upload-progress" *ngIf="uploading">
              <span>در حال آپلود...</span>
            </div>
          </div>
          <div class="form-group">
            <label>ویدیو (اختیاری) — حداکثر {{ uploadLimits.maxVideoSizeMB }} مگابایت</label>
            <input type="file" (change)="onVideoSelected($event, 'article')" accept="video/*" class="file-input">
            <div class="image-preview" *ngIf="articleForm.videoUrl">
              <video [src]="articleForm.videoUrl" controls style="max-width:100%; border-radius:8px;"></video>
              <button type="button" class="btn-remove" (click)="articleForm.videoUrl = ''">حذف</button>
            </div>
            <div class="upload-progress" *ngIf="uploading">
              <span>در حال آپلود...</span>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="closeArticleModal()">انصراف</button>
            <button type="submit" class="btn-primary">ذخیره</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Course Modal -->
    <div class="modal" *ngIf="showCourseModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingCourse ? 'ویرایش دوره' : 'دوره جدید' }}</h3>
          <button class="btn-close" (click)="closeCourseModal()">×</button>
        </div>
        <form (ngSubmit)="saveCourse()">
          <div class="form-group">
            <label>عنوان</label>
            <input type="text" [(ngModel)]="courseForm.title" name="title" required>
          </div>
          <div class="form-group">
            <label>توضیح کوتاه</label>
            <textarea [(ngModel)]="courseForm.shortDescription" name="shortDescription" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>محتوا</label>
            <textarea [(ngModel)]="courseForm.description" name="description" rows="4"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>سطح دشواری</label>
              <select [(ngModel)]="courseForm.difficulty" name="difficulty">
                <option value="Beginner">مبتدی</option>
                <option value="Intermediate">متوسط</option>
                <option value="Advanced">پیشرفته</option>
              </select>
            </div>
            <div class="form-group">
              <label>مدت زمان (دقیقه)</label>
              <input type="number" [(ngModel)]="courseForm.estimatedDurationMinutes" name="estimatedDurationMinutes">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>امتیاز</label>
              <input type="number" [(ngModel)]="courseForm.points" name="points">
            </div>
            <div class="form-group">
              <label>منتشر شده</label>
              <input type="checkbox" [(ngModel)]="courseForm.isPublished" name="isPublished">
            </div>
          </div>
          <div class="form-group">
            <label>تصویر دوره</label>
            <input type="file" (change)="onImageSelected($event, 'course')" accept="image/*" class="file-input">
            <div class="image-preview" *ngIf="courseForm.thumbnailUrl">
              <img [src]="courseForm.thumbnailUrl" alt="Preview">
              <button type="button" class="btn-remove" (click)="courseForm.thumbnailUrl = ''">حذف</button>
            </div>
            <div class="upload-progress" *ngIf="uploading">
              <span>در حال آپلود...</span>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="closeCourseModal()">انصراف</button>
            <button type="submit" class="btn-primary">ذخیره</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Announcement Modal -->
    <div class="modal" *ngIf="showAnnouncementModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>اطلاعیه جدید</h3>
          <button class="btn-close" (click)="closeAnnouncementModal()">×</button>
        </div>
        <form (ngSubmit)="saveAnnouncement()">
          <div class="form-group">
            <label>عنوان</label>
            <input type="text" [(ngModel)]="announcementForm.title" name="title" required>
          </div>
          <div class="form-group">
            <label>محتوا</label>
            <textarea [(ngModel)]="announcementForm.content" name="content" rows="4"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>اولویت</label>
              <select [(ngModel)]="announcementForm.priority" name="priority">
                <option value="Normal">معمولی</option>
                <option value="High">فوری</option>
              </select>
            </div>
            <div class="form-group">
              <label>مهم</label>
              <input type="checkbox" [(ngModel)]="announcementForm.isPinned" name="isPinned">
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="closeAnnouncementModal()">انصراف</button>
            <button type="submit" class="btn-primary">ذخیره</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Role Modal -->
    <div class="modal" *ngIf="showRoleModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingRole ? 'ویرایش نقش' : 'نقش جدید' }}</h3>
          <button class="btn-close" (click)="closeRoleModal()">×</button>
        </div>
        <form (ngSubmit)="saveRole()">
          <div class="form-group">
            <label>نام نقش <span class="required">*</span></label>
            <input type="text" [(ngModel)]="roleForm.name" name="name" required>
          </div>
          <div class="form-group">
            <label>توضیحات</label>
            <textarea [(ngModel)]="roleForm.description" name="description" rows="2"></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="closeRoleModal()">انصراف</button>
            <button type="submit" class="btn-primary">ذخیره</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Role Permissions Modal -->
    <div class="modal" *ngIf="showRolePermissionsModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>دسترسی‌های نقش: {{ selectedRole?.name }}</h3>
          <button class="btn-close" (click)="closeRolePermissionsModal()">×</button>
        </div>
        <div class="permissions-grid">
          <div class="permission-module" *ngFor="let group of permissionGroups">
            <h4>{{ group.moduleName }}</h4>
            <div class="permission-types">
              <label *ngFor="let perm of group.permissions">
                <input type="checkbox"
                  [checked]="selectedRolePermissions.includes(perm.id)"
                  (change)="toggleRolePermission(perm.id, $event)">
                <span class="perm-name">{{ perm.name }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" (click)="closeRolePermissionsModal()">انصراف</button>
          <button type="button" class="btn-primary" (click)="saveRolePermissions()">ذخیره دسترسی‌ها</button>
        </div>
      </div>
    </div>

    <!-- User Roles Modal -->
    <div class="modal" *ngIf="showUserRolesModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>نقش‌های کاربر: {{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</h3>
          <button class="btn-close" (click)="closeUserRolesModal()">×</button>
        </div>
        <div class="form-group">
          <label>نقش‌های فعلی:</label>
          <div class="current-roles">
            <span *ngFor="let role of selectedUserRoles" class="role-tag">
              {{ role.roleName }}
              <button type="button" class="btn-remove-role" (click)="removeRoleFromUser(role.roleId)">×</button>
            </span>
            <span *ngIf="selectedUserRoles.length === 0">بدون نقش</span>
          </div>
        </div>
        <div class="form-group">
          <label>افزودن نقش:</label>
          <div class="form-row">
            <select [(ngModel)]="newRoleToAdd" name="newRole">
              <option value="">انتخاب نقش...</option>
              <option *ngFor="let role of allRoles" [value]="role.id">{{ role.name }}</option>
            </select>
            <button type="button" class="btn-primary" (click)="addRoleToUser()">افزودن</button>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" (click)="closeUserRolesModal()">بستن</button>
        </div>
      </div>
    </div>

    <!-- User Modal -->
    <div class="modal" *ngIf="showUserModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingUser ? 'ویرایش کاربر' : 'کاربر جدید' }}</h3>
          <button class="btn-close" (click)="closeUserModal()">×</button>
        </div>
        <form (ngSubmit)="saveUser()">
          <div class="form-group">
            <label>نام کاربری <span class="required">*</span></label>
            <input type="text" [(ngModel)]="userForm.username" name="username" [disabled]="editingUser" required>
          </div>
          <div class="form-group">
            <label>ایمیل <span class="required">*</span></label>
            <input type="email" [(ngModel)]="userForm.email" name="email" required>
          </div>
          <div class="form-group">
            <label>نام</label>
            <input type="text" [(ngModel)]="userForm.firstName" name="firstName">
          </div>
          <div class="form-group">
            <label>نام خانوادگی</label>
            <input type="text" [(ngModel)]="userForm.lastName" name="lastName">
          </div>
          <div class="form-group">
            <label>تصویر پروفایل</label>
            <div class="avatar-upload">
              <div class="avatar-preview">
                <img *ngIf="userForm.avatarUrl" [src]="userForm.avatarUrl" alt="پیش‌نمایش">
                <span class="avatar-fallback" *ngIf="!userForm.avatarUrl">{{ userForm.firstName?.charAt(0) || '؟' }}{{ userForm.lastName?.charAt(0) || '' }}</span>
              </div>
              <div class="avatar-actions">
                <input type="file" accept="image/*" (change)="onAvatarSelected($event)" #avatarInput hidden>
                <button type="button" class="btn-edit" (click)="avatarInput.click()">انتخاب تصویر</button>
                <button type="button" class="btn-delete" (click)="removeUserAvatar()" *ngIf="userForm.avatarUrl">حذف تصویر</button>
                <small style="color:var(--theme-text-muted)">JPG/PNG/WebP — حداکثر {{ uploadLimits.maxImageSizeMB }} مگابایت</small>
              </div>
            </div>
            <div class="upload-progress" *ngIf="uploadingAvatar">در حال آپلود تصویر...</div>
          </div>
          <div class="form-group">
            <label>{{ editingUser ? 'رمز عبور جدید (خالی بگذارید تا تغییر نکند)' : 'رمز عبور' }} <span class="required" *ngIf="!editingUser">*</span></label>
            <input type="password" [(ngModel)]="userForm.password" name="password">
          </div>
          <div class="form-group">
            <label>تکرار رمز عبور <span class="required" *ngIf="!editingUser || userForm.password">*</span></label>
            <input type="password" [(ngModel)]="userForm.confirmPassword" name="confirmPassword">
          </div>
          <div class="form-group">
            <label>واحد سازمانی</label>
            <select [(ngModel)]="userForm.departmentId" name="departmentId">
              <option [ngValue]="null">بدون واحد</option>
              <option *ngFor="let dept of departments" [value]="dept.id">{{ dept.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>سمت</label>
            <select [(ngModel)]="userForm.positionId" name="positionId">
              <option [ngValue]="null">بدون سمت</option>
              <option *ngFor="let pos of positions" [value]="pos.id">{{ pos.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>شماره پرسنلی</label>
            <input type="text" [(ngModel)]="userForm.employeeId" name="employeeId">
          </div>
          <div class="form-group" *ngIf="editingUser">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="userForm.isActive" name="isActive">
              کاربر فعال
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="closeUserModal()">انصراف</button>
            <button type="submit" class="btn-primary">{{ editingUser ? 'ذخیره' : 'ایجاد' }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Category Modal -->
    <div class="modal" *ngIf="showCategoryModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingCategory ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید' }}</h3>
          <button class="btn-close" (click)="closeCategoryModal()">×</button>
        </div>
        <form (ngSubmit)="saveCategory()">
          <div class="form-group">
            <label>نام دسته‌بندی <span class="required">*</span></label>
            <input type="text" [(ngModel)]="categoryForm.name" name="name" required>
          </div>
          <div class="form-group">
            <label>توضیحات</label>
            <textarea [(ngModel)]="categoryForm.description" name="description" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>ترتیب نمایش</label>
            <input type="number" [(ngModel)]="categoryForm.displayOrder" name="displayOrder">
          </div>
          <div class="form-actions">
            <button type="button" class="btn-cancel" (click)="closeCategoryModal()">انصراف</button>
            <button type="submit" class="btn-primary" [disabled]="savingCategory">
              {{ savingCategory ? 'در حال ذخیره...' : 'ذخیره' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { max-width: 1400px; }

    /* ===== Admin Hero ===== */
    .admin-hero {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 28px;
      flex-wrap: wrap;
      border-radius: var(--radius-lg);
      padding: 34px 38px;
      margin-bottom: 22px;
      color: #fff;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      background:
        radial-gradient(900px 320px at 88% -20%, rgba(255,255,255,0.2), transparent 60%),
        linear-gradient(135deg, #17123a 0%, #2d1b69 60%, var(--theme-primary-dark) 100%);
    }

    .admin-hero-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(600px 300px at 70% 20%, #000 30%, transparent 75%);
      -webkit-mask-image: radial-gradient(600px 300px at 70% 20%, #000 30%, transparent 75%);
      animation: gridDrift 12s linear infinite;
      pointer-events: none;
    }

    .admin-hero-content { position: relative; }

    .admin-hero h1 {
      font-size: 2rem;
      font-weight: 900;
      margin: 10px 0 8px;
      letter-spacing: -0.02em;
    }

    .admin-hero p { opacity: 0.85; font-size: 0.92rem; margin: 0; }

    .admin-hero-stats { position: relative; display: flex; gap: 14px; flex-wrap: wrap; }

    .mini-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 14px 26px;
      border-radius: 16px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      transition: all 0.3s var(--ease-spring);
    }
    .mini-stat:hover { background: rgba(255,255,255,0.18); transform: translateY(-3px); }
    .mini-value { font-size: 1.5rem; font-weight: 900; }
    .mini-label { font-size: 0.75rem; opacity: 0.8; font-weight: 600; }

    /* ===== Tabs ===== */
    .admin-tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 26px;
      flex-wrap: wrap;
      padding: 7px;
      background: var(--theme-surface);
      border: 1px solid var(--theme-border);
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
    }

    .admin-tabs button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border: none;
      background: transparent;
      border-radius: 11px;
      cursor: pointer;
      font-weight: 700;
      font-family: inherit;
      font-size: 0.88rem;
      color: var(--theme-text-secondary);
      transition: all 0.28s var(--ease-smooth);
      position: relative;
    }

    .tab-ico { font-size: 1rem; transition: transform 0.28s var(--ease-spring); }

    .admin-tabs button:hover { background: var(--theme-surface-hover); color: var(--theme-text); }
    .admin-tabs button:hover .tab-ico { transform: scale(1.2) rotate(-6deg); }

    .admin-tabs button.active {
      background: var(--gradient-brand);
      color: #fff;
      box-shadow: 0 6px 18px color-mix(in srgb, var(--theme-primary) 35%, transparent);
    }

    /* ===== Stat cards ===== */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 16px; }

    .stat-card {
      background: var(--theme-surface);
      padding: 22px;
      border-radius: var(--radius-md);
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
      display: flex;
      align-items: center;
      gap: 14px;
      transition: all 0.3s var(--ease-smooth);
      position: relative;
      overflow: hidden;
    }

    .stat-card::after {
      content: '';
      position: absolute;
      top: 0; right: 0; bottom: 0;
      width: 3px;
      background: var(--gradient-brand);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
    .stat-card:hover::after { opacity: 1; }

    .stat-ico {
      width: 52px; height: 52px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
      box-shadow: 0 8px 20px rgba(20, 15, 60, 0.16);
    }
    .si-1 { background: linear-gradient(135deg, #2563eb, #60a5fa); }
    .si-2 { background: linear-gradient(135deg, #10b981, #34d399); }
    .si-3 { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
    .si-4 { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
    .si-5 { background: linear-gradient(135deg, #ef4444, #f87171); }
    .si-6 { background: linear-gradient(135deg, #06b6d4, #67e8f9); }
    .si-like { background: linear-gradient(135deg, #ef4444, #f87171); }
    .si-dislike { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
    .si-total { background: linear-gradient(135deg, #2563eb, #60a5fa); }
    .si-satisfaction { background: var(--gradient-brand); }

    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.6rem; font-weight: 900; color: var(--theme-text); line-height: 1.2; }
    .stat-label { color: var(--theme-text-muted); font-size: 0.8rem; font-weight: 700; margin-top: 3px; }

    /* ===== CRUD sections ===== */
    .crud-section {
      background: var(--theme-surface);
      padding: 26px;
      border-radius: var(--radius-md);
      box-shadow: var(--theme-card-shadow);
      border: 1px solid var(--theme-border);
      animation: fadeUp 0.45s var(--ease-smooth) both;
    }

    .crud-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--theme-border);
    }

    .crud-header h3 {
      margin: 0;
      color: var(--theme-text);
      font-size: 1.08rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .crud-header h3::before {
      content: '';
      width: 4px; height: 20px;
      border-radius: 4px;
      background: var(--gradient-brand);
      flex-shrink: 0;
    }

    /* ===== Buttons ===== */
    .btn-primary {
      padding: 10px 22px;
      background: var(--gradient-brand);
      background-size: 180% 180%;
      color: white;
      border: none;
      border-radius: 11px;
      cursor: pointer;
      font-weight: 800;
      font-family: inherit;
      font-size: 0.88rem;
      box-shadow: 0 4px 14px color-mix(in srgb, var(--theme-primary) 28%, transparent);
      transition: all 0.25s var(--ease-smooth);
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); background-position: 100% 50%; box-shadow: 0 8px 22px color-mix(in srgb, var(--theme-primary) 38%, transparent); }
    .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

    .btn-edit, .btn-toggle, .btn-delete, .btn-cancel {
      padding: 7px 14px;
      color: white;
      border: none;
      border-radius: 9px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.8rem;
      font-family: inherit;
      transition: all 0.22s var(--ease-spring);
    }

    .btn-edit { background: linear-gradient(135deg, #3b82f6, #60a5fa); box-shadow: 0 3px 10px rgba(59, 130, 246, 0.3); margin-left: 6px; }
    .btn-toggle { background: linear-gradient(135deg, #f59e0b, #fbbf24); box-shadow: 0 3px 10px rgba(245, 158, 11, 0.3); margin-left: 6px; }
    .btn-delete { background: linear-gradient(135deg, #ef4444, #f87171); box-shadow: 0 3px 10px rgba(239, 68, 68, 0.3); }
    .btn-edit:hover, .btn-toggle:hover, .btn-delete:hover { transform: translateY(-2px) scale(1.03); filter: brightness(1.08); }
    .btn-edit:active, .btn-toggle:active, .btn-delete:active { transform: scale(0.97); }

    .btn-cancel { background: var(--theme-background); color: var(--theme-text-secondary); border: 1.5px solid var(--theme-border); }
    .btn-cancel:hover { border-color: var(--theme-text-muted); background: var(--theme-surface-hover); }

    .required { color: var(--theme-error); }

    /* ===== Tables ===== */
    .crud-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .crud-table th {
      padding: 12px 14px;
      text-align: right;
      background: var(--theme-background);
      color: var(--theme-text-secondary);
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      border-bottom: 2px solid var(--theme-border);
    }
    .crud-table th:first-child { border-radius: 0 12px 12px 0; }
    .crud-table th:last-child { border-radius: 12px 0 0 12px; }

    .crud-table td {
      padding: 13px 14px;
      text-align: right;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-border) 60%, transparent);
      color: var(--theme-text);
      font-size: 0.9rem;
      vertical-align: middle;
    }

    .crud-table tbody tr { transition: all 0.2s ease; }
    .crud-table tbody tr:hover { background: color-mix(in srgb, var(--theme-primary) 4%, transparent); }
    .crud-table tbody tr:last-child td { border-bottom: none; }

    .actions { white-space: nowrap; }

    /* ===== Badges ===== */
    .status-badge {
      padding: 5px 13px;
      border-radius: 100px;
      font-size: 0.73rem;
      font-weight: 800;
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      color: white;
      box-shadow: 0 3px 10px rgba(245, 158, 11, 0.28);
    }
    .status-badge.published {
      background: linear-gradient(135deg, #10b981, #34d399);
      box-shadow: 0 3px 10px rgba(16, 185, 129, 0.28);
    }

    .priority-badge {
      padding: 5px 13px;
      border-radius: 100px;
      font-size: 0.73rem;
      font-weight: 800;
    }
    .priority-badge[data-priority="High"] { background: linear-gradient(135deg, #ef4444, #f87171); color: white; box-shadow: 0 3px 10px rgba(239, 68, 68, 0.28); }
    .priority-badge[data-priority="Normal"] { background: linear-gradient(135deg, #10b981, #34d399); color: white; box-shadow: 0 3px 10px rgba(16, 185, 129, 0.28); }

    /* Satisfaction bar */
    .satisfaction-cell { display: flex; align-items: center; gap: 10px; }
    .satisfaction-bar-mini {
      width: 90px;
      height: 8px;
      background: var(--theme-background);
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid var(--theme-border);
    }
    .satisfaction-fill-mini {
      height: 100%;
      border-radius: 6px;
      background: var(--gradient-brand);
      transition: width 0.6s var(--ease-spring);
    }

    /* ===== Modals ===== */
    .modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(12, 8, 35, 0.55);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.25s ease both;
      padding: 20px;
    }

    .modal-content {
      background: var(--theme-surface);
      padding: 28px;
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 620px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--theme-border);
      animation: popIn 0.35s var(--ease-spring) both;
    }

    .modal-large { max-width: 860px; }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 22px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--theme-border);
    }
    .modal-header h3 { margin: 0; font-size: 1.05rem; font-weight: 800; color: var(--theme-text); }

    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 22px; }

    /* Avatar upload widget (user modal) - keeps preview at a fixed professional size */
    .avatar-upload { display: flex; align-items: center; gap: 16px; }
    .avatar-preview {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid var(--theme-border);
      background: var(--theme-surface-hover);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar-preview img {
      width: 100%;
      height: 100%;
      max-width: none;
      object-fit: cover;
      display: block;
    }
    .avatar-fallback { font-size: 1.4rem; font-weight: 800; color: var(--theme-text-muted); }
    .avatar-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
    .avatar-actions small { color: var(--theme-text-muted); font-size: 0.72rem; }

    /* Small avatar thumbnails in the users table */
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .user-avatar-sm {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 1.5px solid var(--theme-border);
      background: var(--theme-surface-hover);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-avatar-sm img {
      width: 100%;
      height: 100%;
      max-width: none;
      object-fit: cover;
      display: block;
    }
    .user-avatar-sm span { font-size: 0.8rem; font-weight: 800; color: var(--theme-text-secondary); }

    .quiz-questions-editor { margin-top: 10px; }
    .qq-header { display: flex; justify-content: space-between; align-items: center; margin: 18px 0 12px 0; }
    .qq-header h4 { margin: 0; font-weight: 800; color: var(--theme-text); }
    .qq-card {
      background: var(--theme-surface-hover);
      border: 1px solid var(--theme-border);
      border-radius: var(--radius-lg);
      padding: 16px;
      margin-bottom: 14px;
    }
    .qq-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .qq-head strong { color: var(--theme-primary); }
    .qq-answers { margin-top: 8px; }
    .qq-answers-label { display: block; font-weight: 700; font-size: 0.85rem; margin-bottom: 8px; color: var(--theme-text-secondary); }
    .qq-answer { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .qq-answer input[type="text"] {
      flex: 1;
      padding: 9px 12px;
      border: 1.5px solid var(--theme-border);
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.9rem;
      background: var(--theme-surface);
      color: var(--theme-text);
      box-sizing: border-box;
    }
    .qq-answer input[type="text"]:focus { outline: none; border-color: var(--theme-primary); }
    .radio-label { display: flex; align-items: center; cursor: pointer; }
    .radio-label input[type="radio"] { width: 18px; height: 18px; accent-color: var(--theme-primary); cursor: pointer; }

    .policy-hint { color: var(--theme-text-secondary); font-size: 0.85rem; margin: 0 0 14px 0; }
    .policy-order { display: flex; align-items: center; gap: 6px; justify-content: center; }
    .policy-order span { font-weight: 700; min-width: 20px; text-align: center; }
    .policy-order .btn-edit { padding: 4px 8px; font-size: 0.75rem; }
    .policy-input {
      width: 100%;
      padding: 8px 12px;
      border: 1.5px solid var(--theme-border);
      border-radius: 8px;
      font-size: 0.88rem;
      font-family: inherit;
      background: var(--theme-surface);
      color: var(--theme-text);
      box-sizing: border-box;
      resize: vertical;
    }
    .policy-input:focus { outline: none; border-color: var(--theme-primary); }
    .policy-title-input { font-weight: 700; min-width: 140px; }

    .user-search-input {
      padding: 10px 14px;
      border: 1.5px solid var(--theme-border);
      border-radius: 10px;
      font-size: 0.9rem;
      background: var(--theme-surface);
      color: var(--theme-text);
      min-width: 280px;
      font-family: inherit;
    }
    .user-search-input:focus { outline: none; border-color: var(--theme-primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-primary) 12%, transparent); }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 18px; flex-wrap: wrap; }
    .pagination button {
      padding: 8px 14px;
      border: 1.5px solid var(--theme-border);
      background: var(--theme-surface);
      color: var(--theme-text);
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.85rem;
      transition: all 0.2s ease;
    }
    .pagination button:hover:not(:disabled):not(.active) { border-color: var(--theme-primary); color: var(--theme-primary); }
    .pagination button.active { background: var(--theme-primary); color: #fff; border-color: var(--theme-primary); font-weight: 700; }
    .pagination button:disabled { opacity: 0.45; cursor: not-allowed; }
    .pagination span { color: var(--theme-text-secondary); font-size: 0.85rem; margin: 0 8px; }

    .org-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; align-items: start; }
    .org-pane { background: var(--theme-surface); border: 1px solid var(--theme-border); border-radius: var(--radius-lg); padding: 18px; box-shadow: var(--theme-card-shadow); }
    .org-pane .crud-header h3 { margin: 0; font-size: 1rem; font-weight: 800; color: var(--theme-text); }
    .org-pane .crud-table { margin-top: 14px; }
    .btn-toggle.deactivated { background: linear-gradient(135deg, var(--theme-success), #34d399); box-shadow: 0 3px 10px color-mix(in srgb, var(--theme-success) 30%, transparent); }

    @media (max-width: 1024px) { .org-grid { grid-template-columns: 1fr; } }

    .btn-close {
      width: 34px; height: 34px;
      border: 1.5px solid var(--theme-border);
      background: var(--theme-surface);
      border-radius: 10px;
      cursor: pointer;
      color: var(--theme-text-secondary);
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .btn-close:hover { border-color: var(--theme-error); color: var(--theme-error); background: color-mix(in srgb, var(--theme-error) 8%, transparent); transform: rotate(90deg); }

    /* ===== Forms ===== */
    .form-group { margin-bottom: 16px; }
    .form-group label {
      display: block;
      margin-bottom: 7px;
      font-weight: 700;
      color: var(--theme-text);
      font-size: 0.85rem;
    }

    .form-group input[type="text"],
    .form-group input[type="number"],
    .form-group input[type="email"],
    .form-group input[type="password"],
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid var(--theme-border);
      border-radius: 11px;
      font-size: 0.92rem;
      font-family: inherit;
      background: var(--theme-surface);
      color: var(--theme-text);
      transition: all 0.25s var(--ease-smooth);
      box-sizing: border-box;
    }

    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      outline: none;
      border-color: var(--theme-primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--theme-primary) 12%, transparent);
    }

    .form-group input[type="checkbox"] {
      width: 18px; height: 18px;
      accent-color: var(--theme-primary);
      cursor: pointer;
    }

    .checkbox-label { display: flex !important; align-items: center; gap: 10px; cursor: pointer; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    .form-actions {
      display: flex;
      justify-content: flex-start;
      gap: 12px;
      margin-top: 22px;
      padding-top: 18px;
      border-top: 1px solid var(--theme-border);
    }

    /* File upload */
    .file-input {
      width: 100%;
      padding: 14px;
      border: 2px dashed color-mix(in srgb, var(--theme-primary) 35%, var(--theme-border));
      border-radius: 12px;
      cursor: pointer;
      background: color-mix(in srgb, var(--theme-primary) 3%, transparent);
      transition: all 0.25s ease;
      font-family: inherit;
    }
    .file-input:hover { border-color: var(--theme-primary); background: color-mix(in srgb, var(--theme-primary) 7%, transparent); }

    .image-preview { margin-top: 12px; position: relative; display: inline-block; }
    .image-preview img { max-width: 200px; max-height: 140px; border-radius: 12px; box-shadow: var(--shadow-sm); border: 1px solid var(--theme-border); }
    .btn-remove {
      margin-top: 8px;
      padding: 5px 12px;
      background: linear-gradient(135deg, #ef4444, #f87171);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.78rem;
      font-weight: 700;
      font-family: inherit;
      transition: all 0.2s ease;
    }
    .btn-remove:hover { transform: translateY(-1px); filter: brightness(1.1); }

    .upload-progress { margin-top: 10px; color: var(--theme-primary); font-size: 0.88rem; font-weight: 700; }

    /* Role tags in user-roles modal */
    .current-roles { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; background: var(--theme-background); border-radius: 12px; border: 1px solid var(--theme-border); }
    .role-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px 6px 14px;
      background: var(--gradient-brand);
      color: white;
      border-radius: 100px;
      font-size: 0.8rem;
      font-weight: 700;
      box-shadow: 0 3px 10px color-mix(in srgb, var(--theme-primary) 25%, transparent);
    }
    .btn-remove-role {
      width: 20px; height: 20px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.25);
      color: white;
      cursor: pointer;
      font-size: 0.85rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    .btn-remove-role:hover { background: rgba(255,255,255,0.45); transform: scale(1.1); }

    /* Permissions grid */
    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 14px;
      max-height: 55vh;
      overflow-y: auto;
      padding: 4px;
    }
    .permission-module {
      background: var(--theme-background);
      border: 1px solid var(--theme-border);
      border-radius: 14px;
      padding: 16px;
      transition: all 0.25s ease;
    }
    .permission-module:hover { border-color: color-mix(in srgb, var(--theme-primary) 35%, var(--theme-border)); }
    .permission-module h4 {
      margin: 0 0 12px;
      font-size: 0.88rem;
      font-weight: 800;
      color: var(--theme-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .permission-module h4::before {
      content: '';
      width: 8px; height: 8px;
      border-radius: 3px;
      background: var(--gradient-brand);
    }
    .permission-types { display: flex; flex-direction: column; gap: 9px; }
    .permission-types label {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 0.85rem;
      color: var(--theme-text-secondary);
      cursor: pointer;
      transition: color 0.2s ease;
    }
    .permission-types label:hover { color: var(--theme-text); }
    .permission-types input[type="checkbox"] { width: 17px; height: 17px; accent-color: var(--theme-primary); cursor: pointer; }
    .perm-name { font-weight: 600; }

    /* Responsive */
    @media (max-width: 1024px) {
      .admin-hero { flex-direction: column; align-items: flex-start; }
    }
    @media (max-width: 768px) {
      .admin-hero { padding: 24px 20px; }
      .admin-hero h1 { font-size: 1.5rem; }
      .admin-tabs { padding: 5px; gap: 4px; }
      .admin-tabs button { padding: 9px 12px; font-size: 0.8rem; }
      .tab-ico { display: none; }
      .crud-section { padding: 18px; }
      .crud-header { flex-direction: column; align-items: flex-start; gap: 12px; }
      .form-row { grid-template-columns: 1fr; }
      .crud-table th:nth-child(3), .crud-table td:nth-child(3) { display: none; }
    }
  `]
})
export class AdminComponent implements OnInit {
  activeTab = 'analytics';
  analytics: any = null;
  users: any[] = [];
  articles: any[] = [];
  courses: any[] = [];
  categories: any[] = [];
  allCategories: any[] = [];
  announcements: any[] = [];

  showArticleModal = false;
  showCourseModal = false;
  showAnnouncementModal = false;
  showCategoryModal = false;
  showRoleModal = false;
  showRolePermissionsModal = false;
  editingArticle: any = null;
  editingCourse: any = null;
  editingCategory: any = null;
  editingRole: any = null;
  savingCategory = false;

  roles: any[] = [];
  permissionGroups: any[] = [];
  selectedRole: any = null;
  selectedRolePermissions: number[] = [];

  showUserRolesModal = false;
  selectedUser: any = null;
  selectedUserRoles: any[] = [];
  allRoles: any[] = [];
  newRoleToAdd: number | null = null;

  showUserModal = false;
  editingUser: any = null;
  userForm: any = { username: '', email: '', firstName: '', lastName: '', password: '', confirmPassword: '', departmentId: null, positionId: null, employeeId: '', isActive: true };

  departments: any[] = [];
  positions: any[] = [];

  articleForm: any = { title: '', summary: '', content: '', categoryId: '', difficulty: 'Beginner', readingTimeMinutes: 5, isPublished: false, imageUrl: '', videoUrl: '' };
  courseForm: any = { title: '', shortDescription: '', description: '', difficulty: 'Beginner', estimatedDurationMinutes: 60, points: 100, isPublished: false, thumbnailUrl: '' };
  announcementForm: any = { title: '', content: '', priority: 'Normal', isPinned: false };
  categoryForm: any = { name: '', description: '', displayOrder: 0 };
  roleForm: any = { name: '', description: '' };
  uploading = false;

  feedbackStats: any[] = [];
  totalLikes = 0;
  totalDislikes = 0;
  totalVotes = 0;
  overallSatisfaction = 0;

  courseFeedbackStats: any[] = [];
  courseTotalLikes = 0;
  courseTotalDislikes = 0;
  courseTotalVotes = 0;
  courseOverallSatisfaction = 0;

  showOrgModal = false;
  editingOrgKind: 'unit' | 'position' = 'unit';
  editingOrgId: number | null = null;
  orgForm: any = { name: '', code: '', description: '', departmentId: null };

  userPage = 1;
  userPageSize = 10;
  userTotalCount = 0;
  userTotalPages = 1;
  userPageNumbers: number[] = [];
  userSearch = '';

  policyItems: any[] = [];
  savingPolicy = false;

  adminQuizzes: any[] = [];
  showQuizModal = false;
  editingQuiz: any = null;
  quizForm: any = this.emptyQuizForm();

  emptyQuizForm(): any {
    return { title: '', description: '', categoryId: null, difficulty: 'Beginner', timeLimit: 30, passingScore: 70, points: 50, isPublished: false, questions: [] };
  }

  uploadLimits: any = { maxImageSizeMB: 10, maxVideoSizeMB: 50 };
  uploadSettingsSaving = false;
  uploadingAvatar = false;
  pendingAvatarFile: File | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAnalytics();
    this.loadUsers();
    this.loadAnnouncements();
    this.loadCategories();
    this.loadUploadLimits();
  }

  loadUploadLimits(): void {
    this.http.get<any>(`${this.apiUrl}/upload/limits`).subscribe({
      next: (data) => this.uploadLimits = data,
      error: () => this.uploadLimits = { maxImageSizeMB: 10, maxVideoSizeMB: 50 }
    });
  }

  saveUploadLimits(): void {
    if (!this.uploadLimits.maxImageSizeMB || this.uploadLimits.maxImageSizeMB < 1 ||
        !this.uploadLimits.maxVideoSizeMB || this.uploadLimits.maxVideoSizeMB < 1) {
      alert('حداکثر حجم باید عددی بزرگ‌تر از صفر باشد');
      return;
    }
    this.uploadSettingsSaving = true;
    this.http.put(`${this.apiUrl}/upload/limits`, this.uploadLimits).subscribe({
      next: () => {
        this.uploadSettingsSaving = false;
        alert('تنظیمات آپلود با موفقیت ذخیره شد');
      },
      error: (err) => {
        this.uploadSettingsSaving = false;
        alert('خطا در ذخیره تنظیمات: ' + (err.error?.message || err.message));
      }
    });
  }

  get apiUrl() { return environment.apiUrl; }

  loadAnalytics(): void {
    this.http.get<any>(`${this.apiUrl}/admin/analytics`).subscribe({ next: (data) => this.analytics = data });
  }

  loadAiPolicy(): void {
    this.http.get<any[]>(`${this.apiUrl}/aipolicy`).subscribe({
      next: (items) => this.policyItems = (items || []).map(i => ({ title: i.title, text: i.text })),
      error: (err) => console.error('Failed to load AI policy:', err)
    });
  }

  addPolicyItem(): void {
    this.policyItems.push({ title: '', text: '' });
  }

  removePolicyItem(index: number): void {
    if (!confirm('این مورد حذف شود؟')) return;
    this.policyItems.splice(index, 1);
  }

  movePolicyItem(index: number, direction: number): void {
    const target = index + direction;
    if (target < 0 || target >= this.policyItems.length) return;
    const item = this.policyItems[index];
    this.policyItems[index] = this.policyItems[target];
    this.policyItems[target] = item;
  }

  saveAiPolicy(): void {
    const valid = this.policyItems.filter(i => (i.title || '').trim() !== '');
    if (valid.length === 0) {
      alert('حداقل یک مورد با عنوان معتبر الزامی است');
      return;
    }
    this.savingPolicy = true;
    const payload = { items: valid.map((i, idx) => ({ displayOrder: idx + 1, title: i.title.trim(), text: (i.text || '').trim() })) };
    this.http.put(`${this.apiUrl}/aipolicy`, payload).subscribe({
      next: () => {
        this.savingPolicy = false;
        alert('خط‌مشی با موفقیت ذخیره شد');
        this.loadAiPolicy();
      },
      error: (err) => {
        this.savingPolicy = false;
        alert('خطا در ذخیره خط‌مشی: ' + (err.error?.message || err.message));
      }
    });
  }

  loadFeedbackStats(): void {
    this.http.get<any[]>(`${this.apiUrl}/articles/feedback-stats`).subscribe({
      next: (data) => {
        this.feedbackStats = data || [];
        this.totalLikes = this.feedbackStats.reduce((sum, item) => sum + item.likeCount, 0);
        this.totalDislikes = this.feedbackStats.reduce((sum, item) => sum + item.dislikeCount, 0);
        this.totalVotes = this.totalLikes + this.totalDislikes;
        this.overallSatisfaction = this.totalVotes > 0 ? Math.round((this.totalLikes / this.totalVotes) * 100) : 0;
      },
      error: (err) => console.error('Failed to load feedback stats:', err)
    });
  }

  loadCourseFeedbackStats(): void {
    this.http.get<any[]>(`${this.apiUrl}/courses/feedback-stats`).subscribe({
      next: (data) => {
        this.courseFeedbackStats = data || [];
        this.courseTotalLikes = this.courseFeedbackStats.reduce((sum: number, item: any) => sum + item.likeCount, 0);
        this.courseTotalDislikes = this.courseFeedbackStats.reduce((sum: number, item: any) => sum + item.dislikeCount, 0);
        this.courseTotalVotes = this.courseTotalLikes + this.courseTotalDislikes;
        this.courseOverallSatisfaction = this.courseTotalVotes > 0 ? Math.round((this.courseTotalLikes / this.courseTotalVotes) * 100) : 0;
      },
      error: (err) => console.error('Failed to load course feedback stats:', err)
    });
  }

  loadUsers(): void {
    const params = `pageNumber=${this.userPage}&pageSize=10` + (this.userSearch ? `&search=${encodeURIComponent(this.userSearch)}` : '');
    this.http.get<any>(`${this.apiUrl}/admin/users?${params}`).subscribe({
      next: (result) => {
        this.users = result.items || [];
        this.userTotalCount = result.totalCount || 0;
        this.userTotalPages = Math.max(1, Math.ceil(this.userTotalCount / 10));
        this.buildUserPageNumbers();
      },
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  onUserSearch(): void {
    this.userPage = 1;
    this.loadUsers();
  }

  goToUserPage(page: number): void {
    if (page < 1 || page > this.userTotalPages) return;
    this.userPage = page;
    this.loadUsers();
  }

  buildUserPageNumbers(): void {
    const pages: number[] = [];
    const start = Math.max(1, this.userPage - 2);
    const end = Math.min(this.userTotalPages, start + 4);
    for (let p = Math.max(1, end - 4); p <= end; p++) pages.push(p);
    this.userPageNumbers = pages;
  }

  loadArticles(): void {
    console.log('Loading articles...');
    this.http.get<any>(`${this.apiUrl}/articles?pageNumber=1&pageSize=100`).subscribe({
      next: (result) => {
        console.log('Articles loaded:', result);
        this.articles = result.items || [];
        console.log('this.articles set to:', this.articles);
      },
      error: (err) => console.error('Failed to load articles:', err)
    });
  }

  loadCourses(): void {
    this.http.get<any>(`${this.apiUrl}/courses?pageNumber=1&pageSize=100`).subscribe({
      next: (result) => this.courses = result.items || []
    });
  }

  loadAdminQuizzes(): void {
    this.http.get<any[]>(`${this.apiUrl}/quizzes/admin/all`).subscribe({
      next: (data) => this.adminQuizzes = data || [],
      error: (err) => console.error('Failed to load quizzes:', err)
    });
  }

  openQuizModal(): void {
    this.editingQuiz = null;
    this.quizForm = this.emptyQuizForm();
    this.addQuizQuestion();
    this.loadCategories();
    this.showQuizModal = true;
  }

  closeQuizModal(): void {
    this.showQuizModal = false;
    this.editingQuiz = null;
  }

  editQuiz(quiz: any): void {
    this.http.get<any>(`${this.apiUrl}/quizzes/admin/${quiz.id}`).subscribe({
      next: (detail) => {
        this.editingQuiz = quiz;
        this.quizForm = {
          title: detail.title,
          description: detail.description || '',
          categoryId: detail.categoryId || null,
          difficulty: detail.difficulty || 'Beginner',
          timeLimit: detail.timeLimit,
          passingScore: detail.passingScore,
          points: detail.points,
          isPublished: detail.isPublished,
          questions: (detail.questions || []).map((q: any) => ({
            questionText: q.questionText,
            explanation: q.explanation || '',
            points: q.points,
            answers: (q.answers || []).map((a: any) => ({ answerText: a.answerText, isCorrect: a.isCorrect })),
            correctIndex: Math.max(0, (q.answers || []).findIndex((a: any) => a.isCorrect))
          }))
        };
        this.showQuizModal = true;
      },
      error: () => alert('خطا در بارگذاری آزمون')
    });
  }

  addQuizQuestion(): void {
    this.quizForm.questions.push({
      questionText: '',
      explanation: '',
      points: 10,
      answers: [
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false }
      ],
      correctIndex: 0
    });
  }

  removeQuizQuestion(index: number): void {
    if (this.quizForm.questions.length <= 1) {
      alert('آزمون باید حداقل یک سوال داشته باشد');
      return;
    }
    this.quizForm.questions.splice(index, 1);
  }

  addQuizAnswer(q: any): void {
    if (q.answers.length >= 6) return;
    q.answers.push({ answerText: '', isCorrect: false });
  }

  removeQuizAnswer(q: any, index: number): void {
    if (q.answers.length <= 2) return;
    q.answers.splice(index, 1);
    if (q.correctIndex >= q.answers.length) q.correctIndex = 0;
    else if (index < q.correctIndex) q.correctIndex = q.correctIndex - 1;
  }

  saveQuiz(): void {
    if (!this.quizForm.title || !this.quizForm.title.trim()) {
      alert('عنوان آزمون الزامی است');
      return;
    }
    for (let i = 0; i < this.quizForm.questions.length; i++) {
      const q = this.quizForm.questions[i];
      if (!q.questionText || !q.questionText.trim()) {
        alert(`متن سوال ${i + 1} الزامی است`);
        return;
      }
      if (q.answers.filter((a: any) => a.answerText && a.answerText.trim()).length < 2) {
        alert(`سوال ${i + 1} باید حداقل دو گزینه با متن داشته باشد`);
        return;
      }
      if (q.correctIndex === null || q.correctIndex === undefined || q.correctIndex < 0) {
        alert(`برای سوال ${i + 1} گزینه صحیح را انتخاب کنید`);
        return;
      }
    }

    const payload = {
      title: this.quizForm.title.trim(),
      description: this.quizForm.description || null,
      categoryId: this.quizForm.categoryId || null,
      difficulty: this.quizForm.difficulty,
      timeLimit: this.quizForm.timeLimit || 30,
      passingScore: this.quizForm.passingScore || 70,
      points: this.quizForm.points || 50,
      isPublished: !!this.quizForm.isPublished,
      questions: this.quizForm.questions.map((q: any) => ({
        questionText: q.questionText.trim(),
        questionType: 'MultipleChoice',
        explanation: q.explanation || null,
        points: q.points || 10,
        answers: q.answers
          .filter((a: any) => a.answerText && a.answerText.trim())
          .map((a: any, idx: number) => ({ answerText: a.answerText.trim(), isCorrect: idx === q.correctIndex, orderIndex: idx + 1 }))
      }))
    };

    const req = this.editingQuiz
      ? this.http.put<any>(`${this.apiUrl}/quizzes/admin/${this.editingQuiz.id}`, payload)
      : this.http.post<any>(`${this.apiUrl}/quizzes/admin`, payload);

    req.subscribe({
      next: () => {
        alert(this.editingQuiz ? 'آزمون با موفقیت بروزرسانی شد' : 'آزمون با موفقیت ایجاد شد');
        this.closeQuizModal();
        this.loadAdminQuizzes();
      },
      error: (err) => alert('خطا در ذخیره آزمون: ' + (err.error?.message || err.message))
    });
  }

  deleteQuiz(id: number): void {
    if (!confirm('آیا از حذف این آزمون اطمینان دارید؟ کاربران دیگر به آن دسترسی نخواهند داشت.')) return;
    this.http.delete(`${this.apiUrl}/quizzes/admin/${id}`).subscribe({
      next: () => this.loadAdminQuizzes(),
      error: (err) => alert('خطا در حذف آزمون: ' + (err.error?.message || err.message))
    });
  }

  loadCategories(): void {
    this.http.get<any[]>(`${this.apiUrl}/articles/categories`).subscribe({ next: (data) => this.categories = data });
  }

  loadAllCategories(): void {
    this.http.get<any[]>(`${this.apiUrl}/categories`).subscribe({
      next: (data) => this.allCategories = data,
      error: () => alert('خطا در بارگذاری دسته‌بندی‌ها')
    });
  }

  openCategoryModal(): void {
    this.editingCategory = null;
    this.categoryForm = { name: '', description: '', displayOrder: 0 };
    this.showCategoryModal = true;
  }

  editCategory(cat: any): void {
    this.editingCategory = cat;
    this.categoryForm = { name: cat.name, description: cat.description || '', displayOrder: cat.displayOrder || 0 };
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.editingCategory = null;
    this.savingCategory = false;
  }

  saveCategory(): void {
    if (!this.categoryForm.name?.trim()) {
      alert('نام دسته‌بندی را وارد کنید');
      return;
    }

    const request = {
      name: this.categoryForm.name.trim(),
      description: this.categoryForm.description?.trim() || undefined,
      displayOrder: Number(this.categoryForm.displayOrder) || 0
    };

    this.savingCategory = true;
    if (this.editingCategory) {
      this.http.put<any>(`${this.apiUrl}/categories/${this.editingCategory.id}`, request).subscribe({
        next: () => { this.savingCategory = false; this.closeCategoryModal(); this.loadAllCategories(); this.loadCategories(); },
        error: (err) => {
          this.savingCategory = false;
          alert('خطا در ذخیره دسته‌بندی: ' + (err.error?.message || 'خطای سرور'));
        }
      });
    } else {
      this.http.post<any>(`${this.apiUrl}/categories`, request).subscribe({
        next: () => { this.savingCategory = false; this.closeCategoryModal(); this.loadAllCategories(); this.loadCategories(); },
        error: (err) => {
          this.savingCategory = false;
          alert('خطا در ذخیره دسته‌بندی: ' + (err.error?.message || 'خطای سرور'));
        }
      });
    }
  }

  toggleCategory(cat: any): void {
    this.http.put<any>(`${this.apiUrl}/categories/${cat.id}`, {
      name: cat.name,
      description: cat.description,
      displayOrder: cat.displayOrder,
      isActive: !cat.isActive
    }).subscribe({
      next: () => { this.loadAllCategories(); this.loadCategories(); },
      error: (err) => alert('خطا در تغییر وضعیت دسته‌بندی: ' + (err.error?.message || 'خطای سرور'))
    });
  }

  deleteCategory(id: number): void {
    if (confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
      this.http.delete<void>(`${this.apiUrl}/categories/${id}`).subscribe({
        next: () => { this.loadAllCategories(); this.loadCategories(); },
        error: (err) => {
          // Safe deletion: show a clear message if the category is in use
          const msg = err.status === 409
            ? 'این دسته‌بندی به مقالاتی اختصاص داده شده و قابل حذف نیست. ابتدا مقالات مرتبط را به دسته‌بندی دیگری منتقل کنید یا دسته‌بندی را غیرفعال کنید.'
            : (err.error?.message || 'خطا در حذف دسته‌بندی');
          alert(msg);
        }
      });
    }
  }

  loadAnnouncements(): void {
    this.http.get<any[]>(`${this.apiUrl}/admin/announcements`).subscribe({ next: (data) => this.announcements = data });
  }

  openArticleModal(): void {
    this.editingArticle = null;
    this.articleForm = { title: '', summary: '', content: '', categoryId: '', difficulty: 'Beginner', readingTimeMinutes: 5, isPublished: false, imageUrl: '', videoUrl: '' };
    this.showArticleModal = true;
  }

  editArticle(article: any): void {
    this.editingArticle = article;
    this.articleForm = {
      ...article,
      categoryId: article.category?.id || article.categoryId || ''
    };
    this.showArticleModal = true;
  }

  closeArticleModal(): void {
    this.showArticleModal = false;
    this.editingArticle = null;
  }

  saveArticle(): void {
    // Validate required fields
    if (!this.articleForm.title?.trim()) {
      alert('عنوان مقاله را وارد کنید');
      return;
    }
    if (!this.articleForm.summary?.trim()) {
      alert('توضیح کوتاه را وارد کنید');
      return;
    }
    if (!this.articleForm.content?.trim()) {
      alert('محتوا را وارد کنید');
      return;
    }
    if (!this.articleForm.categoryId) {
      alert('دسته‌بندی را انتخاب کنید');
      return;
    }

    // Prepare the request object matching the backend DTO
    const request = {
      title: this.articleForm.title.trim(),
      summary: this.articleForm.summary.trim(),
      content: this.articleForm.content.trim(),
      categoryId: Number(this.articleForm.categoryId) || undefined,
      difficulty: this.articleForm.difficulty,
      readingTimeMinutes: this.articleForm.readingTimeMinutes || 5,
      isPublished: this.articleForm.isPublished,
      imageUrl: this.articleForm.imageUrl || undefined,
      tagIds: this.articleForm.tagIds || []
    };

    if (this.editingArticle) {
      console.log('Updating article ID:', this.editingArticle.id, 'with data:', request);
      this.http.put<any>(`${this.apiUrl}/articles/${this.editingArticle.id}`, request).subscribe({
        next: (updated) => {
          console.log('Article updated successfully:', updated);
          this.closeArticleModal();
          this.loadArticles();
        },
        error: (err) => {
          console.error('Update article error:', err);
          alert('خطا در ویرایش مقاله: ' + (err.error?.message || err.message || 'خطای سرور'));
        }
      });
    } else {
      console.log('Creating article with data:', request);
      const post$ = this.http.post<any>(`${this.apiUrl}/articles`, request);
      console.log('Observable created, subscribing...');
      post$.subscribe({
        next: (result) => {
          console.log('Article created successfully:', result);
          this.closeArticleModal();
          this.loadArticles();
        },
        error: (err) => {
          console.error('Save article error:', err);
          alert('خطا در ذخیره مقاله: ' + (err.error?.message || err.message || 'خطای سرور'));
        },
        complete: () => {
          console.log('Article POST completed');
        }
      });
      console.log('Subscription setup complete');
    }
  }

  deleteArticle(id: number): void {
    if (confirm('آیا از حذف این مقاله اطمینان دارید؟')) {
      this.http.delete<void>(`${this.apiUrl}/articles/${id}`).subscribe({
        next: () => this.loadArticles()
      });
    }
  }

  openCourseModal(): void {
    this.editingCourse = null;
    this.courseForm = { title: '', shortDescription: '', description: '', difficulty: 'Beginner', estimatedDurationMinutes: 60, points: 100, isPublished: false };
    this.showCourseModal = true;
  }

  editCourse(course: any): void {
    this.editingCourse = course;
    this.courseForm = { ...course };
    this.showCourseModal = true;
  }

  closeCourseModal(): void {
    this.showCourseModal = false;
    this.editingCourse = null;
  }

  saveCourse(): void {
    if (this.editingCourse) {
      this.http.put<any>(`${this.apiUrl}/courses/${this.editingCourse.id}`, this.courseForm).subscribe({
        next: () => { this.closeCourseModal(); this.loadCourses(); },
        error: (err) => {
          console.error('Update course error:', err);
          alert('خطا در ویرایش دوره: ' + (err.error?.message || err.message || 'خطای سرور'));
        }
      });
    } else {
      this.http.post<any>(`${this.apiUrl}/courses`, this.courseForm).subscribe({
        next: () => { this.closeCourseModal(); this.loadCourses(); },
        error: (err) => {
          console.error('Create course error:', err);
          alert('خطا در ایجاد دوره: ' + (err.error?.message || err.message || 'خطای سرور'));
        }
      });
    }
  }

  deleteCourse(id: number): void {
    if (confirm('آیا از حذف این دوره اطمینان دارید؟')) {
      this.http.delete<void>(`${this.apiUrl}/courses/${id}`).subscribe({
        next: () => this.loadCourses(),
        error: (err) => {
          console.error('Delete course error:', err);
          alert('خطا در حذف دوره: ' + (err.error?.message || err.message || 'خطای سرور'));
        }
      });
    }
  }

  openUserModal(): void {
    this.editingUser = null;
    this.pendingAvatarFile = null;
    this.userForm = { username: '', email: '', firstName: '', lastName: '', password: '', confirmPassword: '', departmentId: null, positionId: null, employeeId: '', isActive: true, avatarUrl: '' };
    this.loadDepartments();
    this.loadPositions();
    this.showUserModal = true;
  }

  loadDepartments(): void {
    this.http.get<any[]>(`${this.apiUrl}/admin/departments`).subscribe({
      next: (data) => this.departments = data
    });
  }

  loadPositions(): void {
    this.http.get<any[]>(`${this.apiUrl}/admin/positions`).subscribe({
      next: (data) => this.positions = data
    });
  }

  loadOrgData(): void {
    this.loadDepartments();
    this.loadPositions();
  }

  openOrgModal(kind: 'unit' | 'position', existing?: any): void {
    this.editingOrgKind = kind;
    this.editingOrgId = existing ? existing.id : null;
    if (existing) {
      this.orgForm = {
        name: existing.name || '',
        code: existing.code || '',
        description: existing.description || '',
        departmentId: existing.departmentId || null
      };
    } else {
      this.orgForm = { name: '', code: '', description: '', departmentId: null };
    }
    this.showOrgModal = true;
  }

  closeOrgModal(): void {
    this.showOrgModal = false;
    this.editingOrgId = null;
  }

  saveOrg(): void {
    const isUnit = this.editingOrgKind === 'unit';
    const body: any = {
      name: this.orgForm.name,
      code: this.orgForm.code || null,
      description: this.orgForm.description || null,
      displayOrder: 0
    };
    if (!isUnit) body.departmentId = this.orgForm.departmentId;

    const url = isUnit
      ? `${this.apiUrl}/admin/departments`
      : `${this.apiUrl}/admin/positions`;
    const req = this.editingOrgId
      ? this.http.put<any>(`${url}/${this.editingOrgId}`, body)
      : this.http.post<any>(url, body);

    req.subscribe({
      next: () => { this.closeOrgModal(); this.loadOrgData(); },
      error: (err) => alert('خطا در ذخیره: ' + (err.error?.message || err.message))
    });
  }

  deleteUnit(id: number): void {
    if (!confirm('آیا از حذف این واحد سازمانی اطمینان دارید؟ این عملیات قابل بازگشت نیست.')) return;
    this.http.delete(`${this.apiUrl}/admin/departments/${id}`, { observe: 'response' }).subscribe({
      next: (resp) => {
        if (resp.status === 204) {
          alert('واحد سازمانی با موفقیت حذف شد');
          this.loadOrgData();
        }
      },
      error: (err) => {
        alert('خطا در حذف واحد: ' + (err.error?.message || err.message || 'خطای سرور'));
      }
    });
  }

  deletePosition(id: number): void {
    if (!confirm('آیا از حذف این سمت سازمانی اطمینان دارید؟ این عملیات قابل بازگشت نیست.')) return;
    this.http.delete(`${this.apiUrl}/admin/positions/${id}`, { observe: 'response' }).subscribe({
      next: (resp) => {
        if (resp.status === 204) {
          alert('سمت سازمانی با موفقیت حذف شد');
          this.loadOrgData();
        }
      },
      error: (err) => {
        alert('خطا در حذف سمت: ' + (err.error?.message || err.message || 'خطای سرور'));
      }
    });
  }

  toggleUserActive(user: any): void {
    const action = user.isActive ? 'deactivate' : 'activate';
    const msg = user.isActive
      ? `آیا از غیرفعال کردن کاربر «${user.firstName} ${user.lastName}» اطمینان دارید؟ کاربر غیرفعال امکان ورود به سامانه را نخواهد داشت.`
      : `کاربر «${user.firstName} ${user.lastName}» فعال شود؟`;
    if (!confirm(msg)) return;
    this.http.post(`${this.apiUrl}/admin/users/${user.id}/${action}`, {}).subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.loadAnalytics();
        this.loadUsers();
      },
      error: (err) => alert('خطا: ' + (err.error?.message || err.message))
    });
  }

  deleteUser(user: any): void {
    const msg = `آیا از حذف دائمی کاربر «${user.firstName} ${user.lastName}» اطمینان دارید؟\n\nاین عملیات تمام داده‌های مرتبط با کاربر (امتیازها، آزمون‌ها، اطلاع‌رسانی‌ها) را حذف می‌کند و قابل بازگشت نیست.\n\nاگر فقط می‌خواهید کاربر به سامانه دسترسی نداشته باشد، از «غیرفعال کردن» استفاده کنید.`;
    if (!confirm(msg)) return;
    this.http.delete(`${this.apiUrl}/admin/users/${user.id}`).subscribe({
      next: () => {
        alert('کاربر با موفقیت حذف شد');
        this.loadUsers();
        this.loadAnalytics();
      },
      error: (err) => alert('خطا در حذف کاربر: ' + (err.error?.message || err.message))
    });
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.editingUser = null;
  }

  editUser(user: any): void {
    this.editingUser = user;
    this.userForm = {
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      password: '',
      confirmPassword: '',
      departmentId: user.departmentId || null,
      positionId: user.positionId || null,
      employeeId: user.employeeId || '',
      isActive: user.isActive !== false,
      avatarUrl: user.avatarUrl || ''
    };
    this.loadDepartments();
    this.loadPositions();
    this.showUserModal = true;
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Type + size validation (limits are admin-configurable)
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      alert('فقط تصاویر JPG، PNG یا WebP مجاز هستند');
      event.target.value = '';
      return;
    }
    const maxMB = this.uploadLimits.maxImageSizeMB;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`حجم تصویر نباید بیشتر از ${maxMB} مگابایت باشد`);
      event.target.value = '';
      return;
    }

    // For existing users: upload immediately. For new users: keep locally and upload after creation.
    if (this.editingUser) {
      const formData = new FormData();
      formData.append('file', file);
      this.uploadingAvatar = true;
      this.http.post<any>(`${this.apiUrl}/admin/users/${this.editingUser.id}/avatar`, formData).subscribe({
        next: (resp) => {
          this.userForm.avatarUrl = resp.avatarUrl + '?t=' + Date.now();
          this.uploadingAvatar = false;
          this.loadUsers();
        },
        error: (err) => {
          this.uploadingAvatar = false;
          alert('خطا در آپلود تصویر: ' + (err.error?.message || err.message));
        }
      });
    } else {
      // Read as data URL for preview; actual upload happens after user creation
      const reader = new FileReader();
      reader.onload = () => {
        this.userForm.avatarUrl = reader.result as string;
        this.pendingAvatarFile = file;
      };
      reader.readAsDataURL(file);
    }
  }

  removeUserAvatar(): void {
    if (!this.editingUser) {
      this.userForm.avatarUrl = '';
      this.pendingAvatarFile = null;
      return;
    }
    if (!confirm('تصویر پروفایل حذف شود؟')) return;
    this.http.delete(`${this.apiUrl}/admin/users/${this.editingUser.id}/avatar`).subscribe({
      next: () => {
        this.userForm.avatarUrl = '';
        this.loadUsers();
      },
      error: (err) => alert('خطا در حذف تصویر: ' + (err.error?.message || err.message))
    });
  }

  private uploadAvatarFor(userId: number): void {
    if (!this.pendingAvatarFile) return;
    const formData = new FormData();
    formData.append('file', this.pendingAvatarFile);
    this.http.post<any>(`${this.apiUrl}/admin/users/${userId}/avatar`, formData).subscribe({
      next: () => { this.pendingAvatarFile = null; this.loadUsers(); },
      error: (err) => alert('خطا در آپلود تصویر پروفایل: ' + (err.error?.message || err.message))
    });
  }

  saveUser(): void {
    if (this.editingUser) {
      if (this.userForm.password && this.userForm.password !== this.userForm.confirmPassword) {
        alert('خطا: تکرار رمز عبور مطابقت ندارد');
        return;
      }
      const updateData: any = {
        firstName: this.userForm.firstName,
        lastName: this.userForm.lastName,
        email: this.userForm.email,
        employeeId: this.userForm.employeeId,
        // 0 tells the backend to clear the assignment (null = unchanged)
        departmentId: this.userForm.departmentId ?? 0,
        positionId: this.userForm.positionId ?? 0,
        isActive: this.userForm.isActive
      };
      if (this.userForm.password) {
        updateData.password = this.userForm.password;
      }
      this.http.put<any>(`${this.apiUrl}/admin/users/${this.editingUser.id}`, updateData).subscribe({
        next: () => { this.closeUserModal(); this.loadUsers(); },
        error: (err) => alert('خطا در ویرایش کاربر: ' + (err.error?.message || err.message))
      });
    } else {
      if (!this.userForm.password) {
        alert('خطا: رمز عبور الزامی است');
        return;
      }
      if (this.userForm.password !== this.userForm.confirmPassword) {
        alert('خطا: تکرار رمز عبور مطابقت ندارد');
        return;
      }
      if (!this.userForm.username || !this.userForm.email) {
        alert('خطا: نام کاربری و ایمیل الزامی است');
        return;
      }
      this.http.post<any>(`${this.apiUrl}/admin/users`, this.userForm).subscribe({
        next: (created) => {
          if (this.pendingAvatarFile && created?.id) {
            this.uploadAvatarFor(created.id);
          }
          this.closeUserModal();
          this.loadUsers();
        },
        error: (err) => alert('خطا در ایجاد کاربر: ' + (err.error?.message || err.message))
      });
    }
  }

  openAnnouncementModal(): void {
    this.announcementForm = { title: '', content: '', priority: 'Normal', isPinned: false };
    this.showAnnouncementModal = true;
  }

  closeAnnouncementModal(): void {
    this.showAnnouncementModal = false;
  }

  saveAnnouncement(): void {
    this.http.post<any>(`${this.apiUrl}/admin/announcements`, this.announcementForm).subscribe({
      next: () => { this.closeAnnouncementModal(); this.loadAnnouncements(); },
      error: (err) => {
        console.error('Create announcement error:', err);
        alert('خطا در ایجاد اطلاعیه: ' + (err.error?.message || err.message || 'خطای سرور'));
      }
    });
  }

  deleteAnnouncement(id: number): void {
    if (confirm('آیا از حذف این اطلاعیه اطمینان دارید؟')) {
      this.http.delete<void>(`${this.apiUrl}/admin/announcements/${id}`).subscribe({
        next: () => this.loadAnnouncements(),
        error: (err) => {
          console.error('Delete announcement error:', err);
          alert('خطا در حذف اطلاعیه: ' + (err.error?.message || err.message || 'خطای سرور'));
        }
      });
    }
  }

  loadRoles(): void {
    this.http.get<any[]>(`${this.apiUrl}/roles`).subscribe({
      next: (data) => this.roles = data
    });
  }

  openRoleModal(): void {
    this.editingRole = null;
    this.roleForm = { name: '', description: '' };
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.editingRole = null;
  }

  saveRole(): void {
    if (this.editingRole) {
      this.http.put<any>(`${this.apiUrl}/roles/${this.editingRole.id}`, { name: this.roleForm.name, description: this.roleForm.description }).subscribe({
        next: () => { this.closeRoleModal(); this.loadRoles(); },
        error: (err) => alert('خطا در ویرایش نقش: ' + (err.error?.message || err.message))
      });
    } else {
      this.http.post<any>(`${this.apiUrl}/roles`, { name: this.roleForm.name, description: this.roleForm.description, permissionIds: [] }).subscribe({
        next: () => { this.closeRoleModal(); this.loadRoles(); },
        error: (err) => alert('خطا در ایجاد نقش: ' + (err.error?.message || err.message))
      });
    }
  }

  deleteRole(id: number): void {
    if (confirm('آیا از حذف این نقش اطمینان دارید؟')) {
      this.http.delete<void>(`${this.apiUrl}/roles/${id}`).subscribe({
        next: () => this.loadRoles(),
        error: (err) => alert('خطا در حذف نقش: ' + (err.error?.message || err.message))
      });
    }
  }

  openRolePermissionsModal(role: any): void {
    this.selectedRole = role;
    this.selectedRolePermissions = role.permissions?.map((p: any) => p.id) || [];
    this.http.get<any[]>(`${this.apiUrl}/roles/permissions/grouped`).subscribe({
      next: (data) => {
        this.permissionGroups = data;
        this.showRolePermissionsModal = true;
      }
    });
  }

  closeRolePermissionsModal(): void {
    this.showRolePermissionsModal = false;
    this.selectedRole = null;
  }

  toggleRolePermission(permId: number, event: any): void {
    if (event.target.checked) {
      if (!this.selectedRolePermissions.includes(permId)) {
        this.selectedRolePermissions.push(permId);
      }
    } else {
      this.selectedRolePermissions = this.selectedRolePermissions.filter(id => id !== permId);
    }
  }

  saveRolePermissions(): void {
    this.http.put<any>(`${this.apiUrl}/roles/${this.selectedRole.id}`, { permissionIds: this.selectedRolePermissions }).subscribe({
      next: () => { this.closeRolePermissionsModal(); this.loadRoles(); },
      error: (err) => alert('خطا در ذخیره دسترسی‌ها: ' + (err.error?.message || err.message))
    });
  }

  openUserRolesModal(user: any): void {
    this.selectedUser = user;
    this.newRoleToAdd = null;
    this.http.get<any[]>(`${this.apiUrl}/roles`).subscribe({
      next: (roles) => {
        this.allRoles = roles;
      }
    });
    this.http.get<any[]>(`${this.apiUrl}/roles/user/${user.id}/roles`).subscribe({
      next: (userRoles) => {
        this.selectedUserRoles = userRoles;
        this.showUserRolesModal = true;
      }
    });
  }

  closeUserRolesModal(): void {
    this.showUserRolesModal = false;
    this.selectedUser = null;
    this.selectedUserRoles = [];
  }

  addRoleToUser(): void {
    if (!this.newRoleToAdd || !this.selectedUser) return;
    this.http.post<any>(`${this.apiUrl}/roles/assign`, { userId: this.selectedUser.id, roleId: this.newRoleToAdd }).subscribe({
      next: () => {
        this.http.get<any[]>(`${this.apiUrl}/roles/user/${this.selectedUser.id}/roles`).subscribe({
          next: (userRoles) => {
            this.selectedUserRoles = userRoles;
            this.newRoleToAdd = null;
            this.loadUsers();
          }
        });
      },
      error: (err) => alert('خطا در افزودن نقش: ' + (err.error?.message || err.message))
    });
  }

  removeRoleFromUser(roleId: number): void {
    if (!this.selectedUser) return;
    if (!confirm('آیا از حذف این نقش اطمینان دارید؟')) return;
    this.http.delete<void>(`${this.apiUrl}/roles/user/${this.selectedUser.id}/role/${roleId}`).subscribe({
      next: () => {
        this.http.get<any[]>(`${this.apiUrl}/roles/user/${this.selectedUser.id}/roles`).subscribe({
          next: (userRoles) => {
            this.selectedUserRoles = userRoles;
            this.loadUsers();
          }
        });
      },
      error: (err) => alert('خطا در حذف نقش: ' + (err.error?.message || err.message))
    });
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
  }

  onImageSelected(event: any, type: 'article' | 'course'): void {
    const file = event.target.files[0];
    if (!file) return;

    const maxMB = this.uploadLimits.maxImageSizeMB;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`حجم تصویر نباید بیشتر از ${maxMB} مگابایت باشد`);
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.uploading = true;
    this.http.post<any>(`${this.apiUrl}/upload/image`, formData).subscribe({
      next: (response) => {
        if (type === 'article') {
          this.articleForm.imageUrl = response.url;
        } else {
          this.courseForm.thumbnailUrl = response.url;
        }
        this.uploading = false;
      },
      error: (err) => {
        this.uploading = false;
        alert(err.error?.message || 'خطا در آپلود تصویر');
      }
    });
  }

  onVideoSelected(event: any, type: 'article' | 'course'): void {
    const file = event.target.files[0];
    if (!file) return;

    const maxMB = this.uploadLimits.maxVideoSizeMB;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`حجم ویدیو نباید بیشتر از ${maxMB} مگابایت باشد`);
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.uploading = true;
    this.http.post<any>(`${this.apiUrl}/upload/video`, formData).subscribe({
      next: (response) => {
        if (type === 'article') {
          this.articleForm.videoUrl = response.url;
        } else {
          this.courseForm.videoUrl = response.url;
        }
        this.uploading = false;
      },
      error: (err) => {
        this.uploading = false;
        alert(err.error?.message || 'خطا در آپلود ویدیو');
      }
    });
  }
}
