/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AppMailerModule } from '../mailer/mailer.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, AppMailerModule],
  providers: [EnrollmentsService],
  controllers: [EnrollmentsController]
})
export class EnrollmentsModule {}
