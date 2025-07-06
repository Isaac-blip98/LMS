import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { CourseListComponent } from './pages/course-list/course-list.component';
import { InstructorDashboardComponent } from './pages/instructor-dashboard/instructor-dashboard.component';
import { CourseManagementComponent } from './pages/course-management/course-management.component';
import { ModuleManagementComponent } from './pages/module-management/module-management.component';
import { LessonManagementComponent } from './pages/lesson-management/lesson-management.component';
import { QuizManagementComponent } from './pages/quiz-management/quiz-management.component';
import { AuthGuard } from './guards/auth.guard';
import { InstructorLayoutComponent } from './pages/instructor-layout.component';
import { CourseDetailsComponent } from './pages/course-details.component';
import { ProfileComponent } from './pages/profile.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './pages/admin-dashboard/users/admin-users.component';
import { AdminCoursesComponent } from './pages/admin-dashboard/courses/admin-courses.component';
import { AdminAnalyticsComponent } from './pages/admin-dashboard/analytics/admin-analytics.component';
import { AdminEnrollmentsComponent } from './pages/admin-dashboard/enrollments/admin-enrollments.component';
import { AdminReviewsComponent } from './pages/admin-dashboard/reviews/admin-reviews.component';
import { AdminCertificatesComponent } from './pages/admin-dashboard/certificates/admin-certificates.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'courses', component: CourseListComponent },
  { path: 'courses/:id', component: CourseDetailsComponent },
  { path: 'profile', component: ProfileComponent },
  {
    path: 'instructor',
    component: InstructorLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'INSTRUCTOR' },
    children: [
      { path: 'dashboard', component: InstructorDashboardComponent },
      { path: 'courses', component: CourseManagementComponent },
      { path: 'modules', component: ModuleManagementComponent },
      { path: 'lessons', component: LessonManagementComponent },
      { path: 'quizzes', component: QuizManagementComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: 'users', component: AdminUsersComponent },
      { path: 'courses', component: AdminCoursesComponent },
      { path: 'analytics', component: AdminAnalyticsComponent },
      { path: 'enrollments', component: AdminEnrollmentsComponent },
      { path: 'reviews', component: AdminReviewsComponent },
      { path: 'certificates', component: AdminCertificatesComponent },
      { path: '', redirectTo: 'users', pathMatch: 'full' }
    ]
  },
  // {
  //   path: 'courses/:id',
  //   component: CourseDetailsComponent,
  // },
];
