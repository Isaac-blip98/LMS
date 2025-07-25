import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  course?: {
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

  getMyQuizAttempts(userId: string): Observable<QuizAttempt[]> {
    return this.http.get<QuizAttempt[]>(`${this.baseUrl}/quizzes/attempts/user/${userId}`);
  }

  getQuizzesForCourse(courseId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/quizzes/course/${courseId}`);
  }

  createQuizAttempt(attempt: { userId: string; quizId: string; answers: any[] }): Observable<any> {
    return this.http.post(`${this.baseUrl}/quizzes/attempts`, attempt);
  }

  getMyCertificates(userId: string): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.baseUrl}/enrollments/certificates/${userId}`);
  }

  getLearningPath(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/analytics/student/${userId}/learning-path`);
  }

  getUserAnalytics(userId: string): Observable<StudentAnalytics> {
    return this.http.get<StudentAnalytics>(`${this.baseUrl}/progress/user/${userId}/analytics`);
  }

  calculateDashboardStats(enrollments: Enrollment[], analytics: StudentAnalytics, quizAttempts?: QuizAttempt[]): StudentDashboardStats {
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.progress >= 100).length;
    // Check if all lessons are completed
    const allLessons = enrollments.reduce((sum, e) => sum + e.totalLessons, 0);
    const allCompleted = enrollments.reduce((sum, e) => sum + e.completedLessons, 0);
    let totalProgress = 0;
    if (allLessons > 0 && allCompleted === allLessons) {
      totalProgress = 100;
    } else if (quizAttempts && quizAttempts.length > 0) {
      // Use highest score per quiz
      const highestScores: { [quizId: string]: number } = {};
      quizAttempts.forEach(attempt => {
        if (!highestScores[attempt.quizId] || attempt.score > highestScores[attempt.quizId]) {
          highestScores[attempt.quizId] = attempt.score;
        }
      });
      const scores = Object.values(highestScores);
      totalProgress = scores.length > 0
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;
    } else {
      // Fallback to lesson progress
      totalProgress = totalCourses > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses)
        : 0;
    }
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

  enrollInCourse(courseId: string) {
    return this.http.post(`${this.baseUrl}/enrollments/enroll`, { courseId });
  }

  // Progress tracking methods
  markLessonComplete(enrollmentId: string, lessonId: string) {
    return this.http.post(`${this.baseUrl}/progress/mark-complete`, {
      enrollmentId,
      lessonId
    });
  }

  markLessonIncomplete(enrollmentId: string, lessonId: string) {
    return this.http.post(`${this.baseUrl}/progress/mark-incomplete`, {
      enrollmentId,
      lessonId
    });
  }

  getEnrollmentByCourse(courseId: string): Observable<Enrollment | null> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}/enrollments/my-enrollments`).pipe(
      map(enrollments => enrollments.find(e => e.courseId === courseId) || null)
    );
  }

  getCourseProgress(enrollmentId: string) {
    return this.http.get(`${this.baseUrl}/progress/enrollment/${enrollmentId}`);
  }

  getCompletedLessonIds(enrollmentId: string) {
    return this.http.get<string[]>(`${this.baseUrl}/progress/enrollment/${enrollmentId}/completed-lessons`);
  }

  getCourseCompleteEligibility(enrollmentId: string) {
    return this.http.get<any>(`${this.baseUrl}/progress/enrollment/${enrollmentId}/complete-eligibility`);
  }

  completeCourse(enrollmentId: string) {
    return this.http.post<any>(`${this.baseUrl}/progress/enrollment/${enrollmentId}/complete`, {});
  }
} 