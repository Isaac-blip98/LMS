import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../../../core/layout/header/header.component';
import { StudentService, Enrollment } from '../../../Services/student.service';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, Sidebar, HeaderComponent],
  templateUrl: './courses.component.html',
})
export class StudentCoursesComponent implements OnInit {
  enrollments: Enrollment[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEnrollments();
  }

  private loadEnrollments() {
    this.studentService.getMyEnrollments().subscribe({
      next: (enrollments: Enrollment[]) => {
        this.enrollments = enrollments;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading enrollments:', error);
        this.error = 'Failed to load your courses';
        this.isLoading = false;
      }
    });
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

  onContinueLearning(courseId: string) {
    this.router.navigate(['/student/courses', courseId, 'learn']);
  }

  onViewProgress(enrollmentId: string) {
    this.router.navigate(['/student/progress', enrollmentId]);
  }
}
