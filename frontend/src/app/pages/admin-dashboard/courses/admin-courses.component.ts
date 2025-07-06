import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../Services/admin.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-courses.component.html',
  styleUrls: ['./admin-courses.component.css']
})
export class AdminCoursesComponent implements OnInit {
  courses: any[] = [];
  loading = false;
  error: string | null = null;

  editingCourse: any = null;
  showCreateCourse = false;
  newCourse = {
    title: '',
    description: '',
    objectives: '',
    prerequisites: '',
    level: '',
    category: '',
    isPublished: false
  };
  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  uploadInProgress = false;
  assigningCourse: any = null;
  assignInstructorId = '';
  instructors: any[] = [];

  constructor(private adminService: AdminService, private http: HttpClient) {}

  ngOnInit() {
    this.fetchCourses();
  }

  fetchCourses() {
    this.loading = true;
    this.adminService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load courses.';
        this.loading = false;
      }
    });
  }

  openEditCourse(course: any) {
    this.editingCourse = { ...course };
    this.clearImage();
  }

  async saveCourseEdit() {
    if (!this.editingCourse) return;
    
    try {
      this.uploadInProgress = true;
      
      // Upload image first if selected
      let imageUrl = null;
      if (this.selectedImageFile) {
        imageUrl = await this.uploadImage();
        if (!imageUrl) {
          this.error = 'Failed to upload image.';
          this.uploadInProgress = false;
          return;
        }
      }

      const updateData: any = {
        title: this.editingCourse.title,
        category: this.editingCourse.category,
        level: this.editingCourse.level,
        isPublished: this.editingCourse.isPublished
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      this.adminService.updateCourse(this.editingCourse.id, updateData).subscribe({
        next: () => {
          this.editingCourse = null;
          this.clearImage();
          this.fetchCourses();
        },
        error: () => {
          this.error = 'Failed to update course.';
        }
      });
    } catch (error) {
      this.error = 'Failed to update course.';
    } finally {
      this.uploadInProgress = false;
    }
  }

  cancelEditCourse() {
    this.editingCourse = null;
  }

  confirmDeleteCourse(course: any) {
    if (confirm(`Are you sure you want to delete course ${course.title}?`)) {
      this.adminService.deleteCourse(course.id).subscribe({
        next: () => this.fetchCourses(),
        error: () => { this.error = 'Failed to delete course.'; }
      });
    }
  }

  openCreateCourse() {
    this.showCreateCourse = true;
    this.newCourse = {
      title: '',
      description: '',
      objectives: '',
      prerequisites: '',
      level: '',
      category: '',
      isPublished: false
    };
    this.clearImage();
  }

  async createCourse() {
    try {
      this.uploadInProgress = true;
      
      // Upload image first if selected
      let imageUrl = null;
      if (this.selectedImageFile) {
        imageUrl = await this.uploadImage();
        if (!imageUrl) {
          this.error = 'Failed to upload image.';
          this.uploadInProgress = false;
          return;
        }
      }

      const payload = {
        ...this.newCourse,
        objectives: this.newCourse.objectives.split(',').map((s: string) => s.trim()),
        prerequisites: this.newCourse.prerequisites.split(',').map((s: string) => s.trim()),
        imageUrl: imageUrl
      };

      this.adminService.createCourse(payload).subscribe({
        next: () => {
          this.showCreateCourse = false;
          this.clearImage();
          this.fetchCourses();
        },
        error: () => {
          this.error = 'Failed to create course.';
        }
      });
    } catch (error) {
      this.error = 'Failed to create course.';
    } finally {
      this.uploadInProgress = false;
    }
  }

  cancelCreateCourse() {
    this.showCreateCourse = false;
  }

  openAssignInstructor(course: any) {
    this.assigningCourse = course;
    this.assignInstructorId = '';
    this.adminService.getAllInstructors().subscribe({
      next: (data) => { 
        console.log('Instructors loaded:', data);
        this.instructors = data; 
      },
      error: (error) => { 
        console.error('Error loading instructors:', error);
        this.error = 'Failed to load instructors.'; 
      }
    });
  }

  assignInstructor() {
    if (!this.assigningCourse || !this.assignInstructorId) return;
    this.adminService.assignInstructorToCourse(this.assigningCourse.id, this.assignInstructorId).subscribe({
      next: () => {
        this.assigningCourse = null;
        this.fetchCourses();
      },
      error: () => {
        this.error = 'Failed to assign instructor.';
      }
    });
  }

  cancelAssignInstructor() {
    this.assigningCourse = null;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage() {
    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
  }

  async uploadImage(): Promise<string | null> {
    if (!this.selectedImageFile) return null;

    const formData = new FormData();
    formData.append('file', this.selectedImageFile);
    formData.append('folder', 'courses');

    try {
      this.uploadInProgress = true;
      const response: any = await this.http.post('http://localhost:3000/cloudinary/upload', formData).toPromise();
      return response.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      this.error = 'Failed to upload image.';
      return null;
    } finally {
      this.uploadInProgress = false;
    }
  }
} 