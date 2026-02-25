import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreatePageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsIn(["board", "gallery", "qna", "notice", "landing", "info", "general"])
  type: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  parent_id?: string;

  @IsOptional()
  @IsObject()
  config?: {
    allow_anonymous?: boolean;
    allow_comments?: boolean;
    allow_nested_comments?: boolean;
    allow_attachments?: boolean;
    max_attachment_size?: number;
    allowed_file_types?: string[];
    require_approval?: boolean;
  };

  @IsOptional()
  @IsObject()
  display_config?: {
    show_author?: boolean;
    show_view_count?: boolean;
    show_like_count?: boolean;
  };

  @IsOptional()
  @IsObject()
  layout?: Array<{
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    component?: {
      id: string;
      props: Record<string, unknown>;
    };
  }>;
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(["board", "gallery", "qna", "notice", "landing", "info", "general"])
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  parent_id?: string;

  @IsOptional()
  @IsObject()
  config?: {
    allow_anonymous?: boolean;
    allow_comments?: boolean;
    allow_nested_comments?: boolean;
    allow_attachments?: boolean;
    max_attachment_size?: number;
    allowed_file_types?: string[];
    require_approval?: boolean;
  };

  @IsOptional()
  @IsObject()
  display_config?: {
    show_author?: boolean;
    show_view_count?: boolean;
    show_like_count?: boolean;
  };

  @IsOptional()
  @IsObject()
  layout?: Array<{
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    component?: {
      id: string;
      props: Record<string, unknown>;
    };
  }>;
}
