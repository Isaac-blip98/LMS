import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { StudentService, StudentProgress, StudentAnalytics, Enrollment } from '../../../Services/student.service';
import { AuthService } from '../../../Services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, HeaderComponent],
  templateUrl: './progress.component.html',
})
export class StudentProgressComponent implements OnInit {
  enrollments: Enrollment[] = [];
  progressData: StudentProgress[] = [];
  analytics: StudentAnalytics | null = null;
  isLoading = true;
  error: string | null = null;
  selectedPeriod = 'month';
  dashboardStats: any = null;

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const enrollmentId = this.route.snapshot.paramMap.get('enrollmentId') || undefined;
    this.loadProgressData(enrollmentId);
  }

  private loadProgressData(enrollmentId?: string) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'User not authenticated';
      this.isLoading = false;
      return;
    }

    const userId = currentUser.id;

    // Load enrollments and progress data in parallel
    const enrollments$ = this.studentService.getMyEnrollments();
    const progress$ = this.studentService.getStudentProgress(userId);
    const analytics$ = this.studentService.getStudentAnalytics(userId, this.selectedPeriod);
    const dashboardStats$ = this.studentService.getDashboardStats(userId);

    enrollments$.subscribe({
      next: (enrollments: Enrollment[]) => {
        this.enrollments = enrollments;
        this.checkAndCompleteLoading();
      },
      error: (error: any) => {
        console.error('Error loading enrollments:', error);
        this.enrollments = [];
        this.checkAndCompleteLoading();
      }
    });

    progress$.subscribe({
      next: (progress: StudentProgress[]) => {
        if (enrollmentId) {
          this.progressData = progress.filter(p => p.courseId === enrollmentId);
        } else {
          this.progressData = progress;
        }
        this.checkAndCompleteLoading();
      },
      error: (error: any) => {
        console.error('Error loading progress:', error);
        this.progressData = [];
        this.checkAndCompleteLoading();
      }
    });

    analytics$.subscribe({
      next: (analytics: StudentAnalytics) => {
        this.analytics = analytics;
        this.checkAndCompleteLoading();
      },
      error: (error: any) => {
        console.error('Error loading analytics:', error);
        this.analytics = null;
        this.checkAndCompleteLoading();
      }
    });

    dashboardStats$.subscribe({
      next: (stats: any) => {
        this.dashboardStats = stats;
        this.checkAndCompleteLoading();
      },
      error: (error: any) => {
        console.error('Error loading dashboard stats:', error);
        this.dashboardStats = null;
        this.checkAndCompleteLoading();
      }
    });
  }

  private checkAndCompleteLoading() {
    if (this.enrollments.length > 0 || this.progressData.length > 0 || this.analytics !== null) {
      this.isLoading = false;
    }
  }

  onPeriodChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedPeriod = target.value;
    this.loadProgressData();
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getProgressBarColor(progress: number): string {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
} 