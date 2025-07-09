import { Component, OnInit } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { StatsCardsComponent } from '../stats-card/stats-cards.component';
import { QuickActionsComponent } from '../quick-action/quick-actions.component';
import { LearningSummaryComponent } from '../learning-summary/learning-summary.component';
import { QuickStatsComponent } from '../quick-stats/quick-stats.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { StudentService, StudentDashboardStats, StudentLearningSummary, StudentQuickStats, StudentAnalytics, Enrollment } from '../../../Services/student.service';
import { AuthService } from '../../../Services/auth.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [Sidebar, CommonModule, StatsCardsComponent, QuickActionsComponent, LearningSummaryComponent, QuickStatsComponent, HeaderComponent],
  templateUrl: './dashboard.component.html',
})
export class Dashboard implements OnInit {
  dashboardStats: StudentDashboardStats | null = null;
  learningSummary: StudentLearningSummary | null = null;
  quickStats: StudentQuickStats | null = null;
  enrollments: Enrollment[] = [];
  analytics: StudentAnalytics | null = null;
  isLoading = true;
  error: string | null = null;
  quizAttempts: any[] = [];

  constructor(
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'User not authenticated';
      this.isLoading = false;
      return;
    }

    const userId = currentUser.id;

    // Fetch quiz attempts
    this.studentService.getMyQuizAttempts(userId).subscribe({
      next: (attempts: any[]) => {
        this.quizAttempts = attempts;
        // After quiz attempts, load stats
        this.studentService.getDashboardStats(userId).subscribe({
          next: (stats: StudentDashboardStats) => {
            this.dashboardStats = stats;
            this.loadEnrollmentsAndAnalytics(userId);
          },
          error: (error: any) => {
            console.error('Error loading dashboard stats:', error);
            this.loadEnrollmentsAndAnalytics(userId);
          }
        });
      },
      error: (error: any) => {
        console.error('Error loading quiz attempts:', error);
        this.quizAttempts = [];
        this.studentService.getDashboardStats(userId).subscribe({
          next: (stats: StudentDashboardStats) => {
            this.dashboardStats = stats;
            this.loadEnrollmentsAndAnalytics(userId);
          },
          error: (error: any) => {
            console.error('Error loading dashboard stats:', error);
            this.loadEnrollmentsAndAnalytics(userId);
          }
        });
      }
    });
  }

  private loadEnrollmentsAndAnalytics(userId: string) {

    const enrollments$ = this.studentService.getMyEnrollments();
    const analytics$ = this.studentService.getStudentAnalytics(userId);

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

    analytics$.subscribe({
      next: (analytics: StudentAnalytics) => {
        this.analytics = analytics;
        this.calculateAdditionalData();
        this.checkAndCompleteLoading();
      },
      error: (error: any) => {
        console.error('Error loading analytics:', error);
        this.analytics = null;
        this.calculateAdditionalData();
        this.checkAndCompleteLoading();
      }
    });
  }

  private checkAndCompleteLoading() {

    if (this.dashboardStats !== null || this.enrollments.length > 0) {
      this.isLoading = false;
    }
  }

  private calculateAdditionalData() {
    if (this.analytics) {
      this.learningSummary = this.studentService.calculateLearningSummary(this.analytics);
      this.quickStats = this.studentService.calculateQuickStats(this.analytics);
    } else {

      this.learningSummary = {
        status: 'Active',
        level: 'BEGINNER',
        focusArea: 'PROGRAMMING',
        learningStreak: 0
      };
      this.quickStats = {
        totalLessons: 0,
        completedLessons: 0,
        averageProgress: 0,
        studyHours: 0
      };
    }


    if (!this.dashboardStats && this.enrollments && this.analytics) {
      this.dashboardStats = this.studentService.calculateDashboardStats(this.enrollments, this.analytics, this.quizAttempts);
    } else if (!this.dashboardStats) {

      this.dashboardStats = {
        enrolledCourses: this.enrollments?.length || 0,
        completedCourses: 0,
        totalProgress: 0,
        averageGrade: 0
      };
    }
  }
}
