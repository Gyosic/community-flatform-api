import { Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { REDIS } from 'src/redis/redis.module';
import Redis from 'ioredis';

@Injectable()
export class MailService {
  EMAIL_VERIFY_PREFIX: string;

  constructor(
    @Inject(REDIS) private redis: Redis,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.EMAIL_VERIFY_PREFIX = 'email-verify:';
  }

  async sendVerificationEmail(email: string, userId: string) {
    const token = crypto.randomUUID();
    const emailVerifyTTL = parseInt(
      this.configService.get<string>('EMAIL_VERIFY_TTL') || '86400',
    );
    await this.redis.set(
      `${this.EMAIL_VERIFY_PREFIX}${token}`,
      userId,
      'EX',
      emailVerifyTTL,
    );
    const redirectUrl = this.configService.get<string>('REDIRECT_URL');
    const verificationLink = `${redirectUrl}/verify-email/${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: '이메일 인증을 완료해주세요',
      html: `
        <h1>이메일 인증</h1>
        <p>아래 링크를 클릭하여 이메일 인증을 완료해주세요.</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>이 링크는 24시간 동안 유효합니다.</p>
      `,
    });
  }
}
