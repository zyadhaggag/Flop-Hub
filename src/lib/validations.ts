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
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط"),
  email: z.string().email(),
  bio: z.string().max(255).optional(),
  avatarUrl: z.string().url().optional(),
});
