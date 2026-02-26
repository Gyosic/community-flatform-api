import { PipeTransform, BadRequestException } from '@nestjs/common';
import z from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);

      return parsedValue;
    } catch (error) {
      const errorMessage =
        error instanceof z.ZodError ? error?.message : 'Validation failed';

      throw new BadRequestException(errorMessage);
    }
  }
}
