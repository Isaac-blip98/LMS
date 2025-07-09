/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarkCompleteDto } from './dto/mark-complete.dto';
// import { BulkMarkCompleteDto } from './dto/bulk-mark-complete.dto';
import { UserProgressDto } from './dto/user-progress.dto';
import { UserFromJwt } from '../auth/interfaces/auth.interface';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  private async validateEnrollmentOwnership(enrollmentId: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { user: true }
    });
    
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }
    
    if (enrollment.userId !== userId) {
      throw new ForbiddenException('You can only modify your own enrollments');
    }
    
    return enrollment;
  }

  async markLessonComplete(dto: MarkCompleteDto, userId?: string) {
    const { enrollmentId, lessonId } = dto;

    // Validate enrollment ownership if userId is provided
    if (userId) {
      await this.validateEnrollmentOwnership(enrollmentId, userId);
    } else {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      });
      if (!enrollment) throw new NotFoundException('Enrollment not found');
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    await this.prisma.progress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      update: {
        completed: true,
      },
      create: {
        enrollmentId,
        lessonId,
        completed: true,
      },
    });
  }

  async markLessonIncomplete(dto: MarkCompleteDto, userId?: string) {
    const { enrollmentId, lessonId } = dto;

    // Validate enrollment ownership if userId is provided
    if (userId) {
      await this.validateEnrollmentOwnership(enrollmentId, userId);
    } else {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      });
      if (!enrollment) throw new NotFoundException('Enrollment not found');
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    await this.prisma.progress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      update: {
        completed: false,
      },
      create: {
        enrollmentId,
        lessonId,
        completed: false,
      },
    });
  }

  async bulkMarkComplete(dtos: MarkCompleteDto[], userId?: string) {
    const results: Array<MarkCompleteDto & { success: boolean; error?: string }> = [];
    
    for (const dto of dtos) {
      try {
        if (userId) {
          await this.markLessonComplete(dto, userId);
        } else {
          await this.markLessonComplete(dto);
        }
        results.push({ ...dto, success: true });
      } catch (error) {
        results.push({ ...dto, success: false, error: error.message });
      }
    }
    
    return results;
  }

  async getUserCourseProgress(enrollmentId: string, userId?: string): Promise<UserProgressDto> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true },
            },
          },
        },
      },
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found');

    // Validate ownership if userId is provided
    if (userId && enrollment.userId !== userId) {
      throw new ForbiddenException('You can only view your own progress');
    }

    const allLessons = enrollment.course.modules.flatMap((mod) => mod.lessons);
    const totalLessons = allLessons.length;

    const completedCount = await this.prisma.progress.count({
      where: {
        enrollmentId,
        completed: true,
      },
    });

    return {
      courseId: enrollment.courseId,
      completedLessons: completedCount,
      totalLessons,
      progressPercentage: totalLessons
        ? Math.round((completedCount / totalLessons) * 100)
        : 0,
    };
  }

  async getCompletedLessonIds(enrollmentId: string, userId?: string): Promise<string[]> {
    // Validate enrollment ownership if userId is provided
    if (userId) {
      await this.validateEnrollmentOwnership(enrollmentId, userId);
    } else {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      });
      if (!enrollment) throw new NotFoundException('Enrollment not found');
    }

    const completedProgress = await this.prisma.progress.findMany({
      where: {
        enrollmentId,
        completed: true,
      },
      select: {
        lessonId: true,
      },
    });

    return completedProgress.map(p => p.lessonId);
  }

  async getUserAllCoursesProgress(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true },
            },
          },
        },
        progress: true,
      },
    });

    return enrollments.map((enrollment) => {
      const totalLessons = enrollment.course.modules.flatMap(
        (mod) => mod.lessons,
      ).length;
      const completedLessons = enrollment.progress.filter(
        (p) => p.completed,
      ).length;

      return {
        enrollmentId: enrollment.id,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        enrolledAt: enrollment.enrolledAt,
        completedLessons,
        totalLessons,
        progressPercentage: totalLessons
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
      };
    });
  }

  async getCourseProgressOverview(courseId: string, user?: UserFromJwt) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { lessons: true },
        },
        enrollments: {
          include: { progress: true },
        },
      },
    });

    if (!course) throw new NotFoundException('Course not found');

    // If user is an instructor, verify they own the course
    if (user?.role === 'INSTRUCTOR' && course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only view progress for your own courses');
    }

    const totalLessons = course.modules.flatMap((mod) => mod.lessons).length;
    const totalEnrollments = course.enrollments.length;

    const enrollmentStats = course.enrollments.map((enrollment) => {
      const completedLessons = enrollment.progress.filter((p) => p.completed).length;
      return {
        enrollmentId: enrollment.id,
        userId: enrollment.userId,
        completedLessons,
        totalLessons,
        progressPercentage: totalLessons
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
      };
    });

    const averageProgress = enrollmentStats.length > 0
      ? Math.round(
          enrollmentStats.reduce((sum, stat) => sum + stat.progressPercentage, 0) /
            enrollmentStats.length
        )
      : 0;

    return {
      courseId,
      courseTitle: course.title,
      totalLessons,
      totalEnrollments,
      averageProgress,
      enrollmentStats,
    };
  }

  async getModuleProgress(moduleId: string, enrollmentId?: string, userId?: string) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: true,
        course: {
          include: {
            enrollments: enrollmentId ? {
              where: { id: enrollmentId },
              include: { progress: true },
            } : {
              include: { progress: true },
            },
          },
        },
      },
    });

    if (!module) throw new NotFoundException('Module not found');

    // If userId is provided and enrollmentId is specified, validate ownership
    if (userId && enrollmentId) {
      const enrollment = module.course.enrollments.find(e => e.id === enrollmentId);
      if (!enrollment || enrollment.userId !== userId) {
        throw new ForbiddenException('You can only view your own progress');
      }
    }

    const totalLessons = module.lessons.length;
    const enrollments = module.course.enrollments;

    const moduleStats = enrollments.map((enrollment) => {
      const completedLessons = enrollment.progress.filter((p) => 
        p.completed && module.lessons.some(lesson => lesson.id === p.lessonId)
      ).length;

      return {
        enrollmentId: enrollment.id,
        userId: enrollment.userId,
        completedLessons,
        totalLessons,
        progressPercentage: totalLessons
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0,
      };
    });

    return {
      moduleId,
      moduleTitle: module.title,
      totalLessons,
      totalEnrollments: enrollments.length,
      moduleStats,
    };
  }

  async getLessonCompletions(lessonId: string, courseId?: string) {
    const whereClause: Record<string, unknown> = {
      lessonId,
      completed: true,
    };

    if (courseId) {
      whereClause.enrollment = { courseId };
    }

    const completions = await this.prisma.progress.count({
      where: whereClause,
    });

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                enrollments: courseId ? {
                  where: { courseId },
                } : {},
              },
            },
          },
        },
      },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');

    const totalEnrollments = lesson.module.course.enrollments.length;
    const completionRate = totalEnrollments > 0
      ? Math.round((completions / totalEnrollments) * 100)
      : 0;

    return {
      lessonId,
      lessonTitle: lesson.title,
      completions,
      totalEnrollments,
      completionRate,
    };
  }

  async getProgressHistory(enrollmentId: string, limit: number = 10, userId?: string) {
    // Validate enrollment ownership if userId is provided
    if (userId) {
      await this.validateEnrollmentOwnership(enrollmentId, userId);
    } else {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      });
      if (!enrollment) throw new NotFoundException('Enrollment not found');
    }

    const progress = await this.prisma.progress.findMany({
      where: { enrollmentId },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
      orderBy: {
        // Note: Progress doesn't have timestamp, so we'll order by lesson order
        lesson: {
          order: 'asc',
        },
      },
      take: limit,
    });

    return progress.map((p) => ({
      lessonId: p.lessonId,
      lessonTitle: p.lesson.title,
      moduleTitle: p.lesson.module.title,
      courseTitle: p.lesson.module.course.title,
      completed: p.completed,
    }));
  }

  async resetProgress(enrollmentId: string, userId?: string) {
    // Validate enrollment ownership if userId is provided
    if (userId) {
      await this.validateEnrollmentOwnership(enrollmentId, userId);
    } else {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      });
      if (!enrollment) throw new NotFoundException('Enrollment not found');
    }

    await this.prisma.progress.deleteMany({
      where: { enrollmentId },
    });

    return { message: 'Progress reset successfully' };
  }

  async removeLessonProgress(enrollmentId: string, lessonId: string, userId?: string) {
    // Validate enrollment ownership if userId is provided
    if (userId) {
      await this.validateEnrollmentOwnership(enrollmentId, userId);
    } else {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      });
      if (!enrollment) throw new NotFoundException('Enrollment not found');
    }

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    await this.prisma.progress.deleteMany({
      where: {
        enrollmentId,
        lessonId,
      },
    });

    return { message: 'Lesson progress removed successfully' };
  }

  async getStudentProgressAnalytics(userId: string, period: string = 'month') {
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get enrollments and progress in the period
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId,
        enrolledAt: { gte: startDate },
      },
      include: {
        course: true,
        progress: true,
      },
    });

    const totalCourses = enrollments.length;
    const lessonsCompleted = enrollments.reduce(
      (sum, enrollment) => sum + enrollment.progress.filter(p => p.completed).length,
      0
    );
    const totalLessons = enrollments.reduce(
      (sum, enrollment) => sum + enrollment.progress.length,
      0
    );
    const averageProgress = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
    const completedCourses = enrollments.filter(enrollment => {
      const courseLessons = enrollment.progress.length;
      const completed = enrollment.progress.filter(p => p.completed).length;
      return courseLessons > 0 && completed === courseLessons;
    }).length;

    // Placeholder for quizzesTaken and averageQuizScore (requires quiz attempt data)
    const quizzesTaken = 0;
    const averageQuizScore = 0;

    // Placeholder for totalTimeSpent (requires time tracking, here just 0)
    const totalTimeSpent = 0;

    // Activity trend: lessons completed per day
    const activityTrend: Array<{ date: string; lessonsCompleted: number; timeSpent: number }> = [];
    // Optionally, you could group progress by date here if you have timestamps

    return {
      userId,
      period,
      totalCourses,
      completedCourses,
      averageProgress,
      totalTimeSpent,
      lessonsCompleted,
      quizzesTaken,
      averageQuizScore,
      activityTrend
    };
  }

  // Returns eligibility for course completion
  async getCourseCompleteEligibility(enrollmentId: string, userId: string) {
    // Validate enrollment ownership
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: { include: { lessons: true } },
          },
        },
        progress: true,
      },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.userId !== userId) throw new ForbiddenException('You can only check your own enrollment');

    // Check all lessons completed
    const allLessons = enrollment.course.modules.flatMap((mod) => mod.lessons);
    const totalLessons = allLessons.length;
    const completedLessons = enrollment.progress.filter((p) => p.completed).length;
    const allLessonsCompleted = totalLessons > 0 && completedLessons === totalLessons;

    // Check average quiz score (average >= 50)
    const quizzes = await this.prisma.quiz.findMany({ where: { courseId: enrollment.courseId } });
    let averageQuizScore = 0;
    let allQuizzesAttempted = true;
    if (quizzes.length > 0) {
      let totalScore = 0;
      for (const quiz of quizzes) {
        const attempt = await this.prisma.quizAttempt.findFirst({
          where: { userId, quizId: quiz.id },
          orderBy: { score: 'desc' },
        });
        if (!attempt) {
          allQuizzesAttempted = false;
          break;
        }
        totalScore += attempt.score ?? 0;
      }
      if (allQuizzesAttempted) {
        averageQuizScore = totalScore / quizzes.length;
      }
    }
    const allQuizzesPassed = allQuizzesAttempted && averageQuizScore >= 60;

    // Check if course already completed
    const userCourseProgress = await this.prisma.userCourseProgress.findUnique({
      where: { userId_courseId: { userId, courseId: enrollment.courseId } },
    });
    const courseCompleted = !!userCourseProgress?.complete;

    return {
      allLessonsCompleted,
      allQuizzesPassed,
      courseCompleted,
      eligible: allLessonsCompleted && allQuizzesPassed && !courseCompleted,
    };
  }

  // Marks the course as completed if eligible
  async completeCourse(enrollmentId: string, userId: string) {
    const eligibility = await this.getCourseCompleteEligibility(enrollmentId, userId);
    if (!eligibility.eligible) {
      throw new ForbiddenException('Not eligible to complete course');
    }
    // Mark as completed
    const enrollment = await this.prisma.enrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    await this.prisma.userCourseProgress.upsert({
      where: { userId_courseId: { userId, courseId: enrollment.courseId } },
      update: { complete: true },
      create: { userId, courseId: enrollment.courseId, complete: true },
    });
    return { success: true, message: 'Course marked as completed.' };
  }
}
