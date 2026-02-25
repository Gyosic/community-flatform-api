import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string(),
  password: z.string('필수 입력값 입니다.'),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  email: z.string().refine(async () => {}),
  name: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
});

export type SignupDto = z.infer<typeof signupSchema>;
