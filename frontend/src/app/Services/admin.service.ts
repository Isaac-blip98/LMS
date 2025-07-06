import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000'; // Adjust as needed

  constructor(private http: HttpClient) {}

  // --- Users ---
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }
  getUserById(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }
  updateUser(userId: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${userId}`, data);
  }
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }
  createInstructor(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, data);
  }
  getAllInstructors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users?role=INSTRUCTOR`);
  }

  // --- Courses ---
  getAllCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/courses`);
  }
  createCourse(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/courses`, data);
  }
  updateCourse(courseId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/content/courses/${courseId}`, data);
  }
  deleteCourse(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/content/courses/${courseId}`);
  }
  assignInstructorToCourse(courseId: string, instructorId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/courses/${courseId}/assign-instructor`, { instructorId });
  }
  getCourseById(courseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/content/courses/${courseId}`);
  }

  // --- Analytics ---
  getPopularCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/popular-courses`);
  }
  getCourseCompletionRate(courseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/course/${courseId}/completion-rate`);
  }
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/dashboard/stats`);
  }
  getCourseEngagement(courseId: string, period: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/course/${courseId}/engagement?period=${period}`);
  }
  getModuleProgress(courseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/course/${courseId}/module-progress`);
  }
  getTimeSpent(userId: string, courseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/time-spent/${userId}?courseId=${courseId}`);
  }
  getCertificateStats(instructorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/certificate-stats?instructorId=${instructorId}`);
  }
  getInstructorStats(instructorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/instructor/${instructorId}`);
  }

  // --- Enrollments ---
  getAllEnrollments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/enrollments/all-enrollments`);
  }
  getEnrollmentsByCourse(courseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/enrollments/course/${courseId}`);
  }
  getCertificatesForUser(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/enrollments/certificates/${userId}`);
  }
  issueCertificate(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enrollments/certificates`, data);
  }

  // --- Reviews ---
  getAllReviews(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews`);
  }
  getReviewById(reviewId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/${reviewId}`);
  }
  updateReview(reviewId: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reviews/${reviewId}`, data);
  }
  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`);
  }
} 