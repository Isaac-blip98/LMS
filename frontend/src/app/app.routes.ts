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
    path: 'student/dashboard',
    loadComponent: () =>
      import('./pages/student-dashboard/dashboard/dashboard.component').then(m => m.Dashboard),
    canActivate: [AuthGuard], 
    data: { roles: ['STUDENT'] }, 
  },
  {
    path: 'student/courses',
    loadComponent: () =>
      import('./pages/student-dashboard/courses/courses.component').then(m => m.StudentCoursesComponent),
    canActivate: [AuthGuard], 
    data: { roles: ['STUDENT'] }, 
  },
  {
    path: 'student/progress',
    loadComponent: () =>
      import('./pages/student-dashboard/progress/progress.component').then(m => m.StudentProgressComponent),
    canActivate: [AuthGuard], 
    data: { roles: ['STUDENT'] }, 
  },
  {
    path: 'student/quizzes',
    loadComponent: () =>
      import('./pages/student-dashboard/quizzes/quizzes.component').then(m => m.StudentQuizzesComponent),
    canActivate: [AuthGuard], 
    data: { roles: ['STUDENT'] }, 
  },
  {
    path: 'student/certificates',
    loadComponent: () =>
      import('./pages/student-dashboard/certificates/certificates.component').then(m => m.StudentCertificatesComponent),
    canActivate: [AuthGuard], 
    data: { roles: ['STUDENT'] }, 
  }
];
