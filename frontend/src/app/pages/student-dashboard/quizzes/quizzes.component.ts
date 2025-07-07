import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { StudentService, QuizAttempt } from '../../../Services/student.service';
import { AuthService } from '../../../Services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-quizzes',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, HeaderComponent, FormsModule],
  templateUrl: './quizzes.component.html',
})
export class StudentQuizzesComponent implements OnInit {
  quizAttempts: QuizAttempt[] = [];
  isLoading = true;
  error: string | null = null;

  // New state for course quizzes
  enrolledCourses: any[] = [];
  selectedCourseId: string | null = null;
  courseQuizzes: any[] = [];
  quizAnswers: { [quizId: string]: { [questionId: string]: string } } = {};
  submittingAttempt: boolean = false;

  constructor(
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadQuizAttempts();
    this.loadEnrolledCourses();
  }

  // Computed properties for template
  get averageScore(): number {
    if (this.quizAttempts.length === 0) return 0;
    const totalScore = this.quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    return Number((totalScore / this.quizAttempts.length).toFixed(1));
  }

  get totalQuestions(): number {
    return this.quizAttempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0);
  }

  loadQuizAttempts() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.error = 'User not authenticated';
      this.isLoading = false;
      return;
    }

    this.studentService.getMyQuizAttempts(currentUser.id).subscribe({
      next: (attempts: QuizAttempt[]) => {
        this.quizAttempts = attempts || [];
        this.error = null; // Clear any previous errors
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading quiz attempts:', error);
        // Only show error for actual API failures, not for empty data
        if (error.status === 404 || error.status === 0) {
          // No quiz attempts found - this is normal for new students
          this.quizAttempts = [];
          this.error = null;
        } else {
          this.error = 'Failed to load quiz attempts. Please try again later.';
        }
        this.isLoading = false;
      }
    });
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  getScoreBadgeColor(score: number): string {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPerformanceMessage(score: number): string {
    if (score >= 90) return 'Excellent!';
    if (score >= 80) return 'Great job!';
    if (score >= 70) return 'Good work!';
    if (score >= 60) return 'Keep practicing!';
    return 'Review the material and try again.';
  }

  loadEnrolledCourses() {
    this.studentService.getMyEnrollments().subscribe({
      next: (enrollments) => {
        this.enrolledCourses = enrollments.map(e => ({ id: e.courseId, title: e.course.title }));
      },
      error: (err) => {
        console.error('Failed to load courses', err);
      }
    });
  }

  onSelectCourse(courseId: string) {
    this.selectedCourseId = courseId;
    this.loadQuizzesForCourse(courseId);
  }

  loadQuizzesForCourse(courseId: string) {
    this.studentService.getQuizzesForCourse(courseId).subscribe({
      next: (quizzes) => {
        this.courseQuizzes = quizzes;
      },
      error: (err) => {
        this.courseQuizzes = [];
        console.error('Failed to load quizzes for course', err);
      }
    });
  }

  setQuizAnswer(quizId: string, questionId: string, answer: string) {
    if (!this.quizAnswers[quizId]) this.quizAnswers[quizId] = {};
    this.quizAnswers[quizId][questionId] = answer;
  }

  submitQuizAttempt(quiz: any) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) return;
    const answers = Object.entries(this.quizAnswers[quiz.id] || {}).map(([questionId, answer]) => ({ questionId, answer }));
    this.submittingAttempt = true;
    this.studentService.createQuizAttempt({
      userId: currentUser.id,
      quizId: quiz.id,
      answers
    }).subscribe({
      next: () => {
        this.submittingAttempt = false;
        this.loadQuizAttempts(); // Refresh attempts
      },
      error: (err) => {
        this.submittingAttempt = false;
        console.error('Failed to submit quiz attempt', err);
      }
    });
  }
} 