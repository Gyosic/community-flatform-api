import {
  Body,
  Controller,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { type ProfileDto, profileSchema } from 'src/common/zod/user';
import { ProfileSwaggerDto } from 'src/common/swagger/user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { FilesInterceptor } from '@nestjs/platform-express/multer';

@ApiTags('Users')
@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '프로필 설정' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ProfileSwaggerDto })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('image'))
  @Put('profile')
  async updateProfile(
    @UploadedFiles() files: Express.Multer.File[],
    @Body(new ZodValidationPipe(profileSchema)) profileDto: ProfileDto,
  ) {
    return this.usersService.updateProfile(
      profileDto.id,
      profileDto.name,
      files,
    );
  }
}
