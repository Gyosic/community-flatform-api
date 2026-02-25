import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetPostsDto } from './dto/get-posts.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(@Query() dto: GetPostsDto) {
    return this.postsService.findAll(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
}
