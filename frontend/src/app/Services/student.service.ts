import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentDashboardStats {
  enrolledCourses: number;
  completedCourses: number;
  totalProgress: number;
  averageGrade: number;
}

export interface StudentLearningSummary {
  status: string;
  level: string;
  focusArea: string;
  learningStreak: number;
}

export interface StudentQuickStats {
  totalLessons: number;
  completedLessons: number;
  averageProgress: number;
  studyHours: number;
}

export interface StudentProgress {
  courseId: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
}

export interface StudentAnalytics {
  userId: string;
  period: string;
  totalCourses: number;
  completedCourses: number;
  averageProgress: number;
  totalTimeSpent: number;
  lessonsCompleted: number;
  quizzesTaken: number;
  averageQuizScore: number;
  activityTrend: Array<{
    date: string;
    lessonsCompleted: number;
    timeSpent: number;
  }>;
}

export interface Enrollment {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  course: {
    id: string;
    title: string;
    description: string;
    instructor: {
      name: string;
    };
  };
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  timeSpent: number;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  certificateUrl: string;
  instructorName: string;
  grade: number;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getDashboardStats(userId: string): Observable<StudentDashboardStats> {
    return this.http.get<StudentDashboardStats>(`${this.baseUrl}/analytics/student/${userId}/dashboard-stats`);
  }

  getStudentProgress(userId: string): Observable<StudentProgress[]> {
    return this.http.get<StudentProgress[]>(`${this.baseUrl}/analytics/student/${userId}`);
  }

  getStudentAnalytics(userId: string, period: string = 'month'): Observable<StudentAnalytics> {
    return this.http.get<StudentAnalytics>(`${this.baseUrl}/progress/analytics/student/${userId}?period=${period}`);
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}/enrollments/my-enrollments`);
  }

  getMyQuizAttempts(): Observable<QuizAttempt[]> {
    return this.http.get<QuizAttempt[]>(`${this.baseUrl}/quizzes/my-attempts`);
  }

  getMyCertificates(): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.baseUrl}/certificates/my-certificates`);
  }

  getLearningPath(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/analytics/student/${userId}/learning-path`);
  }

  getUserAnalytics(userId: string): Observable<StudentAnalytics> {
    return this.http.get<StudentAnalytics>(`${this.baseUrl}/progress/user/${userId}/analytics`);
  }

  calculateDashboardStats(enrollments: Enrollment[], analytics: StudentAnalytics): StudentDashboardStats {
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress >= 100).length;
    const totalProgress = totalCourses > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses)
      : 0;
    const averageGrade = analytics?.averageQuizScore || 0;

    return {
      enrolledCourses: totalCourses,
      completedCourses,
      totalProgress,
      averageGrade
    };
  }

  calculateLearningSummary(analytics: StudentAnalytics): StudentLearningSummary {
    const totalProgress = analytics?.averageProgress || 0;
    let level = 'BEGINNER';
    if (totalProgress >= 80) level = 'ADVANCED';
    else if (totalProgress >= 50) level = 'INTERMEDIATE';

    const focusArea = 'PROGRAMMING'; 
    const learningStreak = analytics?.activityTrend?.length || 0;

    return {
      status: 'Active',
      level,
      focusArea,
      learningStreak
    };
  }

  calculateQuickStats(analytics: StudentAnalytics): StudentQuickStats {
    return {
      totalLessons: analytics?.lessonsCompleted || 0,
      completedLessons: analytics?.lessonsCompleted || 0,
      averageProgress: analytics?.averageProgress || 0,
      studyHours: Math.round((analytics?.totalTimeSpent || 0) / 60) 
    };
  }

  // Fetch modules for a course (for student access)
  getCourseModules(courseId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/content/courses/${courseId}/modules`);
  }

  // Fetch lessons for a module (for student access)
  getModuleLessons(moduleId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/content/modules/${moduleId}/lessons`);
  }

  // Fetch a lesson by its ID (for student access)
  getLessonById(lessonId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/lessons/${lessonId}`);
  }
} 