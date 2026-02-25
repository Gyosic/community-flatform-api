import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { FileType } from 'src/common/zod/file';

export class ThemeConfigDto {
  @IsOptional()
  @IsString()
  primary_color?: string;

  @IsOptional()
  @IsString()
  secondary_color?: string;

  @IsString()
  default_theme: 'light' | 'dark' | 'system';
}

export class PermissionConfigDto {
  @IsBoolean()
  allow_registration: boolean;

  @IsBoolean()
  require_email_verification: boolean;

  @IsString()
  default_role: string;

  @IsNumber()
  level_up_posts_count: number;

  @IsNumber()
  level_up_comments_count: number;

  @IsNumber()
  level_up_days_active: number;
}

export class FeaturesConfigDto {
  @IsOptional()
  @IsBoolean()
  ai_features?: boolean;

  @IsBoolean()
  real_time_notifications: boolean;

  @IsBoolean()
  file_upload: boolean;

  @IsBoolean()
  anonymous_posts: boolean;
}

export class SeoConfigDto {
  @IsOptional()
  @IsString()
  meta_title?: string;

  @IsOptional()
  @IsString()
  meta_description?: string;

  @IsOptional()
  @IsString({ each: true })
  meta_keywords?: string[];

  @IsOptional()
  @IsObject({ each: true })
  og_image?: FileType[];
}

export class SiteConfigDto {
  @IsOptional()
  @IsString()
  site_name?: string;

  @IsOptional()
  @IsString()
  site_description?: string;

  @IsOptional()
  @IsObject()
  theme_config?: ThemeConfigDto;

  @IsOptional()
  @IsObject()
  permission_config?: PermissionConfigDto;

  @IsOptional()
  @IsObject()
  features_config?: FeaturesConfigDto;

  @IsOptional()
  @IsObject()
  seo_config?: SeoConfigDto;
}

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  name: string;
}
