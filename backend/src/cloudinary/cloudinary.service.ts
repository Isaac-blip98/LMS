/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFileBuffer(
    buffer: Buffer,
    folder: string,
    mimetype?: string,
  ): Promise<UploadApiResponse> {
    console.log('CloudinaryService.uploadFileBuffer', { folder, mimetype });
    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    if (mimetype) {
      if (mimetype.startsWith('image/')) resourceType = 'image';
      else if (mimetype.startsWith('video/')) resourceType = 'video';
      else if (mimetype === 'application/pdf') resourceType = 'image';
      else resourceType = 'raw';
    }
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as UploadApiResponse);
        },
      );
      stream.end(buffer);
    });
  }

  async uploadFromUrl(url: string, folder: string, publicId?: string, mimetype?: string): Promise<UploadApiResponse> {
    console.log('CloudinaryService.uploadFromUrl', { url, folder, publicId, mimetype });
    
    const options: Record<string, unknown> = { folder };
    if (publicId) {
      options.public_id = publicId;
    }
    if ((mimetype && mimetype === 'application/pdf') || url.toLowerCase().endsWith('.pdf')) {
      options.resource_type = 'image';
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(url, options, (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      });
    });
  }

  async uploadLessonContent(url: string, lessonId: string): Promise<UploadApiResponse> {
    console.log('CloudinaryService.uploadLessonContent', { url, lessonId });
    return this.uploadFromUrl(url, 'lessons', `lesson_${lessonId}`);
  }

  async uploadCertificate(url: string, certificateId: string, mimetype?: string): Promise<UploadApiResponse> {
    console.log('CloudinaryService.uploadCertificate', { url, certificateId, mimetype });
    return this.uploadFromUrl(url, 'certificates', `certificate_${certificateId}`, mimetype);
  }

  async uploadCourseImage(image: Buffer | string, courseId: string): Promise<UploadApiResponse> {
    console.log('CloudinaryService.uploadCourseImage', { imageType: typeof image, courseId });
    if (Buffer.isBuffer(image)) {
      return this.uploadFileBuffer(image, 'courses');
    } else if (typeof image === 'string') {
      return this.uploadFromUrl(image, 'courses', `course_${courseId}`);
    } else {
      throw new Error('Invalid image type for uploadCourseImage');
    }
  }

  async deleteCourseImage(courseId: string): Promise<{ result: string }> {
    console.log('CloudinaryService.deleteCourseImage', { courseId });
    return this.deleteFile(`courses/course_${courseId}`);
  }

  async deleteFile(publicId: string): Promise<{ result: string }> {
    console.log('CloudinaryService.deleteFile', { publicId });
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve({ result });
      });
    });
  }

  async deleteLessonContent(lessonId: string): Promise<{ result: string }> {
    console.log('CloudinaryService.deleteLessonContent', { lessonId });
    return this.deleteFile(`lessons/lesson_${lessonId}`);
  }

  async deleteCertificate(certificateId: string): Promise<{ result: string }> {
    console.log('CloudinaryService.deleteCertificate', { certificateId });
    return this.deleteFile(`certificates/certificate_${certificateId}`);
  }

  isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  }

  extractPublicIdFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        return urlParts[uploadIndex + 2].split('.')[0]; // Remove file extension
      }
      return null;
    } catch (error) {
      console.error('Error extracting public ID from URL:', error);
      return null;
    }
  }
}
