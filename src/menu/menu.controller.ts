import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { MenuService } from './menu.service';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({ summary: '메뉴 조회' })
  @Get()
  async findOne() {
    return this.menuService.findOne();
  }

  @ApiOperation({ summary: '메뉴 생성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @ApiOperation({ summary: '메뉴 수정' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put()
  async update(@Body() dto: UpdateMenuDto) {
    return this.menuService.update(dto);
  }
}
