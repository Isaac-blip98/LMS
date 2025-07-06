import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InstructorService, DashboardStats, CourseAnalytics, ModuleProgress, StudentProgress, CertificateStats, Certificate, QuizAttempt, StudentProgressAnalytics, ModuleProgressDetails, LessonCompletionStats } from '../../Services/instructor.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './instructor-dashboard.component.html',
  styleUrls: ['./instructor-dashboard.component.css']
})
export class InstructorDashboardComponent implements OnInit, OnDestroy {
  dashboardStats: DashboardStats | null = null;
  courses: any[] = [];
  selectedCourse: any = null;
  moduleProgress: ModuleProgress[] = [];
  studentProgress: StudentProgress[] = [];
  courseEngagement: any[] = [];
  isLoading = true;
  activeTab = 'overview';
  selectedPeriod = 'month';

  // Certificate management
  certificateStats: CertificateStats | null = null;
  studentCertificates: Certificate[] = [];
  selectedStudentForCertificate: string = '';
  certificateUrl: string = '';

  // Progress analytics
  enrollments: any[] = [];
  selectedStudentForAnalytics: string = '';
  studentAnalytics: StudentProgressAnalytics | null = null;
  quizAttempts: QuizAttempt[] = [];
  analyticsPeriod = 'month';

  // Chart data
  engagementChartData: any[] = [];
  progressChartData: any[] = [];

  // Module/Lesson Details state
  selectedModuleId: string = '';
  selectedEnrollmentId: string = '';
  selectedLessonId: string = '';
  moduleProgressDetails: ModuleProgressDetails | null = null;
  lessonCompletionStats: LessonCompletionStats | null = null;

  private dashboardRefreshSub?: Subscription;

  constructor(private instructorService: InstructorService) {}

  ngOnInit() {
    this.loadDashboardData();
    // Listen for dashboard refresh events
    this.dashboardRefreshSub = this.instructorService.dashboardRefresh$.subscribe(() => {
      this.loadDashboardData();
    });
  }

  ngOnDestroy() {
    this.dashboardRefreshSub?.unsubscribe();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Load dashboard stats
    this.instructorService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });

    // Load instructor courses
    this.instructorService.getInstructorCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        if (courses.length > 0) {
          this.selectedCourse = courses[0];
          this.loadCourseAnalytics(courses[0].id);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading = false;
      }
    });
  }

  loadCourseAnalytics(courseId: string) {
    if (!courseId) return;

    // Load module progress
    this.instructorService.getModuleProgress(courseId).subscribe({
      next: (progress) => {
        this.moduleProgress = progress;
        this.updateProgressChart();
      },
      error: (error) => {
        console.error('Error loading module progress:', error);
      }
    });

    // Load course engagement
    this.instructorService.getCourseEngagement(courseId, this.selectedPeriod).subscribe({
      next: (engagement) => {
        this.courseEngagement = Array.isArray(engagement) ? engagement : [];
        this.updateEngagementChart();
      },
      error: (error) => {
        console.error('Error loading course engagement:', error);
        this.courseEngagement = [];
      }
    });

    // Load course enrollments (student progress)
    this.instructorService.getCourseEnrollments(courseId).subscribe({
      next: (enrollments) => {
        this.enrollments = Array.isArray(enrollments) ? enrollments : [];
        this.studentProgress = this.enrollments.map((enrollment: any) => ({
          userId: enrollment.user?.id || enrollment.userId,
          studentName: enrollment.user?.name || enrollment.studentName,
          email: enrollment.user?.email || 'N/A',
          progress: enrollment.progress || 0,
          lastActivity: enrollment.updatedAt || enrollment.enrolledAt,
          completedLessons: enrollment.completedLessons || 0,
          totalLessons: enrollment.totalLessons || 0
        }));
      },
      error: (error) => {
        console.error('Error loading course enrollments:', error);
        this.enrollments = [];
        this.studentProgress = [];
      }
    });
  }

  onCourseChange(event: any) {
    const courseId = event.target.value;
    this.selectedCourse = this.courses.find(c => c.id === courseId);
    if (this.selectedCourse) {
      this.loadCourseAnalytics(courseId);
    }
  }

  onPeriodChange(event: any) {
    this.selectedPeriod = event.target.value;
    if (this.selectedCourse) {
      this.loadCourseAnalytics(this.selectedCourse.id);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    // Load data when switching to specific tabs
    if (tab === 'certificates') {
      this.loadCertificateStats();
      // Load certificates for all students in the selected course
      if (this.enrollments && this.enrollments.length > 0) {
        const userIds = this.enrollments.map(e => e.user?.id || e.userId);
        this.loadAllStudentCertificates(userIds);
      } else {
        this.studentCertificates = [];
      }
    }
    if (tab === 'details') {
      this.moduleProgressDetails = null;
      this.lessonCompletionStats = null;
      this.selectedModuleId = '';
      this.selectedEnrollmentId = '';
      this.selectedLessonId = '';
    }
  }

  updateProgressChart() {
    this.progressChartData = this.moduleProgress.map(module => ({
      name: module.moduleTitle,
      value: this.getSafeCompletionRate(module)
    }));
  }

  updateEngagementChart() {
    this.engagementChartData = Array.isArray(this.courseEngagement) ? this.courseEngagement.map(item => ({
      name: new Date(item.date).toLocaleDateString(),
      value: item.activeStudents
    })) : [];
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    if (progress >= 40) return 'text-orange-600';
    return 'text-red-600';
  }

  getProgressBarColor(progress: number): string {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getAverageProgress(): number {
    if (this.studentProgress.length === 0) return 0;
    const totalProgress = this.studentProgress.reduce((sum, student) => sum + student.progress, 0);
    return Number((totalProgress / this.studentProgress.length).toFixed(1));
  }

  // Certificate Management Methods
  loadCertificateStats() {
    this.instructorService.getCertificateStats().subscribe({
      next: (stats) => {
        this.certificateStats = stats;
      },
      error: (error) => {
        console.error('Error loading certificate stats:', error);
        this.certificateStats = null;
      }
    });
  }

  issueCertificate() {
    if (!this.selectedStudentForCertificate || !this.certificateUrl || !this.selectedCourse) return;

    const certificateData = {
      userId: this.selectedStudentForCertificate,
      courseId: this.selectedCourse.id,
      certificateUrl: this.certificateUrl
    };

    this.instructorService.issueCertificate(certificateData).subscribe({
      next: (certificate) => {
        console.log('Certificate issued successfully:', certificate);
        this.loadStudentCertificates(this.selectedStudentForCertificate);
        this.loadCertificateStats();
        // Reset form
        this.selectedStudentForCertificate = '';
        this.certificateUrl = '';
      },
      error: (error) => {
        console.error('Error issuing certificate:', error);
      }
    });
  }

  loadStudentCertificates(userId: string) {
    this.instructorService.getStudentCertificates(userId).subscribe({
      next: (certificates) => {
        this.studentCertificates = certificates.map(cert => ({
          ...cert,
          studentName: cert.user?.name || cert.user?.email || 'N/A',
          courseTitle: cert.course?.title || 'N/A'
        }));
      },
      error: (error) => {
        console.error('Error loading student certificates:', error);
      }
    });
  }

  loadAllStudentCertificates(userIds: string[]) {
    const certs: Certificate[] = [];
    let loaded = 0;
    if (userIds.length === 0) {
      this.studentCertificates = [];
      return;
    }
    userIds.forEach(userId => {
      this.instructorService.getStudentCertificates(userId).subscribe({
        next: (certificates) => {
          certs.push(...certificates.map(cert => ({
            ...cert,
            studentName: cert.user?.name || cert.user?.email || 'N/A',
            courseTitle: cert.course?.title || 'N/A'
          })));
          loaded++;
          if (loaded === userIds.length) {
            // Remove duplicates by certificate id
            this.studentCertificates = certs.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
          }
        },
        error: () => {
          loaded++;
          if (loaded === userIds.length) {
            this.studentCertificates = certs.filter((c, i, arr) => arr.findIndex(x => x.id === c.id) === i);
          }
        }
      });
    });
  }

  // Progress Analytics Methods
  onStudentChange(event: any) {
    const userId = event.target.value;
    this.selectedStudentForAnalytics = userId;
    if (userId) {
      this.loadStudentAnalytics(userId);
      this.loadQuizAttempts(userId);
    } else {
      this.studentAnalytics = null;
      this.quizAttempts = [];
    }
  }

  onAnalyticsPeriodChange(event: any) {
    this.analyticsPeriod = event.target.value;
    if (this.selectedStudentForAnalytics) {
      this.loadStudentAnalytics(this.selectedStudentForAnalytics);
    }
  }

  loadStudentAnalytics(userId: string) {
    this.instructorService.getStudentProgressAnalytics(userId, this.analyticsPeriod).subscribe({
      next: (analytics) => {
        this.studentAnalytics = analytics;
      },
      error: (error) => {
        console.error('Error loading student analytics:', error);
      }
    });
  }

  loadQuizAttempts(userId: string) {
    this.instructorService.getQuizAttempts(userId).subscribe({
      next: (attempts) => {
        this.quizAttempts = attempts;
      },
      error: (error) => {
        console.error('Error loading quiz attempts:', error);
      }
    });
  }

  // Utility Methods
  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  }

  onCertificateFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.instructorService.uploadCertificateFile(file).subscribe({
        next: (res) => {
          if (res && res.url) {
            this.certificateUrl = res.url;
          }
        },
        error: (err) => {
          console.error('Certificate file upload failed:', err);
        }
      });
    }
  }

  getQuizzesTaken(): number {
    return this.quizAttempts ? this.quizAttempts.length : 0;
  }

  getAverageQuizScore(): number {
    if (!this.quizAttempts || this.quizAttempts.length === 0) return 0;
    const total = this.quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
    return Math.round(total / this.quizAttempts.length);
  }

  onModuleDetailSelect(moduleId: string, enrollmentId: string) {
    this.selectedModuleId = moduleId;
    this.selectedEnrollmentId = enrollmentId;
    this.loadModuleProgressDetails();
  }

  loadModuleProgressDetails() {
    if (!this.selectedModuleId || !this.selectedEnrollmentId) return;
    this.instructorService.getModuleProgressDetails(this.selectedModuleId, this.selectedEnrollmentId).subscribe({
      next: (details) => {
        this.moduleProgressDetails = details;
      },
      error: (error) => {
        console.error('Error loading module progress details:', error);
        this.moduleProgressDetails = null;
      }
    });
  }

  onLessonDetailSelect(lessonId: string, courseId: string) {
    this.selectedLessonId = lessonId;
    this.loadLessonCompletionStats(courseId);
  }

  loadLessonCompletionStats(courseId: string) {
    if (!this.selectedLessonId || !courseId) return;
    this.instructorService.getLessonCompletionStats(this.selectedLessonId, courseId).subscribe({
      next: (stats) => {
        this.lessonCompletionStats = stats;
      },
      error: (error) => {
        console.error('Error loading lesson completion stats:', error);
        this.lessonCompletionStats = null;
      }
    });
  }

  getSafeCompletionRate(module: ModuleProgress): number {
    if (!module.totalLessons || module.totalLessons === 0) return 0;
    return Math.round((module.completedLessons / module.totalLessons) * 100);
  }

} 