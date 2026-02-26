import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import Redis from 'ioredis';
import { DRIZZLE } from '../database/database.module';
import { REDIS } from '../redis/redis.module';
import * as schema from '../database/schema';
import { LoginDto, SignupDto } from 'src/common/zod/user';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    @Inject(REDIS) private redis: Redis,
    private jwtService: JwtService,
    private mailService: MailService,
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
      throw new BadRequestException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    if (!user.users.is_email_verified) {
      throw new UnauthorizedException('이메일 인증이 필요합니다');
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

  async signup(signupDto: SignupDto) {
    const { email, name, password } = signupDto;

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const [role] = await this.db
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.name, 'newbie'))
        .limit(1);

      const user = await this.db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(schema.users)
          .values({
            email,
            name,
            password: passwordHash,
            role_id: role.id,
          })
          .returning();

        await this.mailService.sendVerificationEmail(newUser.email, newUser.id);

        return newUser;
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (err) {
      console.error('signup error:', err);
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : '회원가입에 실패했습니다',
      );
    }
  }

  async verifyEmail(token: string) {
    const key = `${this.mailService.EMAIL_VERIFY_PREFIX}${token}`;
    const userId = await this.redis.get(key);

    if (!userId) {
      throw new BadRequestException('유효하지 않거나 만료된 인증 링크입니다');
    }

    await this.db
      .update(schema.users)
      .set({
        is_email_verified: true,
        emailVerified: new Date(),
      })
      .where(eq(schema.users.id, userId));

    await this.redis.del(key);

    return { success: true, message: '이메일 인증이 완료되었습니다' };
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
