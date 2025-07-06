import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto) {
    return this.prisma.review.create({ data: createReviewDto });
  }

  async findAll() {
    return this.prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    return this.prisma.review.update({ where: { id }, data: updateReviewDto });
  }

  async remove(id: string) {
    return this.prisma.review.delete({ where: { id } });
  }

  async findByCourse(courseId: string) {
    return this.prisma.review.findMany({ where: { courseId } });
  }
} 