import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';
import { LoginDto, SignupDto } from 'src/common/zod/user';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .leftJoin(schema.roles, eq(schema.roles.id, schema.users.role_id))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다',
      );
    }

    const isValid = await bcrypt.compare(password, user.users.password);
    if (!isValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다',
      );
    }

    if (!user.users.is_active) {
      throw new UnauthorizedException('비활성화된 계정입니다');
    }

    if (user.users.is_banned) {
      throw new UnauthorizedException('정지된 계정입니다');
    }

    const payload = { sub: user.users.id, email: user.users.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      user: {
        accessToken,
        id: user.users.id,
        email: user.users.email,
        name: user.users.name,
        role: user.roles?.name,
      },
    };
  }

  async register(signupDto: SignupDto) {
    const { email, name, password } = signupDto;

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await this.db
      .insert(schema.users)
      .values({
        email,
        name,
        password: passwordHash,
        role_id: '',
        level: 1,
        experience: 0,
        is_active: true,
        is_email_verified: false,
        is_banned: false,
      })
      .returning();

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    };
  }

  async getMe(userId: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .leftJoin(schema.roles, eq(schema.roles.id, schema.users.role_id))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다');
    }

    return {
      user: {
        id: user.users.id,
        email: user.users.email,
        name: user.users.name,
        role: user.roles?.name,
      },
    };
  }
}
