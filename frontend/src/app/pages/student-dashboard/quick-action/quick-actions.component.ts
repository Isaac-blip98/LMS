import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-actions.component.html',
})
export class QuickActionsComponent {
  constructor(private router: Router) {}

  goToBrowseCourses() {
    this.router.navigate(['/courses']);
  }

  goToMyCourses() {
    this.router.navigate(['/student/courses']);
  }

  goToQuizzes() {
    this.router.navigate(['/student/quizzes']);
  }

  goToCertificates() {
    this.router.navigate(['/student/certificates']);
  }
}
