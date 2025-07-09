import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great course! Highly recommended.' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ example: 'uuid-of-course' })
  @IsString()
  courseId: string;
}

export class UpdateReviewDto {
  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: 'Updated review comment.' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  createdAt: Date;
} 