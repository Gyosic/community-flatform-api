import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetPostsDto } from './dto/get-posts.dto';
import { PostsService } from './posts.service';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: '게시글 목록 조회' })
  @Get()
  async findAll(@Query() dto: GetPostsDto) {
    return this.postsService.findAll(dto);
  }

  @ApiOperation({ summary: '게시글 상세 조회' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
}
