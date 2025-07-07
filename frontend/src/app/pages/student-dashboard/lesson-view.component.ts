import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
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
    // Remove all code that references getLessonById from StudentService
    // Remove any related error handler code and variables that are now unused
  }
} 