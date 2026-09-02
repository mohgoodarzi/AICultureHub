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
      <h1>⚙️ پنل مدیریت</h1>

      <div class="admin-tabs">
        <button [class.active]="activeTab === 'analytics'" (click)="activeTab = 'analytics'">آمار</button>
        <button [class.active]="activeTab === 'articles'" (click)="activeTab = 'articles'; loadArticles()">مقالات</button>
        <button [class.active]="activeTab === 'feedback'" (click)="activeTab = 'feedback'; loadFeedbackStats()">بازخورد</button>
        <button [class.active]="activeTab === 'categories'" (click)="activeTab = 'categories'; loadAllCategories()">دسته‌بندی‌ها</button>
        <button [class.active]="activeTab === 'courses'" (click)="activeTab = 'courses'; loadCourses()">دوره‌ها</button>
        <button [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">کاربران</button>
        <button [class.active]="activeTab === 'roles'" (click)="activeTab = 'roles'; loadRoles()">نقش‌ها</button>
        <button [class.active]="activeTab === 'announcements'" (click)="activeTab = 'announcements'">اطلاعیه‌ها</button>
      </div>

      <!-- Analytics Section -->
      <div class="analytics-section" *ngIf="activeTab === 'analytics' && analytics">
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-value">{{ analytics.totalUsers }}</div><div class="stat-label">کاربران</div></div>
          <div class="stat-card"><div class="stat-value">{{ analytics.activeUsers }}</div><div class="stat-label">کاربران فعال</div></div>
          <div class="stat-card"><div class="stat-value">{{ analytics.totalArticles }}</div><div class="stat-label">مقالات</div></div>
          <div class="stat-card"><div class="stat-value">{{ analytics.totalCourses }}</div><div class="stat-label">دوره‌ها</div></div>
          <div class="stat-card"><div class="stat-value">{{ analytics.quizAttempts }}</div><div class="stat-label">آزمون‌ها</div></div>
          <div class="stat-card"><div class="stat-value">{{ analytics.averageQuizScore | number:'1.0-0' }}%</div><div class="stat-label">میانگین نمره</div></div>
        </div>
      </div>

      <!-- Feedback Statistics Section -->
      <div class="crud-section" *ngIf="activeTab === 'feedback'">
        <div class="crud-header">
          <h3>📊 آمار بازخورد مقالات</h3>
        </div>

        <div class="stats-grid" style="margin-bottom: 20px;">
          <div class="stat-card">
            <div class="stat-value">{{ totalLikes }}</div>
            <div class="stat-label">مجموع لایک‌ها</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ totalDislikes }}</div>
            <div class="stat-label">مجموع دیسلایک‌ها</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ totalVotes }}</div>
            <div class="stat-label">مجموع آرا</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" [style.color]="overallSatisfaction >= 70 ? 'var(--theme-success)' : overallSatisfaction >= 40 ? 'var(--theme-warning)' : 'var(--theme-error)'">
              {{ overallSatisfaction }}%
            </div>
            <div class="stat-label">رضایت کلی</div>
          </div>
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
    h1 { color: #333; margin-bottom: 24px; }
    .admin-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
    .admin-tabs button { padding: 10px 20px; border: 2px solid #e0e0e0; background: white; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .admin-tabs button.active { background: #667eea; color: white; border-color: #667eea; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .stat-card { background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .stat-value { font-size: 2rem; font-weight: 700; color: #333; }
    .stat-label { color: #666; font-size: 0.85rem; margin-top: 4px; }
    .crud-section { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .crud-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .crud-header h3 { margin: 0; color: #333; }
    .btn-primary { padding: 10px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-edit { padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; margin-left: 8px; }
    .btn-toggle { padding: 6px 12px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; margin-left: 8px; }
    .required { color: #ef4444; }
    .btn-delete { padding: 6px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; }
    .crud-table { width: 100%; border-collapse: collapse; }
    .crud-table th, .crud-table td { padding: 12px; text-align: right; border-bottom: 1px solid #e0e0e0; }
    .crud-table th { background: #f8f9fa; font-weight: 600; color: #666; font-size: 0.85rem; text-transform: uppercase; }
    .crud-table tr:hover { background: #f8f9fa; }
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #f59e0b; color: white; }
    .status-badge.published { background: #10b981; }
    .priority-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .priority-badge[data-priority="High"] { background: #ef4444; color: white; }
    .priority-badge[data-priority="Normal"] { background: #10b981; color: white; }
    .actions { white-space: nowrap; }
    .modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; padding: 24px; border-radius: 12px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .modal-header h3 { margin: 0; }
    .btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 600; color: #333; font-size: 0.9rem; }
    .form-group input[type="text"], .form-group input[type="number"], .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem; }
    .form-group textarea { resize: vertical; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-actions { display: flex; justify-content: flex-start; gap: 12px; margin-top: 20px; }
    .btn-cancel { padding: 10px 20px; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .file-input { width: 100%; padding: 10px; border: 2px dashed #ccc; border-radius: 8px; cursor: pointer; }
    .image-preview { margin-top: 10px; position: relative; }
    .image-preview img { max-width: 200px; max-height: 150px; border-radius: 8px; }
    .btn-remove { margin-top: 5px; padding: 4px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
    .upload-progress { margin-top: 10px; color: #667eea; font-size: 0.9rem; }
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
