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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAdminDto, SiteConfigDto } from './dto/system.dto';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('config')
  async getConfig() {
    return this.systemService.getConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Post('config')
  async createConfig(@Body() dto: SiteConfigDto) {
    return this.systemService.createConfig(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('config/:id')
  async updateConfig(@Param('id') id: string, @Body() dto: SiteConfigDto) {
    return this.systemService.updateConfig(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async getAdmin(@Request() req: { user: { userId: string } }) {
    return this.systemService.getAdmin(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin')
  async createAdmin(
    @Request() req: { user: { userId: string } },
    @Body() dto: CreateAdminDto,
  ) {
    return this.systemService.createAdmin(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin')
  async deleteAdmin(@Request() req: { user: { userId: string } }) {
    return this.systemService.deleteAdmin(req.user.userId);
  }
}
