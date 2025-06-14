
import * as z from "zod";
import { sanitizeEmail } from '../inputSanitization';

// Enhanced validation schemas with stronger security
export const loginSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email too long." })
    .refine(
      email => {
        try {
          sanitizeEmail(email);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid email format." }
    )
    .transform(email => {
      try {
        return sanitizeEmail(email);
      } catch {
        throw new Error("Invalid email format");
      }
    }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(100, { message: "Password too long." })
    .refine(
      password => {
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        return hasUpper && hasLower && hasNumber && hasSpecial;
      },
      { message: "Password must contain uppercase, lowercase, number, and special character." }
    ),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email too long." })
    .refine(
      email => {
        try {
          sanitizeEmail(email);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid email format." }
    )
    .transform(email => {
      try {
        return sanitizeEmail(email);
      } catch {
        throw new Error("Invalid email format");
      }
    }),
});
