import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService, Course, Review } from '../Services/course.service';
import { RouterModule } from '@angular/router';
import { InstructorService } from '../Services/instructor.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../Services/auth.service';
import { StudentService } from '../Services/student.service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './course-details.component.html',
})
export class CourseDetailsComponent implements OnInit {
  course: Course | null = null;
  reviews: Review[] = [];
  loading = true;
  reviewsLoading = true;
  errorMessage = '';
  reviewsError = '';

  moduleCount = 0;
  lessonCount = 0;

  // Review form state
  reviewRating: number = 5;
  reviewComment: string = '';
  reviewUserId: string = '';
  reviewSubmitting = false;
  reviewSubmitError = '';

  isLoggedIn = false;
  currentUser: { id: string; name: string; email: string; role: string } | null = null;

  averageRating: number = 0;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private authService: AuthService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseService.getCourseById(id).subscribe({
        next: (data: Course) => {
          this.course = data;
          this.loading = false;
          this.fetchReviews(id);
          this.fetchModuleAndLessonCounts(id);
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to load course details';
          this.loading = false;
        },
      });
    } else {
      this.errorMessage = 'Invalid course ID';
      this.loading = false;
    }
  }

  fetchModuleAndLessonCounts(courseId: string) {
    this.instructorService.getCourseModules(courseId).subscribe({
      next: (modules: any[]) => {
        this.moduleCount = modules.length;
        if (modules.length === 0) {
          this.lessonCount = 0;
          return;
        }
        let lessonPromises = modules.map((mod) =>
          this.instructorService.getModuleLessons(mod.id).toPromise()
        );
        Promise.all(lessonPromises).then((lessonsArr) => {
          this.lessonCount = lessonsArr.reduce((acc, lessons) => acc + (Array.isArray(lessons) ? lessons.length : 0), 0);
        });
      },
      error: () => {
        this.moduleCount = 0;
        this.lessonCount = 0;
      }
    });
  }

  fetchReviews(courseId: string) {
    this.reviewsLoading = true;
    this.courseService.getCourseReviews(courseId).subscribe({
      next: (reviews: Review[]) => {
        this.reviews = reviews;
        this.reviewsLoading = false;
        this.calculateAverageRating();
      },
      error: (err: any) => {
        this.reviewsError = 'Failed to load reviews';
        this.reviewsLoading = false;
        this.averageRating = 0;
      }
    });
  }

  calculateAverageRating() {
    if (!this.reviews || this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
  }

  enroll() {
    if (!this.course || !this.isLoggedIn || !this.currentUser) {
      alert('You must be logged in to enroll.');
      return;
    }
    this.studentService.enrollInCourse(this.course.id).subscribe({
      next: () => {
        alert('Successfully enrolled in course: ' + this.course!.title);
        // Optionally, refresh enrollments or update UI here
      },
      error: (err) => {
        alert('Failed to enroll: ' + (err?.error?.message || 'Unknown error'));
      }
    });
  }

  submitReview() {
    if (!this.course || !this.isLoggedIn || !this.currentUser) {
      this.reviewSubmitError = 'You must be logged in to submit a review.';
      return;
    }
    this.reviewSubmitting = true;
    this.reviewSubmitError = '';
    this.courseService.postReview({
      rating: this.reviewRating,
      comment: this.reviewComment,
      userId: this.currentUser.id,
      courseId: this.course.id
    }).subscribe({
      next: () => {
        this.reviewSubmitting = false;
        this.reviewRating = 5;
        this.reviewComment = '';
        this.fetchReviews(this.course!.id);
        this.instructorService.dashboardRefresh$.next();
      },
      error: (err) => {
        this.reviewSubmitting = false;
        this.reviewSubmitError = 'Failed to submit review.';
      }
    });
  }
} 