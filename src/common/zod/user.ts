import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string(),
  password: z.string('필수 입력값 입니다.'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[#?!@$%^&*-])[^\s]{9,}$/;

export const signupSchema = z.object({
  email: z.string(),
  name: z.string().max(20, '표시이름은 최대 20글자입니다'),
  password: z
    .string()
    .min(9, '비밀번호는 최소 9자 이상이어야 합니다.')
    .regex(
      passwordRegex,
      '영문자, 숫자, 특수문자(#?!@$%^&*-) 조합인 비밀번호만 생성 가능합니다.',
    ),
  passwordConfirm: z.string(),
});

export type SignupDto = z.infer<typeof signupSchema>;
