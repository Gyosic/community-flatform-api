import { ApiProperty } from '@nestjs/swagger';
import { type FileType } from '../zod/file';

export class ProfileSwaggerDto {
  @ApiProperty()
  image: FileType;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty()
  id: string;
}
