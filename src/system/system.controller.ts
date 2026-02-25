import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAdminDto, SiteConfigDto } from './dto/system.dto';
import { SystemService } from './system.service';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @ApiOperation({ summary: '사이트 설정 조회' })
  @Get('config')
  async getConfig() {
    return this.systemService.getConfig();
  }

  @ApiOperation({ summary: '사이트 설정 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('config')
  async createConfig(@Body() dto: SiteConfigDto) {
    return this.systemService.createConfig(dto);
  }

  @ApiOperation({ summary: '사이트 설정 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('config/:id')
  async updateConfig(@Param('id') id: string, @Body() dto: SiteConfigDto) {
    return this.systemService.updateConfig(id, dto);
  }

  @ApiOperation({ summary: '관리자 정보 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async getAdmin(@Request() req: { user: { userId: string } }) {
    return this.systemService.getAdmin(req.user.userId);
  }

  @ApiOperation({ summary: '관리자 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('admin')
  async createAdmin(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateAdminDto,
  ) {
    return this.systemService.createAdmin(req.user.userId, dto);
  }

  @ApiOperation({ summary: '관리자 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('admin')
  async deleteAdmin(@Request() req: { user: { userId: string } }) {
    return this.systemService.deleteAdmin(req.user.userId);
  }
}
