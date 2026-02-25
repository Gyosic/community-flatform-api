import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { DRIZZLE } from './database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './database/schema';
import { roles, users } from './database/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

const SALT_ROUNDS = 10;

/**
 * 역할 이름 상수
 */
const ROLE_NAMES = {
  SYSTEM_ADMIN: 'sysadmin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member',
  NEW_MEMBER: 'newbie',
} as const;

type RoleName = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

/**
 * 역할 우선순위 (숫자가 높을수록 높은 권한)
 */
const ROLE_PRIORITY = {
  [ROLE_NAMES.SYSTEM_ADMIN]: 100,
  [ROLE_NAMES.ADMIN]: 90,
  [ROLE_NAMES.MODERATOR]: 50,
  [ROLE_NAMES.MEMBER]: 10,
  [ROLE_NAMES.NEW_MEMBER]: 1,
} as const;

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    private configService: ConfigService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    await this.initializeDatabase();
  }

  /**
   * 데이터베이스 초기화
   * - 역할 초기화
   * - 시스템 관리자 계정 생성 (환경변수 기반)
   */
  async initializeDatabase() {
    try {
      // 1. 역할 테이블 확인 및 초기화
      const existingRoles = await this.db.select().from(roles);
      if (existingRoles.length === 0) {
        console.log('[init] 역할 초기 설정중...');
        await this.initializeRoles();
        console.log('[init] 역할 초기 설정 완료');
      }

      // 2. 시스템 관리자 계정 확인 및 생성
      const sysAdminExists = await this.systemAdminExists();
      if (!sysAdminExists) {
        console.log('[init] 시스템 관리자 계정 생성 중...');
        await this.createSystemAdmin();
        console.log('[init] 시스템 관리자 계정 생성 완료');
      }

      console.log('[init] 데이터베이스 초기화 완료');
    } catch (error) {
      console.error('[init] 데이터베이스 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 시스템 관리자 계정 생성
   */
  async createSystemAdmin() {
    const email = this.configService.get<string>(
      'SYSADMIN_EMAIL',
      'admin@example.com',
    );
    const name = this.configService.get<string>('SYSADMIN_NAME', 'admin');
    const password = this.configService.get<string>(
      'SYSADMIN_PASSWORD',
      'admin123!',
    );

    if (!email || !password) {
      console.warn(
        '[init] SYSADMIN_EMAIL 또는 SYSADMIN_PASSWORD 환경변수가 설정되지 않았습니다',
      );
      return;
    }

    // 이메일 중복 확인
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      console.log(`[init] 이메일 ${email}로 등록된 사용자가 이미 존재합니다`);
      return;
    }

    // 시스템 관리자 역할 조회
    const systemAdminRole = await this.getRoleByName(ROLE_NAMES.SYSTEM_ADMIN);
    if (!systemAdminRole) {
      console.error('[init] 시스템 관리자 역할이 존재하지 않습니다');
      return;
    }

    // 비밀번호 해싱
    const hashedPassword = await this.hashPassword(password);

    // 시스템 관리자 계정 생성
    await this.db.insert(users).values({
      email,
      name,
      password: hashedPassword,
      role_id: systemAdminRole.id,
      is_email_verified: true,
      emailVerified: new Date(),
    });

    console.log(`[init] 시스템 관리자 계정 생성됨: ${email}`);
  }

  async initializeRoles() {
    const existingRoles = await this.db.select().from(roles);
    if (existingRoles.length > 0) return;

    const defaultRoles = [
      {
        name: ROLE_NAMES.SYSTEM_ADMIN,
        display_name: '시스템 관리자',
        description: '시스템 전체를 관리하는 최고 권한자',
        priority: ROLE_PRIORITY[ROLE_NAMES.SYSTEM_ADMIN],
        min_level: 1,
      },
      {
        name: ROLE_NAMES.ADMIN,
        display_name: '관리자',
        description: '커뮤니티를 운영하는 관리자',
        priority: ROLE_PRIORITY[ROLE_NAMES.ADMIN],
        min_level: 1,
      },
      {
        name: ROLE_NAMES.MODERATOR,
        display_name: '운영진',
        description: '게시판을 관리하는 운영진',
        priority: ROLE_PRIORITY[ROLE_NAMES.MODERATOR],
        min_level: 5,
      },
      {
        name: ROLE_NAMES.MEMBER,
        display_name: '일반회원',
        description: '일반 회원',
        priority: ROLE_PRIORITY[ROLE_NAMES.MEMBER],
        min_level: 2,
      },
      {
        name: ROLE_NAMES.NEW_MEMBER,
        display_name: '신규회원',
        description: '가입 후 인증 전 회원',
        priority: ROLE_PRIORITY[ROLE_NAMES.NEW_MEMBER],
        min_level: 1,
      },
    ];

    await this.db.insert(roles).values(defaultRoles);
  }

  async systemAdminExists(): Promise<boolean> {
    const systemAdminRole = await this.getRoleByName(ROLE_NAMES.SYSTEM_ADMIN);
    if (!systemAdminRole) return false;

    const [systemAdmin] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role_id, systemAdminRole.id))
      .limit(1);

    return !!systemAdmin;
  }

  async getRoleByName(name: RoleName) {
    const [role] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);
    return role ?? null;
  }

  /**
   * 비밀번호 해싱
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * 비밀번호 검증
   */
  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
