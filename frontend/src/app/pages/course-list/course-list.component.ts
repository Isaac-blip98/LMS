import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Course } from '../../Services/course.service';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

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

  constructor(private courseService: CourseService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.fetchCourses();
    });
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

}
