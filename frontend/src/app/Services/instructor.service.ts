import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
}

export interface CourseAnalytics {
  courseId: string;
  courseTitle: string;
  totalEnrollments: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
}

export interface ModuleProgress {
  moduleId: string;
  moduleTitle: string;
  totalLessons: number;
  completedLessons: number;
  completionRate: number;
}

export interface StudentProgress {
  userId: string;
  studentName: string;
  email: string;
  progress: number;
  lastActivity: string;
  completedLessons: number;
  totalLessons: number;
}

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  recentEnrollments: number;
  certificatesIssued: number;
}

export interface CourseEngagement {
  date: string;
  activeStudents: number;
  lessonsCompleted: number;
  timeSpent: number;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  certificateUrl: string;
  issuedAt: string;
  courseTitle?: string;
  studentName?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface CertificateStats {
  totalIssued: number;
  thisMonth: number;
  thisYear: number;
  byCourse?: Array<{
    courseId: string;
    courseTitle: string;
    certificatesIssued: number;
  }>;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  progress: number;
  studentName?: string;
  courseTitle?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  timeSpent: number;
  quizTitle?: string;
  studentName?: string;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  enrollmentId: string;
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  completedModules: number;
  totalModules: number;
  lastActivity: string;
  timeSpent: number;
  courseTitle?: string;
  studentName?: string;
}

export interface ModuleProgressDetails {
  moduleId: string;
  moduleTitle: string;
  enrollmentId: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lessons: Array<{
    lessonId: string;
    lessonTitle: string;
    isCompleted: boolean;
    completedAt?: string;
  }>;
}

export interface LessonCompletionStats {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  totalEnrollments: number;
  completedCount: number;
  completionRate: number;
  averageTimeToComplete: number;
}

export interface StudentProgressAnalytics {
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

@Injectable({ providedIn: 'root' })
export class InstructorService {
  private baseUrl = 'http://localhost:3000';

  // Event bus for dashboard refresh
  public dashboardRefresh$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  // Analytics endpoints
  getInstructorStats(instructorId: string): Observable<InstructorStats[]> {
    return this.http.get<InstructorStats[]>(`${this.baseUrl}/analytics/instructor/${instructorId}`);
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/analytics/dashboard/stats`);
  }

  getCourseCompletionRate(courseId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/analytics/course/${courseId}/completion-rate`);
  }

  getCourseEngagement(courseId: string, period: string = 'month'): Observable<CourseEngagement[]> {
    return this.http.get<CourseEngagement[]>(`${this.baseUrl}/analytics/course/${courseId}/engagement?period=${period}`);
  }

  getModuleProgress(courseId: string): Observable<ModuleProgress[]> {
    return this.http.get<ModuleProgress[]>(`${this.baseUrl}/analytics/course/${courseId}/module-progress`);
  }

  getCertificateStats(instructorId?: string): Observable<CertificateStats> {
    const url = instructorId 
      ? `${this.baseUrl}/analytics/certificate-stats?instructorId=${instructorId}`
      : `${this.baseUrl}/analytics/certificate-stats`;
    return this.http.get<CertificateStats>(url);
  }

  // Course management
  getInstructorCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/courses`);
  }

  createCourse(courseData: any): Observable<any> {
    if (courseData instanceof FormData) {
      return this.http.post(`${this.baseUrl}/courses`, courseData);
    } else {
      return this.http.post(`${this.baseUrl}/courses`, courseData, {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  updateCourse(courseId: string, courseData: any): Observable<any> {
    if (courseData instanceof FormData) {
      return this.http.patch(`${this.baseUrl}/courses/${courseId}`, courseData);
    } else {
      return this.http.patch(`${this.baseUrl}/courses/${courseId}`, courseData, {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  deleteCourse(courseId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/courses/${courseId}`);
  }

  // Module management
  getCourseModules(courseId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/content/courses/${courseId}/modules`);
  }

  createModule(moduleData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/modules`, moduleData);
  }

  updateModule(moduleId: string, moduleData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/content/modules/${moduleId}`, moduleData);
  }

  deleteModule(moduleId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/content/modules/${moduleId}`);
  }

  // Lesson management
  getModuleLessons(moduleId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/content/modules/${moduleId}/lessons`);
  }

  createLesson(lessonData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/lessons`, lessonData);
  }

  updateLesson(lessonId: string, lessonData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/content/lessons/${lessonId}`, lessonData);
  }

  deleteLesson(lessonId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/content/lessons/${lessonId}`);
  }

  // Enrollment management
  getCourseEnrollments(courseId: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}/enrollments/course/${courseId}/enrollments`);
  }

  // Quiz management
  getCourseQuizzes(courseId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/quizzes/course/${courseId}`);
  }

  createQuiz(quizData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/quizzes`, quizData);
  }

  updateQuiz(quizId: string, quizData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/quizzes/${quizId}`, quizData);
  }

  deleteQuiz(quizId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/quizzes/${quizId}`);
  }

  createQuestion(questionData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/quizzes/questions`, questionData);
  }

  updateQuestion(questionId: string, questionData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/quizzes/questions/${questionId}`, questionData);
  }

  deleteQuestion(questionId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/quizzes/questions/${questionId}`);
  }

  getQuizAttempts(userId: string): Observable<QuizAttempt[]> {
    return this.http.get<QuizAttempt[]>(`${this.baseUrl}/quizzes/attempts/user/${userId}`);
  }

  // Certificate management
  issueCertificate(certificateData: { userId: string; courseId: string; certificateUrl: string }): Observable<Certificate> {
    return this.http.post<Certificate>(`${this.baseUrl}/enrollments/certificates`, certificateData);
  }

  getStudentCertificates(userId: string): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${this.baseUrl}/enrollments/certificates/${userId}`);
  }

  // Progress tracking
  getUserCourseProgress(userId: string): Observable<UserProgress[]> {
    return this.http.get<UserProgress[]>(`${this.baseUrl}/progress/user/${userId}/courses`);
  }

  getModuleProgressDetails(moduleId: string, enrollmentId: string): Observable<ModuleProgressDetails> {
    return this.http.get<ModuleProgressDetails>(`${this.baseUrl}/progress/module/${moduleId}/progress?enrollmentId=${enrollmentId}`);
  }

  getLessonCompletionStats(lessonId: string, courseId: string): Observable<LessonCompletionStats> {
    return this.http.get<LessonCompletionStats>(`${this.baseUrl}/progress/lesson/${lessonId}/completions?courseId=${courseId}`);
  }

  getStudentProgressAnalytics(userId: string, period: string = 'month'): Observable<StudentProgressAnalytics> {
    return this.http.get<StudentProgressAnalytics>(`${this.baseUrl}/progress/analytics/student/${userId}?period=${period}`);
  }

  getTimeSpentAnalytics(userId: string, courseId?: string): Observable<any> {
    const url = courseId 
      ? `${this.baseUrl}/analytics/time-spent/${userId}?courseId=${courseId}`
      : `${this.baseUrl}/analytics/time-spent/${userId}`;
    return this.http.get(url);
  }

  getLearningPathData(courseId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/analytics/course/${courseId}/learning-path`);
  }

  uploadLessonFile(file: File, lessonId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lessonId', lessonId);
    return this.http.post<any>(`${this.baseUrl}/lessons/upload`, formData);
  }

  uploadCertificateFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/content/upload-certificate`, formData);
  }
} 