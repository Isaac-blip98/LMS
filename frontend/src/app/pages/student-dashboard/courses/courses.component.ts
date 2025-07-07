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

  // Add state for expanded courses and modules
  expandedCourses: { [courseId: string]: boolean } = {};
  expandedModules: { [moduleId: string]: boolean } = {};
  courseModules: { [courseId: string]: any[] } = {};
  moduleLessons: { [moduleId: string]: any[] } = {};

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

  toggleCourse(courseId: string) {
    this.expandedCourses[courseId] = !this.expandedCourses[courseId];
    if (this.expandedCourses[courseId] && !this.courseModules[courseId]) {
      this.studentService.getCourseModules(courseId).subscribe({
        next: (modules) => {
          this.courseModules[courseId] = modules;
        },
        error: (err) => {
          console.error('Error loading modules:', err);
        }
      });
    }
  }

  toggleModule(moduleId: string, courseId: string) {
    this.expandedModules[moduleId] = !this.expandedModules[moduleId];
    if (this.expandedModules[moduleId] && !this.moduleLessons[moduleId]) {
      this.studentService.getModuleLessons(moduleId).subscribe({
        next: (lessons) => {
          this.moduleLessons[moduleId] = lessons;
        },
        error: (err) => {
          console.error('Error loading lessons:', err);
        }
      });
    }
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

  // Placeholder for lesson click navigation
  onLessonClick(lesson: any) {
    this.router.navigate(['/student/lesson', lesson.id]);
  }

  expandAllCourseContent(courseId: string) {
    this.expandedCourses[courseId] = true;
    if (!this.courseModules[courseId]) {
      this.studentService.getCourseModules(courseId).subscribe({
        next: (modules) => {
          this.courseModules[courseId] = modules;
          // Expand all modules and load lessons
          modules.forEach((module: any) => {
            this.expandedModules[module.id] = true;
            if (!this.moduleLessons[module.id]) {
              this.studentService.getModuleLessons(module.id).subscribe({
                next: (lessons) => {
                  this.moduleLessons[module.id] = lessons;
                },
                error: (err) => {
                  console.error('Error loading lessons:', err);
                }
              });
            }
          });
        },
        error: (err) => {
          console.error('Error loading modules:', err);
        }
      });
    } else {
      // Expand all modules and load lessons if already fetched
      this.courseModules[courseId].forEach((module: any) => {
        this.expandedModules[module.id] = true;
        if (!this.moduleLessons[module.id]) {
          this.studentService.getModuleLessons(module.id).subscribe({
            next: (lessons) => {
              this.moduleLessons[module.id] = lessons;
            },
            error: (err) => {
              console.error('Error loading lessons:', err);
            }
          });
        }
      });
    }
  }
} 