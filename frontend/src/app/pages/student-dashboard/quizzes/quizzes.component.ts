import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { StudentService, QuizAttempt } from '../../../Services/student.service';
import { AuthService } from '../../../Services/auth.service';
import { FormsModule } from '@angular/forms';

// Add answers property to QuizAttempt for local use
interface QuizAttemptWithAnswers extends QuizAttempt {
  answers?: any[] | { [questionId: string]: string };
}

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
  quizAnswers: { [quizId: string]: { [questionId: string]: string } | undefined } = {};
  submittingAttempt: boolean = false;
  successMessage: string | null = null;
  submitError: string | null = null;

  // State for retake mode
  retakeQuizId: string | null = null;
  retakeQuestions: any[] = [];

  constructor(
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadQuizAttempts();
    this.loadEnrolledCourses();
  }

  // Compute average score using only the highest score per quiz
  get averageScore(): number {
    if (this.quizAttempts.length === 0) return 0;
    const highestScores: { [quizId: string]: number } = {};
    this.quizAttempts.forEach(attempt => {
      if (!highestScores[attempt.quizId] || attempt.score > highestScores[attempt.quizId]) {
        highestScores[attempt.quizId] = attempt.score;
      }
    });
    const scores = Object.values(highestScores);
    return scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;
  }

  // Determine if a student can retake a quiz (only if not passed)
  canRetakeQuiz(quizId: string): boolean {
    const attempts = this.quizAttempts.filter(a => a.quizId === quizId);
    const highest = attempts.reduce((max, a) => a.score > max ? a.score : max, 0);
    return highest < 50; // Pass mark is 50
  }

  get totalQuestions(): number {
    return this.quizAttempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0);
  }

  // Unique quiz count based on courseQuizzes
  get totalQuizCount(): number {
    return this.courseQuizzes.length;
  }

  // Total question count based on courseQuizzes
  get totalQuestionCount(): number {
    return this.courseQuizzes.reduce((sum: number, quiz: any) => sum + (quiz.questions?.length || 0), 0);
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
        this.enrolledCourses = enrollments.map(e => ({ id: e.courseId, title: e.course?.title || 'Untitled Course' }));
      },
      error: (err) => {
        console.error('Failed to load courses', err);
      }
    });
  }

  onSelectCourse(courseId: string) {
    this.selectedCourseId = courseId;
    this.courseQuizzes = [];
    if (!courseId) return;
    this.studentService.getQuizzesForCourse(courseId).subscribe({
      next: (quizzes) => {
        this.courseQuizzes = quizzes; // quizzes already include questions
        console.log('Loaded quizzes:', this.courseQuizzes); // Debug log
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
    this.successMessage = null;
    this.submitError = null;
    this.submittingAttempt = true;
    this.studentService.createQuizAttempt({
      userId: currentUser.id,
      quizId: quiz.id,
      answers
    }).subscribe({
      next: () => {
        this.submittingAttempt = false;
        this.successMessage = 'Quiz attempt submitted successfully!';
        this.loadQuizAttempts();
      },
      error: (err) => {
        this.submittingAttempt = false;
        this.submitError = 'Failed to submit quiz attempt. Please try again.';
        console.error('Failed to submit quiz attempt', err);
      }
    });
  }

  submitAllQuizAttempts() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) return;
    this.successMessage = null;
    this.submitError = null;
    this.submittingAttempt = true;
    const quizAttempts = this.courseQuizzes.map(quiz => {
      const answers = Object.entries(this.quizAnswers[quiz.id] || {}).map(([questionId, answer]) => ({ questionId, answer }));
      return this.studentService.createQuizAttempt({
        userId: currentUser.id,
        quizId: quiz.id,
        answers
      });
    });
    // Submit all attempts in parallel
    Promise.all(quizAttempts.map(obs => obs.toPromise()))
      .then(() => {
        this.submittingAttempt = false;
        this.successMessage = 'All quiz attempts submitted successfully!';
        this.loadQuizAttempts();
      })
      .catch(err => {
        this.submittingAttempt = false;
        this.submitError = 'Failed to submit all quiz attempts. Please try again.';
        console.error('Failed to submit all quiz attempts', err);
      });
  }

  // Get failed questions for a quiz (from highest score attempt)
  getFailedQuestions(quiz: any): any[] {
    const attempts = this.quizAttempts.filter(a => a.quizId === quiz.id) as QuizAttemptWithAnswers[];
    if (attempts.length === 0) return quiz.questions;
    // Use the highest score attempt
    const highest = attempts.reduce((max, a) => a.score > max.score ? a : max, attempts[0]);
    // Find failed questions
    const failed = quiz.questions.filter((q: any) => {
      // Find the answer in the attempt
      const ans = Array.isArray(highest.answers)
        ? highest.answers.find((a: any) => a.questionId === q.id)
        : highest.answers && highest.answers[q.id]
          ? { answer: highest.answers[q.id] }
          : null;
      return !ans || ans.answer !== q.answer;
    });
    return failed;
  }

  // Start retake mode for a quiz
  startRetakeQuiz(quiz: any) {
    this.retakeQuizId = quiz.id;
    this.retakeQuestions = this.getFailedQuestions(quiz);
    // Optionally clear previous answers for these questions
    this.quizAnswers[quiz.id] = {};
  }

  // Exit retake mode
  cancelRetakeQuiz() {
    this.retakeQuizId = null;
    this.retakeQuestions = [];
  }

  // Submit only failed questions as a new attempt
  submitRetakeQuiz(quiz: any) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) return;
    const answers = Object.entries(this.quizAnswers[quiz.id] || {})
      .filter(([questionId, _]) => this.retakeQuestions.some(q => q.id === questionId))
      .map(([questionId, answer]) => ({ questionId, answer }));
    this.successMessage = null;
    this.submitError = null;
    this.submittingAttempt = true;
    this.studentService.createQuizAttempt({
      userId: currentUser.id,
      quizId: quiz.id,
      answers
    }).subscribe({
      next: () => {
        this.submittingAttempt = false;
        this.successMessage = 'Retake submitted!';
        this.loadQuizAttempts();
        this.cancelRetakeQuiz();
      },
      error: (err) => {
        this.submittingAttempt = false;
        this.submitError = 'Failed to submit retake. Please try again.';
        console.error('Failed to submit retake', err);
      }
    });
  }

  // Start retake mode for all quizzes that can be retaken
  startRetakeQuizForAll() {
    this.retakeQuizId = 'ALL';
    // Optionally clear previous answers for all retakable quizzes
    this.courseQuizzes.forEach((quiz: any) => {
      if (this.canRetakeQuiz(quiz.id)) {
        this.quizAnswers[quiz.id] = {};
      }
    });
  }

  // Submit retake for all quizzes that can be retaken
  submitRetakeQuizForAll() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) return;
    this.successMessage = null;
    this.submitError = null;
    this.submittingAttempt = true;
    const retakeObservables = this.courseQuizzes
      .filter((quiz: any) => this.canRetakeQuiz(quiz.id))
      .map((quiz: any) => {
        const failedQuestions = this.getFailedQuestions(quiz);
        const answers = Object.entries(this.quizAnswers[quiz.id] || {})
          .filter(([questionId, _]) => failedQuestions.some((q: any) => q.id === questionId))
          .map(([questionId, answer]) => ({ questionId, answer }));
        return this.studentService.createQuizAttempt({
          userId: currentUser.id,
          quizId: quiz.id,
          answers
        });
      });
    Promise.all(retakeObservables.map(obs => obs.toPromise()))
      .then(() => {
        this.submittingAttempt = false;
        this.successMessage = 'Retake(s) submitted!';
        this.loadQuizAttempts();
        this.cancelRetakeQuiz();
      })
      .catch(err => {
        this.submittingAttempt = false;
        this.submitError = 'Failed to submit retake(s). Please try again.';
        console.error('Failed to submit retake(s)', err);
      });
  }
} 