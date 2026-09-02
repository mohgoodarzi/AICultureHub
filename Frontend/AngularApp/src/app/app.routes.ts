import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'articles',
    loadComponent: () => import('./features/articles/article-list.component').then(m => m.ArticleListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'articles/:slug',
    loadComponent: () => import('./features/articles/article-detail.component').then(m => m.ArticleDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'courses',
    loadComponent: () => import('./features/courses/course-list.component').then(m => m.CourseListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'courses/:slug',
    loadComponent: () => import('./features/courses/course-detail.component').then(m => m.CourseDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'quizzes',
    loadComponent: () => import('./features/quizzes/quiz-list.component').then(m => m.QuizListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'quizzes/:id',
    loadComponent: () => import('./features/quizzes/quiz-detail.component').then(m => m.QuizDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'ai-policy',
    loadComponent: () => import('./features/ai-policy/ai-policy.component').then(m => m.AiPolicyComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
