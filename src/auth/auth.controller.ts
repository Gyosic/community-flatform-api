import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  type LoginDto,
  type SignupDto,
  loginSchema,
  signupSchema,
} from 'src/common/zod/user';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { LoginSwaggerDto, SignupSwaggerDto } from '../common/swagger/auth.dto';

@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '로그인' })
  @ApiBody({ type: LoginSwaggerDto })
  @UsePipes(new ZodValidationPipe(loginSchema))
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: '회원가입' })
  @ApiBody({ type: SignupSwaggerDto })
  @UsePipes(new ZodValidationPipe(signupSchema))
  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @ApiOperation({ summary: '이메일 인증' })
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @ApiOperation({ summary: '내 정보 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: { user: { userId: string } }) {
    return this.authService.getMe(req.user.userId);
  }
}
