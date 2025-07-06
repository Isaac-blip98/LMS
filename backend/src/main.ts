import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('E-Learning Platform API')
    .setDescription('A comprehensive e-learning platform API with role-based access control')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User management (Admin only)')
    .addTag('Courses', 'Course management')
    .addTag('Modules', 'Module management (Instructor/Admin)')
    .addTag('Lessons', 'Lesson management (Instructor/Admin)')
    .addTag('Enrollments', 'Course enrollment management')
    .addTag('Progress', 'Learning progress tracking')
    .addTag('Quizzes', 'Quiz and assessment system')
    .addTag('Reviews', 'Course reviews and ratings')
    .addTag('Analytics', 'Learning analytics and insights')
    .addTag('Content', 'Content management and file uploads')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 3000);

  console.log(` Server is running on http://localhost:3000`);
  console.log(`Swagger UI available at http://localhost:3000/api`);
}
bootstrap();
