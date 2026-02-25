import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  async findOne() {
    return this.menuService.findOne();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async update(@Body() dto: UpdateMenuDto) {
    return this.menuService.update(dto);
  }
}
