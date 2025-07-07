/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { Role } from '@prisma/client';
import { UserFromJwt } from '../auth/interfaces/auth.interface';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createCourseDto: CreateCourseDto, image?: Express.Multer.File) {
    const { instructorId, imageUrl, ...courseData } = createCourseDto;
    // Parse objectives, prerequisites, and isPublished if they are strings (from FormData)
    const parsedData = {
      ...courseData,
      objectives:
        typeof courseData.objectives === 'string'
          ? (() => { try { return JSON.parse(courseData.objectives); } catch { return []; } })()
          : Array.isArray(courseData.objectives)
            ? courseData.objectives
            : [],
      prerequisites:
        typeof courseData.prerequisites === 'string'
          ? (() => { try { return JSON.parse(courseData.prerequisites); } catch { return []; } })()
          : Array.isArray(courseData.prerequisites)
            ? courseData.prerequisites
            : [],
      isPublished: typeof courseData.isPublished === 'string'
        ? courseData.isPublished === 'true'
        : !!courseData.isPublished,
    };
    let createdCourse;

    // First, create the course without image fields
    createdCourse = await this.prisma.course.create({
      data: { ...parsedData, instructorId: instructorId || null }
    });

    // If an image file is provided, upload it to Cloudinary
    if (image && image.buffer) {
      try {
        const uploadResult = await this.cloudinaryService.uploadCourseImage(image.buffer, createdCourse.id);
        return this.prisma.course.update({
          where: { id: createdCourse.id },
          data: {
            imageUrl: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
          },
        });
      } catch (error) {
        console.error('Failed to upload course image:', error);
        // Return the course without image fields
        return createdCourse;
      }
    }
    // If a direct imageUrl is provided (legacy support), try to upload it to Cloudinary
    if (imageUrl) {
      try {
        const uploadResult = await this.cloudinaryService.uploadCourseImage(imageUrl, createdCourse.id);
        return this.prisma.course.update({
          where: { id: createdCourse.id },
          data: {
            imageUrl: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
          },
        });
      } catch (error) {
        console.error('Failed to upload course image from URL:', error);
        return createdCourse;
      }
    }
    return createdCourse;
  }

  async findAll() {
    const courses = await this.prisma.course.findMany({
      include: {
        instructor: { select: { name: true } },
      },
    });
    const courseIds = courses.map(c => c.id);
    // Get all reviews for these courses
    const reviews = await this.prisma.review.findMany({
      where: { courseId: { in: courseIds } },
      select: { courseId: true, rating: true },
    });

    // Aggregate ratings and counts
    const ratingMap: Record<string, { sum: number; count: number }> = {};
    for (const review of reviews) {
      if (!ratingMap[review.courseId]) {
        ratingMap[review.courseId] = { sum: 0, count: 0 };
      }
      ratingMap[review.courseId].sum += review.rating;
      ratingMap[review.courseId].count += 1;
    }

    return courses.map(course => ({
      ...course,
      instructorName: course.instructor?.name || 'Unknown Instructor',
      averageRating: ratingMap[course.id]?.count
        ? Math.round((ratingMap[course.id].sum / ratingMap[course.id].count) * 10) / 10
        : 0,
      reviewCount: ratingMap[course.id]?.count || 0,
    }));
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, user: UserFromJwt, image?: Express.Multer.File) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role !== Role.ADMIN && course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    const { imageUrl, ...updateData } = updateCourseDto;
    // Parse objectives, prerequisites, and isPublished if they are strings (from FormData)
    const parsedData = {
      ...updateData,
      objectives:
        typeof updateData.objectives === 'string'
          ? (() => { try { return JSON.parse(updateData.objectives); } catch { return []; } })()
          : Array.isArray(updateData.objectives)
            ? updateData.objectives
            : [],
      prerequisites:
        typeof updateData.prerequisites === 'string'
          ? (() => { try { return JSON.parse(updateData.prerequisites); } catch { return []; } })()
          : Array.isArray(updateData.prerequisites)
            ? updateData.prerequisites
            : [],
      isPublished: typeof updateData.isPublished === 'string'
        ? updateData.isPublished === 'true'
        : !!updateData.isPublished,
    };

    // If an image file is provided, upload it to Cloudinary
    if (image && image.buffer) {
      try {
        // Delete old image if it exists
        if (course.imagePublicId) {
          await this.cloudinaryService.deleteFile(course.imagePublicId);
        }
        const uploadResult = await this.cloudinaryService.uploadCourseImage(image.buffer, id);
        return this.prisma.course.update({
          where: { id },
          data: {
            ...parsedData,
            imageUrl: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
          },
        });
      } catch (error) {
        console.error('Failed to update course image:', error);
        // Continue with update without image change
      }
    }
    // If a new imageUrl is provided (legacy support), upload it to Cloudinary
    if (imageUrl && imageUrl !== course.imageUrl) {
      try {
        if (course.imagePublicId) {
          await this.cloudinaryService.deleteFile(course.imagePublicId);
        }
        const uploadResult = await this.cloudinaryService.uploadCourseImage(imageUrl, id);
        return this.prisma.course.update({
          where: { id },
          data: {
            ...parsedData,
            imageUrl: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
          },
        });
      } catch (error) {
        console.error('Failed to update course image from URL:', error);
        // Continue with update without image change
      }
    }
    return this.prisma.course.update({ where: { id }, data: parsedData });
  }

  async remove(id: string, user: UserFromJwt) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role !== Role.ADMIN && course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    // Delete course image from Cloudinary if it exists
    if (course.imagePublicId) {
      try {
        await this.cloudinaryService.deleteFile(course.imagePublicId);
      } catch (error) {
        console.error('Failed to delete course image from Cloudinary:', error);
        // Continue with course deletion even if image deletion fails
      }
    }

    return this.prisma.course.delete({ where: { id } });
  }

  async assignInstructor(courseId: string, instructorId: string) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if instructor exists
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId },
    });
    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    // Verify instructor has INSTRUCTOR role
    if (instructor.role !== Role.INSTRUCTOR) {
      throw new ForbiddenException(
        'User must have INSTRUCTOR role to be assigned to a course',
      );
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: { instructorId },
    });
  }
}
