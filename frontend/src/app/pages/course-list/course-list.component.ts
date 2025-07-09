import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Course } from '../../Services/course.service';
import { RouterModule, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { StudentService } from '../../Services/student.service';
import { AuthService } from '../../Services/auth.service';
import { ModalService } from '../../shared/modal/modal.service';

@Component({
  standalone: true,
  selector: 'app-course-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './course-list.component.html',
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  loading = true;
  searchQuery = '';
  errorMessage = '';
  enrolledCourseIds = new Set<string>();
  isLoggedIn = false;
  currentUser: any = null;

  constructor(
    private courseService: CourseService,
    private route: ActivatedRoute,
    private studentService: StudentService,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    if (this.isLoggedIn && this.currentUser) {
      this.studentService.getMyEnrollments().subscribe({
        next: (enrollments) => {
          this.enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
          this.route.queryParams.subscribe(params => {
            this.searchQuery = params['search'] || '';
            this.fetchCourses();
          });
        },
        error: () => {
          this.route.queryParams.subscribe(params => {
            this.searchQuery = params['search'] || '';
            this.fetchCourses();
          });
        }
      });
    } else {
      this.route.queryParams.subscribe(params => {
        this.searchQuery = params['search'] || '';
        this.fetchCourses();
      });
    }
  }

  fetchCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.filterCourses();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load courses';
        console.error('Error loading courses:', err);
      },
    });
  }

  searchCourses(): void {
    this.filterCourses();
  }

  private filterCourses(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredCourses = query
      ? this.courses.filter(course => course.title.toLowerCase().includes(query))
      : [...this.courses];
  }

  isCourseEnrolled(courseId: string): boolean {
    return this.enrolledCourseIds.has(courseId);
  }

  goToCourseDetails(courseId: string) {
    this.router.navigate(['/courses', courseId]);
  }

  enroll(course: Course) {
    if (!this.authService.isAuthenticated()) {
      this.modalService.openLogin();
      return;
    }
    // Implement enrollment logic here
    alert('Enroll logic not implemented yet for course: ' + course.title);
  }
}
