import { PipeTransform, BadRequestException } from '@nestjs/common';
import z from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      throw new BadRequestException({ message: '입력값 검증 실패', errors });
    }

    return result.data;
  }
}
