import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import * as schema from '../database/schema';
import { CreateAdminDto, SiteConfigDto } from './dto/system.dto';

@Injectable()
export class SystemService {
  constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

  async getConfig() {
    const [row] = await this.db.select().from(schema.siteSettings).limit(1);
    return row || null;
  }

  async createConfig(dto: SiteConfigDto) {
    if (!dto.site_name) {
      throw new ConflictException('site_name is required');
    }

    const [row] = await this.db
      .insert(schema.siteSettings)
      .values({
        site_name: dto.site_name,
        site_description: dto.site_description,
        theme_config: dto.theme_config,
        permission_config: dto.permission_config,
        features_config: dto.features_config,
        seo_config: dto.seo_config,
      })
      .returning();

    return row;
  }

  async updateConfig(id: string, dto: SiteConfigDto) {
    const [row] = await this.db
      .update(schema.siteSettings)
      .set(dto)
      .where(eq(schema.siteSettings.id, id))
      .returning();

    return row;
  }

  async getAdmin(requesterId: string) {
    const isAdmin = await this.isSystemAdmin(requesterId);
    if (!isAdmin) {
      throw new ForbiddenException('Only system admin can access this');
    }

    const adminRole = await this.getRoleByName('admin');
    if (!adminRole) {
      return { exists: false, admin: null };
    }

    const [admin] = await this.db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        created_at: schema.users.created_at,
      })
      .from(schema.users)
      .where(eq(schema.users.role_id, adminRole.id))
      .limit(1);

    return { exists: !!admin, admin: admin || null };
  }

  async createAdmin(requesterId: string, dto: CreateAdminDto) {
    const isAdmin = await this.isSystemAdmin(requesterId);
    if (!isAdmin) {
      throw new ForbiddenException(
        'Only system admin can create admin account',
      );
    }

    const adminExists = await this.adminExists();
    if (adminExists) {
      throw new ConflictException('Admin account already exists');
    }

    const [existingUser] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, dto.email))
      .limit(1);

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const adminRole = await this.getRoleByName('admin');
    if (!adminRole) {
      throw new InternalServerErrorException('Admin role not found');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const [newAdmin] = await this.db
      .insert(schema.users)
      .values({
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role_id: adminRole.id,
        is_email_verified: true,
        emailVerified: new Date(),
      })
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        created_at: schema.users.created_at,
      });

    return {
      message: 'Admin account created',
      admin: newAdmin,
    };
  }

  async deleteAdmin(requesterId: string) {
    const isAdmin = await this.isSystemAdmin(requesterId);
    if (!isAdmin) {
      throw new ForbiddenException(
        'Only system admin can delete admin account',
      );
    }

    const adminRole = await this.getRoleByName('admin');
    if (!adminRole) {
      throw new InternalServerErrorException('Admin role not found');
    }

    const deleted = await this.db
      .delete(schema.users)
      .where(eq(schema.users.role_id, adminRole.id))
      .returning({ id: schema.users.id });

    if (deleted.length === 0) {
      throw new ConflictException('No admin account to delete');
    }

    return { message: 'Admin account deleted' };
  }

  private async getRoleByName(name: string) {
    const [role] = await this.db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.name, name))
      .limit(1);

    return role || null;
  }

  private async isSystemAdmin(userId: string) {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .leftJoin(schema.roles, eq(schema.roles.id, schema.users.role_id))
      .where(eq(schema.users.id, userId))
      .limit(1);

    return user?.roles?.name === 'system_admin';
  }

  private async adminExists() {
    const adminRole = await this.getRoleByName('admin');
    if (!adminRole) return false;

    const [admin] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.role_id, adminRole.id))
      .limit(1);

    return !!admin;
  }
}
