import { Transform, Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class GetPostsDto {
  @IsOptional()
  @IsString()
  sorts?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  from?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  size?: number;

  @IsOptional()
  @IsString()
  board_type?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  user_name?: string;
}
