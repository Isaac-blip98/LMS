/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StudentProgressDto } from './dtos/student-progress.dto';
import { CourseCompletionRateDto } from './dtos/course-completion-rate.dto';
import { PopularCourseDto } from './dtos/popular-course.dto';
import { InstructorCourseStatsDto } from './dtos/instructor-stats.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('student/:userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ type: [StudentProgressDto] })
  getStudentProgress(@Param('userId') userId: string) {
    return this.analyticsService.getStudentProgress(userId);
  }

  @Get('student/:userId/dashboard-stats')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ description: 'Student dashboard statistics' })
  getStudentDashboardStats(@Param('userId') userId: string) {
    return this.analyticsService.getStudentDashboardStats(userId);
  }

  @Get('course/:courseId/completion-rate')
  @ApiParam({ name: 'courseId', type: String })
  @ApiOkResponse({ type: CourseCompletionRateDto })
  getCourseCompletionRate(@Param('courseId') courseId: string) {
    return this.analyticsService.getCourseCompletionRate(courseId);
  }

  @Get('popular-courses')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: [PopularCourseDto] })
  getPopularCourses(@Query('limit') limit: string) {
    return this.analyticsService.getPopularCourses(Number(limit) || 5);
  }

  @Get('instructor/:instructorId')
  @ApiParam({ name: 'instructorId', type: String })
  @ApiOkResponse({ type: [InstructorCourseStatsDto] })
  getInstructorStats(@Param('instructorId') instructorId: string) {
    return this.analyticsService.getInstructorStats(instructorId);
  }

  @Get('dashboard/stats')
  @ApiOkResponse({ description: 'Overall platform statistics' })
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('course/:courseId/engagement')
  @ApiParam({ name: 'courseId', type: String })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'year'] })
  @ApiOkResponse({ description: 'Course engagement analytics' })
  getCourseEngagement(
    @Param('courseId') courseId: string,
    @Query('period') period: string = 'month'
  ) {
    return this.analyticsService.getCourseEngagement(courseId, period);
  }

  @Get('student/:userId/learning-path')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ description: 'Student learning path and recommendations' })
  getStudentLearningPath(@Param('userId') userId: string) {
    return this.analyticsService.getStudentLearningPath(userId);
  }

  @Get('course/:courseId/module-progress')
  @ApiParam({ name: 'courseId', type: String })
  @ApiOkResponse({ description: 'Module-wise progress breakdown for a course' })
  getModuleProgress(@Param('courseId') courseId: string) {
    return this.analyticsService.getModuleProgress(courseId);
  }

  @Get('time-spent/:userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiQuery({ name: 'courseId', required: false, type: String })
  @ApiOkResponse({ description: 'Time spent analytics for user' })
  getTimeSpentAnalytics(
    @Param('userId') userId: string,
    @Query('courseId') courseId?: string
  ) {
    return this.analyticsService.getTimeSpentAnalytics(userId, courseId);
  }

  @Get('certificate-stats')
  @ApiQuery({ name: 'instructorId', required: false, type: String })
  @ApiOkResponse({ description: 'Certificate issuance statistics' })
  getCertificateStats(@Query('instructorId') instructorId?: string) {
    return this.analyticsService.getCertificateStats(instructorId);
  }
}
