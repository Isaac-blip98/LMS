import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CourseService, Course } from '../../Services/course.service';
import { ModalService } from '../../shared/modal/modal.service';
import { RegisterModalComponent } from '../../shared/auth/register/register-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, RegisterModalComponent, FormsModule],
  templateUrl: './landing.component.html',
})
export class LandingComponent implements OnInit {
  topCourses: Course[] = [];
  searchTerm: string = '';

  constructor(
    private courseService: CourseService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.courseService.getAllCourses().subscribe({
      next: (courses: Course[]) => {
        this.topCourses = courses.slice(0, 4); 
      },
      error: (err: unknown) => {
        console.error('Error loading courses', err);
      },
    });
  }

  openRegisterModal() {
    this.modalService.openRegister();
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/courses'], { queryParams: { search: this.searchTerm } });
    }
  }
}
