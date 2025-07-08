import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { StudentService, Enrollment } from '../../../../Services/student.service';

interface Lesson {
  id: string;
  title: string;
  type: string;
  contentUrl: string;
  order: number;
  moduleId: string;
  isVisible: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

@Component({
  selector: 'app-course-learn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-learn.component.html',
})
export class CourseLearnComponent implements OnInit {
  courseId: string | null = null;
  courseTitle: string | null = null;
  modules: Module[] = [];
  isLoading = true;
  error: string | null = null;

  selectedLessons: { [lessonId: string]: Lesson } = {};
  viewedContents: { [lessonId: string]: boolean } = {};
  pdfErrors: { [lessonId: string]: boolean } = {};
  completedLessons: Set<string> = new Set();
  enrollment: Enrollment | null = null;

  // --- Add state for course completion eligibility ---
  completeEligibility: any = null;
  completeLoading = false;
  completeError: string | null = null;
  completeSuccess: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private studentService: StudentService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('courseId');
    if (this.courseId) {
      this.fetchCourseTitle(this.courseId);
      this.loadEnrollment(this.courseId);
      this.loadCourseModules(this.courseId);
    }
  }

  fetchCourseTitle(courseId: string) {
    this.http.get<any>(`http://localhost:3000/courses/${courseId}`).subscribe({
      next: (course) => {
        this.courseTitle = course.title;
        this.ngZone.run(() => this.cdr.detectChanges());
      },
      error: () => {
        this.courseTitle = null;
        this.ngZone.run(() => this.cdr.detectChanges());
      },
    });
  }

  loadEnrollment(courseId: string) {
    this.studentService.getEnrollmentByCourse(courseId).subscribe({
      next: (enrollment) => {
        this.enrollment = enrollment;
        if (enrollment) {
          this.loadCompletedLessons(enrollment.id);
          this.fetchCompleteEligibility(enrollment.id);
        }
        this.ngZone.run(() => this.cdr.detectChanges());
      },
      error: (err) => {
        console.error('Error loading enrollment:', err);
        this.ngZone.run(() => this.cdr.detectChanges());
      }
    });
  }

  fetchCompleteEligibility(enrollmentId: string) {
    this.studentService.getCourseCompleteEligibility(enrollmentId).subscribe({
      next: (eligibility) => {
        this.completeEligibility = eligibility;
        this.ngZone.run(() => this.cdr.detectChanges());
      },
      error: (err) => {
        this.completeEligibility = null;
        this.ngZone.run(() => this.cdr.detectChanges());
      }
    });
  }

  completeCourse() {
    if (!this.enrollment) return;
    this.completeLoading = true;
    this.completeError = null;
    this.completeSuccess = null;
    this.studentService.completeCourse(this.enrollment.id).subscribe({
      next: (res) => {
        this.completeLoading = false;
        this.completeSuccess = 'Course marked as completed!';
        this.fetchCompleteEligibility(this.enrollment!.id);
        this.ngZone.run(() => this.cdr.detectChanges());
      },
      error: (err) => {
        this.completeLoading = false;
        this.completeError = err?.error?.message || 'Failed to complete course.';
        this.ngZone.run(() => this.cdr.detectChanges());
      }
    });
  }

  loadCompletedLessons(enrollmentId: string) {
    // First try to load from localStorage for immediate display
    const cachedProgress = this.getCachedProgress(enrollmentId);
    if (cachedProgress) {
      this.completedLessons = new Set(cachedProgress);
      this.ngZone.run(() => this.cdr.detectChanges());
    }

    // Then fetch from backend to ensure accuracy
    this.studentService.getCompletedLessonIds(enrollmentId).subscribe({
      next: (completedLessonIds: string[]) => {
        this.completedLessons = new Set(completedLessonIds);
        this.cacheProgress(enrollmentId, completedLessonIds);
        this.ngZone.run(() => this.cdr.detectChanges());
      },
      error: (err) => {
        console.error('Error loading completed lessons:', err);
        // If backend fails, we still have cached data
      }
    });
  }

  private getCachedProgress(enrollmentId: string): string[] | null {
    try {
      const cached = localStorage.getItem(`progress_${enrollmentId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading cached progress:', error);
      return null;
    }
  }

  private cacheProgress(enrollmentId: string, lessonIds: string[]) {
    try {
      localStorage.setItem(`progress_${enrollmentId}`, JSON.stringify(lessonIds));
    } catch (error) {
      console.error('Error caching progress:', error);
    }
  }

  loadCourseModules(courseId: string) {
    this.http
      .get<Module[]>(`http://localhost:3000/modules/course/${courseId}`)
      .subscribe({
        next: (modules) => {
          this.modules = modules;
          this.isLoading = false;
          this.ngZone.run(() => this.cdr.detectChanges());
          this.loadAllLessonContents(modules);
        },
        error: (err) => {
          console.error('Error loading modules:', err);
          this.error = 'Failed to load course content.';
          this.isLoading = false;
          this.ngZone.run(() => this.cdr.detectChanges());
        },
      });
  }

  loadAllLessonContents(modules: Module[]) {
    modules.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        this.http
          .get<Lesson>(`http://localhost:3000/lessons/${lesson.id}`)
          .subscribe({
            next: (lessonContent) => {
              this.selectedLessons[lesson.id] = lessonContent;
              this.ngZone.run(() => this.cdr.detectChanges());
            },
            error: () => {
              console.error(`Failed to load lesson ${lesson.id}`);
            },
          });
      });
    });
  }

  sanitizeVideoUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    let safeUrl = url;
    if (url.includes('watch?v=')) {
      safeUrl = url.replace('watch?v=', 'embed/');
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(safeUrl);
  }

  sanitizePdfUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getPdfViewerUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    
    // For Cloudinary image URLs (which is how PDFs were uploaded before the fix),
    // use Google Docs viewer directly since the raw transformation doesn't work
    if (url.includes('cloudinary.com') && url.includes('/image/')) {
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(googleDocsUrl);
    }
    
    // For raw URLs or non-Cloudinary URLs, use directly
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getPdfFallbackUrl(url: string | undefined): SafeResourceUrl {
    if (!url) return '';
    // Use Google Docs viewer as a fallback
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(googleDocsUrl);
  }

  onPdfError(lessonId: string) {
    this.pdfErrors[lessonId] = true;
    this.ngZone.run(() => this.cdr.detectChanges());
  }

  markContentViewed(lessonId: string, type: string) {
    this.viewedContents[lessonId] = true;
    this.ngZone.run(() => this.cdr.detectChanges());
  }

  isLessonCompletable(lesson: Lesson): boolean {
    return lesson && this.viewedContents[lesson.id] === true;
  }

  isLessonCompleted(lessonId: string): boolean {
    return this.completedLessons.has(lessonId);
  }

  markLessonAsComplete(lessonId: string) {
    if (!this.enrollment) {
      console.error('No enrollment found for this course');
      return;
    }

    this.studentService.markLessonComplete(this.enrollment.id, lessonId).subscribe({
      next: () => {
        this.completedLessons.add(lessonId);
        // Update cache immediately
        this.cacheProgress(this.enrollment!.id, Array.from(this.completedLessons));
        this.ngZone.run(() => this.cdr.detectChanges());
        console.log(`Lesson ${lessonId} marked as complete!`);
      },
      error: (err) => {
        console.error('Error marking lesson complete:', err);
        alert('Failed to mark lesson as complete. Please try again.');
      }
    });
  }

  getCourseProgress(): number {
    if (!this.modules.length) return 0;
    
    const totalLessons = this.modules.reduce((sum, module) => 
      sum + module.lessons.length, 0);
    const completedCount = this.completedLessons.size;
    
    return totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  }
}
