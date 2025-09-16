import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .email('รูปแบบอีเมลไม่ถูกต้อง')
  .min(1, 'กรุณากรอกอีเมล');

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
  .regex(/[A-Z]/, 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว')
  .regex(/[a-z]/, 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว')
  .regex(/[0-9]/, 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว');

// Display name validation schema
export const displayNameSchema = z
  .string()
  .min(2, 'ชื่อแสดงต้องมีอย่างน้อย 2 ตัวอักษร')
  .max(50, 'ชื่อแสดงต้องไม่เกิน 50 ตัวอักษร')
  .regex(/^[a-zA-Z0-9ก-๙\s]+$/, 'ชื่อแสดงสามารถใช้ได้เฉพาะตัวอักษร ตัวเลข และช่องว่าง');

// Registration form schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  displayName: displayNameSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

// Password reset schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// Profile update schema
export const profileUpdateSchema = z.object({
  displayName: displayNameSchema,
  bio: z.string().max(500, 'ข้อมูลส่วนตัวต้องไม่เกิน 500 ตัวอักษร').optional(),
});

// Password strength checker
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  strength: 'weak' | 'medium' | 'strong';
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('ต้องมีอย่างน้อย 8 ตัวอักษร');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('ต้องมีตัวอักษรพิมพ์ใหญ่');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('ต้องมีตัวอักษรพิมพ์เล็ก');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('ต้องมีตัวเลข');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('ควรมีอักขระพิเศษ');

  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) strength = 'weak';
  else if (score <= 3) strength = 'medium';
  else strength = 'strong';

  return { score, feedback, strength };
};

// SQL injection detection (for educational purposes)
export const detectSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/)/,
    /(\bOR\b.*=.*\bOR\b)/i,
    /(\bAND\b.*=.*\bAND\b)/i,
    /(1=1|1=0)/,
    /(\bUNION\b.*\bSELECT\b)/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
};

// XSS detection (for educational purposes)
export const detectXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
};