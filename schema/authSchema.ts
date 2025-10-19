// 🧱 authSchemas.ts
import { z } from "zod";
import {dateOfBirthSchema, emailSchema, passwordSchema, usernameSchema} from "@/schema/base";



export const changePasswordSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});
export const emailInputSchema = z.object({
    email: emailSchema,
});
export const signUpSchema = z.object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    fullName: z.string(),
    email: emailSchema,
    dateOfBirth: dateOfBirthSchema,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

export const signInSchema = z.object({
    username: usernameSchema,
    password: passwordSchema,
});
