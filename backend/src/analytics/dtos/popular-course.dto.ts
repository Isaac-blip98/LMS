/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class PopularCourseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  enrollmentCount: number;

  @ApiProperty()
  completionRate: number;
}
