/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Level, Category } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to Programming' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Learn the basics of programming with this comprehensive course.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: ['Understand basic programming concepts', 'Write simple programs'],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  objectives: string[];

  @ApiProperty({ example: ['Basic computer knowledge'] })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  prerequisites: string[];

  @ApiProperty({ enum: Level, example: Level.BEGINNER })
  @IsEnum(Level)
  level: Level;

  @ApiProperty({ enum: Category, example: Category.PROGRAMMING })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ default: false })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublished: boolean;

  @ApiProperty({ example: 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/courses/course-image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 'courses/course-image' })
  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @IsOptional()
  @IsString()
  instructorId?: string;
}

export class UpdateCourseDto {
  @ApiProperty({ example: 'Advanced Programming Concepts' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Advanced programming concepts and techniques.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: ['Master advanced concepts', 'Build complex applications'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @ApiProperty({ example: ['Basic programming knowledge'] })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @ApiProperty({ enum: Level })
  @IsOptional()
  @IsEnum(Level)
  level?: Level;

  @ApiProperty({ enum: Category })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ example: 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/courses/course-image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 'courses/course-image' })
  @IsOptional()
  @IsString()
  imagePublicId?: string;

  @IsOptional()
  @IsString()
  instructorId?: string;
}

export class CourseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  objectives: string[];

  @ApiProperty()
  prerequisites: string[];

  @ApiProperty({ enum: Level })
  level: Level;

  @ApiProperty({ enum: Category })
  category: Category;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  imageUrl?: string;

  @ApiProperty()
  imagePublicId?: string;

  @ApiProperty()
  instructorId: string;

  @ApiProperty({ example: 'John Doe' })
  instructorName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ example: 4.5 })
  averageRating: number;

  @ApiProperty({ example: 122 })
  reviewCount: number;
}
