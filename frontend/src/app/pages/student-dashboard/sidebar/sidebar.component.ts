import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService, Enrollment } from '../../../Services/student.service';
import { AuthService } from '../../../Services/auth.service';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sidebar.component.html',
})
export class Sidebar implements OnInit {
  canCompleteCourse = false;
  loading = false;
  currentCourseId?: string;
  enrollments: Enrollment[] = [];

  constructor(private studentService: StudentService, private authService: AuthService) {}

  ngOnInit() {
    this.loadCurrentCourseAndCheck();
  }

  loadCurrentCourseAndCheck() {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.canCompleteCourse = false;
      this.loading = false;
      return;
    }
    this.studentService.getMyEnrollments().subscribe(enrollments => {
      this.enrollments = enrollments;
      if (enrollments.length > 0) {
        this.currentCourseId = enrollments[0].courseId;
        this.checkCompletionEligibility();
      } else {
        this.canCompleteCourse = false;
        this.loading = false;
      }
    }, _ => { this.canCompleteCourse = false; this.loading = false; });
  }

  checkCompletionEligibility() {
    const user = this.authService.getCurrentUser();
    if (!user?.id || !this.currentCourseId) {
      this.canCompleteCourse = false;
      this.loading = false;
      return;
    }
    // Get all quizzes for the course
    this.studentService.getQuizzesForCourse(this.currentCourseId).subscribe(quizzes => {
      // Get all quiz attempts for the user
      this.studentService.getMyQuizAttempts(user.id).subscribe(attempts => {
        // Check if all quizzes are passed and CAT attempted
        let allPassed = true;
        let catAttempted = false;
        for (const quiz of quizzes) {
          const attempt = attempts.find(a => a.quizId === quiz.id);
          if (quiz.title.toLowerCase().includes('cat')) {
            catAttempted = !!attempt;
          }
          if (!attempt || (attempt.score / attempt.totalQuestions) * 100 < 50) {
            allPassed = false;
          }
        }
        this.canCompleteCourse = allPassed && catAttempted;
        this.loading = false;
      }, _ => { this.canCompleteCourse = false; this.loading = false; });
    }, _ => { this.canCompleteCourse = false; this.loading = false; });
  }

  completeCourse() {
    // TODO: Implement API call to mark course as complete
    alert('Course marked as complete! (Implement API call)');
  }
}
