/* eslint-disable prettier/prettier */
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserFromJwt } from '../auth/interfaces/auth.interface';

@Injectable()
export class EnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // Enrollments
  async enrollUser(userId: string, courseId: string) {
    return this.prisma.enrollment.create({ data: { userId, courseId } });
  }
  async getEnrollmentsByUser(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: true,
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
        progress: true,
      },
    });

    return enrollments.map((enrollment) => {
      const allLessons = enrollment.course.modules.flatMap(
        (mod) => mod.lessons,
      );
      const totalLessons = allLessons.length;

      const completedLessons = enrollment.progress.filter(
        (p) => p.completed,
      ).length;
      const progress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        ...enrollment,
        totalLessons,
        completedLessons,
        progress,
      };
    });
  }

  async getEnrollmentsByCourse(courseId: string) {
    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: { user: true },
    });
  }
  async getAllEnrollments() {
    return this.prisma.enrollment.findMany({
      include: {
        user: true,
        course: true,
      },
    });
  }
  async unenrollUser(enrollmentId: string) {
    return this.prisma.enrollment.delete({ where: { id: enrollmentId } });
  }

  // Progress
  async getProgress(enrollmentId: string) {
    return this.prisma.progress.findMany({ where: { enrollmentId } });
  }
  async markLessonComplete(enrollmentId: string, lessonId: string) {
    return this.prisma.progress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      update: { completed: true },
      create: { enrollmentId, lessonId, completed: true },
    });
  }

  // Certificates
  async getCertificatesByUser(userId: string, user: UserFromJwt) {
    // Students can only see their own certificates
    if (user.role === 'STUDENT' && user.userId !== userId) {
      throw new ForbiddenException('You can only view your own certificates');
    }
    // Instructors can only see certificates for students in their courses
    if (user.role === 'INSTRUCTOR') {
      const certificates = await this.prisma.certificate.findMany({
        where: { userId },
        include: {
          user: true,
          course: true,
        },
      });
      // Filter certificates to only include those from courses the instructor teaches
      const filteredCertificates = certificates.filter(
        (certificate) => certificate.course.instructorId === user.userId,
      );
      if (filteredCertificates.length === 0 && certificates.length > 0) {
        throw new ForbiddenException(
          'You can only view certificates for students in your courses',
        );
      }
      return filteredCertificates;
    }
    // Admins can see all certificates
    return this.prisma.certificate.findMany({
      where: { userId },
      include: {
        user: true,
        course: true,
      },
    });
  }

  async issueCertificate(
    userId: string,
    courseId: string,
    certificateUrl: string,
  ) {
    // Create the certificate first to get the ID
    const certificate = await this.prisma.certificate.create({
      data: { userId, courseId, certificateUrl },
    });

    // If the certificate URL is not already a Cloudinary URL, upload it to Cloudinary
    if (!this.cloudinaryService.isCloudinaryUrl(certificateUrl)) {
      try {
        const cloudinaryResult = await this.cloudinaryService.uploadCertificate(
          certificateUrl,
          certificate.id,
        );

        // Update the certificate with the Cloudinary URL
        await this.prisma.certificate.update({
          where: { id: certificate.id },
          data: { certificateUrl: cloudinaryResult.secure_url },
        });

        return {
          ...certificate,
          certificateUrl: cloudinaryResult.secure_url,
        };
      } catch (error) {
        console.error('Error uploading certificate to Cloudinary:', error);
        // If Cloudinary upload fails, return the certificate with original URL
        return certificate;
      }
    }

    return certificate;
  }
}
