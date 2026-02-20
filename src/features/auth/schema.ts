
import { z } from "zod";

export const updatePasswordSchema = z
    .object({
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;

export const updateEmailSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export type UpdateEmailSchema = z.infer<typeof updateEmailSchema>;
