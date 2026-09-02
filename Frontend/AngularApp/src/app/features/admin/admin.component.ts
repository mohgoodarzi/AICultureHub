import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        <button [class.active]="activeTab === 'feedback'" (click)="activeTab = 'feedback'; loadFeedbackStats()"><span class="tab-ico">💬</span>بازخورد</button>
        <button [class.active]="activeTab === 'categories'" (click)="activeTab = 'categories'; loadAllCategories()"><span class="tab-ico">🗂</span>دسته‌بندی‌ها</button>
        <button [class.active]="activeTab === 'courses'" (click)="activeTab = 'courses'; loadCourses()"><span class="tab-ico">🎓</span>دوره‌ها</button>
        <button [class.active]="activeTab === 'users'" (click)="activeTab = 'users'"><span class="tab-ico">👥</span>کاربران</button>
        <button [class.active]="activeTab === 'roles'" (click)="activeTab = 'roles'; loadRoles()"><span class="tab-ico">🔑</span>نقش‌ها</button>
        <button [class.active]="activeTab === 'announcements'" (click)="activeTab = 'announcements'"><span class="tab-ico">📣</span>اطلاعیه‌ها</button>
      </div>

      <!-- Analytics Section -->
      <div class="analytics-section" *ngIf="activeTab === 'analytics' && analytics">
        <div class="stats-grid">
          <div class="stat-card animate-pop delay-1"><div class="stat-ico si-1">👥</div><div class="stat-body"><div class="stat-value">{{ analytics.totalUsers }}</div><div class="stat-label">کاربران</div></div></div>
          <div class="stat-card animate-pop delay-2"><div class="stat-ico si-2">⚡</div><div class="stat-body"><div class="stat-value">{{ analytics.activeUsers }}</div><div class="stat-label">کاربران فعال</div></div></div>
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

      <!-- Users Section -->
      <div class="crud-section" *ngIf="activeTab === 'users'">
        <div class="crud-header">
          <h3>مدیریت کاربران</h3>
          <button class="btn-primary" (click)="openUserModal()">+ کاربر جدید</button>
        </div>
        <table class="crud-table">
          <thead>
            <tr>
              <th>نام</th>
              <th>ایمیل</th>
              <th>امتیاز</th>
              <th>نقش</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.email }}</td>
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
              </td>
            </tr>
          </tbody>
        </table>
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
            <label>ویدیو (اختیاری)</label>
            <input type="file" (change)="onVideoSelected($event, 'article')" accept="video/*" class="file-input">
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
            <label>{{ editingUser ? 'رمز عبور جدید (خالی بگذارید تا تغییر نکند)' : 'رمز عبور' }} <span class="required" *ngIf="!editingUser">*</span></label>
            <input type="password" [(ngModel)]="userForm.password" name="password">
          </div>
          <div class="form-group">
            <label>تکرار رمز عبور <span class="required" *ngIf="!editingUser || userForm.password">*</span></label>
            <input type="password" [(ngModel)]="userForm.confirmPassword" name="confirmPassword">
          </div>
          <div class="form-group">
            <label>دپارتمان</label>
            <select [(ngModel)]="userForm.departmentId" name="departmentId">
              <option [ngValue]="null">انتخاب دپارتمان...</option>
              <option *ngFor="let dept of departments" [value]="dept.id">{{ dept.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>سمت</label>
            <select [(ngModel)]="userForm.positionId" name="positionId">
              <option [ngValue]="null">انتخاب سمت...</option>
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

  articleForm: any = { title: '', summary: '', content: '', categoryId: '', difficulty: 'Beginner', readingTimeMinutes: 5, isPublished: false, imageUrl: '' };
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAnalytics();
    this.loadUsers();
    this.loadAnnouncements();
    this.loadCategories();
  }

  get apiUrl() { return environment.apiUrl; }

  loadAnalytics(): void {
    this.http.get<any>(`${this.apiUrl}/admin/analytics`).subscribe({ next: (data) => this.analytics = data });
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

  loadUsers(): void {
    this.http.get<any>(`${this.apiUrl}/admin/users?pageNumber=1&pageSize=50`).subscribe({
      next: (result) => this.users = result.items || []
    });
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
    this.articleForm = { title: '', summary: '', content: '', categoryId: '', difficulty: 'Beginner', readingTimeMinutes: 5, isPublished: false };
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
    this.userForm = { username: '', email: '', firstName: '', lastName: '', password: '', confirmPassword: '', departmentId: null, positionId: null, employeeId: '', isActive: true };
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
      isActive: user.isActive !== false
    };
    this.loadDepartments();
    this.loadPositions();
    this.showUserModal = true;
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
        departmentId: this.userForm.departmentId,
        positionId: this.userForm.positionId,
        employeeId: this.userForm.employeeId,
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
      this.http.post<any>(`${this.apiUrl}/admin/users`, this.userForm).subscribe({
        next: () => { this.closeUserModal(); this.loadUsers(); },
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
      error: () => {
        this.uploading = false;
        alert('خطا در آپلود تصویر');
      }
    });
  }

  onVideoSelected(event: any, type: 'article' | 'course'): void {
    const file = event.target.files[0];
    if (!file) return;

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
      error: () => {
        this.uploading = false;
        alert('خطا در آپلود ویدیو');
      }
    });
  }
}
