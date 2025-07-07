import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../Services/student.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-student-lesson-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lesson-view.component.html',
  styleUrls: ['./lesson-view.component.css']
})
export class StudentLessonViewComponent implements OnInit {
  lesson: any = null;
  loading = true;
  error: string | null = null;
  safeContentUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private studentService: StudentService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const lessonId = this.route.snapshot.paramMap.get('lessonId');
    if (lessonId) {
      this.fetchLesson(lessonId);
    } else {
      this.error = 'Invalid lesson ID';
      this.loading = false;
    }
  }

  fetchLesson(lessonId: string) {
    this.studentService.getLessonById(lessonId).subscribe({
      next: (lesson: any) => {
        this.lesson = lesson;
        this.loading = false;
        if (lesson.type === 'VIDEO' || lesson.type === 'PDF') {
          this.safeContentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(lesson.contentUrl);
        }
      },
      error: (err: any) => {
        this.error = 'Failed to load lesson content';
        this.loading = false;
      }
    });
  }
} 