import { IsEmail, IsObject, IsOptional, IsString, MinLength } from "class-validator";

export class SiteConfigDto {
  @IsOptional()
  @IsString()
  site_name?: string;

  @IsOptional()
  @IsString()
  site_description?: string;

  @IsOptional()
  @IsObject()
  theme_config?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  permission_config?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  features_config?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  seo_config?: Record<string, unknown>;
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
