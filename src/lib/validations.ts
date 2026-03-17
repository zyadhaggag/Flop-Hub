import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(2, "العنوان قصير جداً").max(500),
  story: z.string().min(5, "القصة قصيرة جداً"),
  lesson: z.string().min(3, "الدرس المستفاد قصير جداً"),
  imageUrl: z.string().url("رابط الصورة غير صالح").optional().or(z.literal("")).or(z.null()),
  tags: z.array(z.string()).default([]),
});

export type PostInput = z.infer<typeof postSchema>;

export const userSchema = z.object({
  username: z.string()
    .min(3, "اسم المستخدم يجب أن لا يقل عن 3 أحرف")
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/, "اسم المستخدم يجب أن يحتوي على أحرف، أرقام، _ أو . فقط"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن لا تقل عن 8 أحرف"),
  name: z.string().min(3, "الاسم الكامل يجب أن لا يقل عن 3 أحرف"),
  bio: z.string().max(255).optional(),
  avatarUrl: z.string().url().optional(),
});
