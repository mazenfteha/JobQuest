import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  source?: string;
}
