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
  // --- New state for backend-driven eligibility ---
  completeEligibility: any = null;
  completeLoading = false;
  completeError: string | null = null;
  completeSuccess: string | null = null;

  constructor(private studentService: StudentService, private authService: AuthService) {}

  ngOnInit() {
    this.loadCurrentCourseAndCheck();
  }

  loadCurrentCourseAndCheck() {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.completeEligibility = null;
      this.loading = false;
      return;
    }
    this.studentService.getMyEnrollments().subscribe(enrollments => {
      this.enrollments = enrollments;
      if (enrollments.length > 0) {
        this.currentCourseId = enrollments[0].courseId;
        this.fetchCompleteEligibility(enrollments[0].id);
      } else {
        this.completeEligibility = null;
        this.loading = false;
      }
    }, _ => { this.completeEligibility = null; this.loading = false; });
  }

  fetchCompleteEligibility(enrollmentId: string) {
    this.completeLoading = true;
    this.studentService.getCourseCompleteEligibility(enrollmentId).subscribe({
      next: (eligibility) => {
        this.completeEligibility = eligibility;
        this.completeLoading = false;
      },
      error: (err) => {
        this.completeEligibility = null;
        this.completeLoading = false;
      }
    });
  }

  completeCourse() {
    if (!this.enrollments.length) return;
    this.completeLoading = true;
    this.completeError = null;
    this.completeSuccess = null;
    this.studentService.completeCourse(this.enrollments[0].id).subscribe({
      next: (res) => {
        this.completeLoading = false;
        this.completeSuccess = 'Course marked as completed!';
        this.fetchCompleteEligibility(this.enrollments[0].id);
      },
      error: (err) => {
        this.completeLoading = false;
        this.completeError = err?.error?.message || 'Failed to complete course.';
      }
    });
  }
}
