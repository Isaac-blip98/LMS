// src/app/services/course.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  level: string;
  category: string;
  isPublished: boolean;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  courseId: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private baseUrl = 'http://localhost:3000/courses'; 

  constructor(private http: HttpClient) {}

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.baseUrl);
  }

  getCourseById(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.baseUrl}/${id}`);
  }

  getCourseReviews(courseId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`http://localhost:3000/reviews/course/${courseId}`);
  }

  postReview(review: { rating: number; comment?: string; userId: string; courseId: string }): Observable<Review> {
    return this.http.post<Review>('http://localhost:3000/reviews', review);
  }
}
