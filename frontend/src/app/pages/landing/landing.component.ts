import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CourseService, Course } from '../../Services/course.service';
import { ModalService } from '../../shared/modal/modal.service';
import { RegisterModalComponent } from '../../shared/auth/register/register-modal.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, RegisterModalComponent],
  templateUrl: './landing.component.html',
})
export class LandingComponent implements OnInit {
  topCourses: Course[] = [];

  constructor(
    private courseService: CourseService,
    private modalService: ModalService
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
}
