/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Controller, Get, Post, Put, Delete, Param, Body, UsePipes, ValidationPipe, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateCourseDto, UpdateCourseDto } from '../courses/dto/course.dto';
import { CreateModuleDto, UpdateModuleDto } from '../modules/dto/module.dto';
import { CreateLessonDto, UpdateLessonDto } from '../lessons/dto/lesson.dto';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { UserFromJwt } from '../auth/interfaces/auth.interface';

@ApiTags('Content')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('content')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Courses
  @Get('courses')
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  getAllCourses() {
    return this.contentService.getAllCourses();
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  getCourseById(@Param('id') id: string) {
    return this.contentService.getCourseById(id);
  }

  @Post('courses')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new course (Instructor/Admin only)' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  createCourse(@Body() data: CreateCourseDto, @CurrentUser() user: UserFromJwt) {
    return this.contentService.createCourse(data, user);
  }

  @Put('courses/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update course by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  updateCourse(@Param('id') id: string, @Body() data: UpdateCourseDto, @CurrentUser() user: UserFromJwt) {
    return this.contentService.updateCourse(id, data, user);
  }

  @Delete('courses/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete course by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  deleteCourse(@Param('id') id: string, @CurrentUser() user: UserFromJwt) {
    return this.contentService.deleteCourse(id, user);
  }

  // Modules
  @Get('courses/:courseId/modules')
  @UseGuards()
  @ApiOperation({ summary: 'Get modules for a course (public)' })
  @ApiResponse({ status: 200, description: 'Modules retrieved successfully' })
  getModulesByCourse(@Param('courseId') courseId: string) {
    return this.contentService.getModulesByCourse(courseId);
  }

  @Post('modules')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new module (Instructor/Admin only)' })
  @ApiResponse({ status: 201, description: 'Module created successfully' })
  createModule(@Body() data: CreateModuleDto, @CurrentUser() user: UserFromJwt) {
    return this.contentService.createModule(data, user);
  }

  @Put('modules/:id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Update module by ID (Instructor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Module updated successfully' })
  updateModule(@Param('id') id: string, @Body() data: UpdateModuleDto, @CurrentUser() user: UserFromJwt) {
    return this.contentService.updateModule(id, data, user);
  }

  @Delete('modules/:id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete module by ID (Instructor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Module deleted successfully' })
  deleteModule(@Param('id') id: string, @CurrentUser() user: UserFromJwt) {
    return this.contentService.deleteModule(id, user);
  }

  // Lessons
  @Get('modules/:moduleId/lessons')
  @UseGuards()
  @ApiOperation({ summary: 'Get lessons for a module (public)' })
  @ApiResponse({ status: 200, description: 'Lessons retrieved successfully' })
  getLessonsByModule(@Param('moduleId') moduleId: string) {
    return this.contentService.getLessonsByModule(moduleId);
  }

  @Post('lessons')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new lesson (Instructor/Admin only)' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  createLesson(@Body() data: CreateLessonDto, @CurrentUser() user: UserFromJwt) {
    return this.contentService.createLesson(data, user);
  }

  @Put('lessons/:id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Update lesson by ID (Instructor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  updateLesson(@Param('id') id: string, @Body() data: UpdateLessonDto, @CurrentUser() user: UserFromJwt) {
    return this.contentService.updateLesson(id, data, user);
  }

  @Delete('lessons/:id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete lesson by ID (Instructor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  deleteLesson(@Param('id') id: string, @CurrentUser() user: UserFromJwt) {
    return this.contentService.deleteLesson(id, user);
  }

  @Post('upload-file')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Upload content file (Instructor/Admin only)' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadContentFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    const result = await this.cloudinaryService.uploadFileBuffer(file.buffer, 'content-files');
    return { url: result.secure_url };
  }

  @Post('upload-certificate')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Upload certificate file (Instructor/Admin only)' })
  @ApiResponse({ status: 201, description: 'Certificate uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCertificateFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    const result = await this.cloudinaryService.uploadFileBuffer(file.buffer, 'certificate-files');
    return { url: result.secure_url };
  }

  @Post('upload-file-from-url')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Upload file from URL (Instructor/Admin only)' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFileFromUrl(@Body() body: { url: string; type?: string }) {
    const { url, type } = body;
    if (!url) {
      throw new BadRequestException('No URL provided');
    }
    let folder = 'content-files';
    if (type === 'certificate') folder = 'certificate-files';
    if (type === 'video') folder = 'video-files';
    try {
      const result = await this.contentService.uploadFileFromUrl(url, folder);
      return { url: result.secure_url };
    } catch (e) {
      return { error: e.message || 'Upload failed' };
    }
  }
}
