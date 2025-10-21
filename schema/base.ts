
import { z } from "zod";

export const usernameSchema = z
    .string()
    .min(5, "Tên đăng nhập phải có ít nhất 5 ký tự");

export const passwordSchema = z
    .string()
    .min(6, "Mật khẩu phải ít nhất 6 ký tự")
    .max(50, "Mật khẩu quá dài");

export const emailSchema = z
    .email("Email không hợp lệ");

export const dateOfBirthSchema = z
    .date()
    .min(new Date("1900-01-01"))
    .max(new Date(), "Ngày sinh không hợp lệ");
