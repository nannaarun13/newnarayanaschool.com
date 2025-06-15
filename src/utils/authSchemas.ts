
import * as z from "zod";

// Enhanced validation schemas with stronger security
export const loginSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email too long." })
    .refine(
      email => {
        // Enhanced email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const hasConsecutiveDots = /\.\./.test(email);
        const startsWithDot = email.startsWith('.');
        const endsWithDot = email.endsWith('.');
        
        return emailRegex.test(email) && !hasConsecutiveDots && !startsWithDot && !endsWithDot;
      },
      { message: "Invalid email format." }
    )
    .transform(email => email.toLowerCase().trim()),
  password: z.string()
    .min(1, { message: "Password is required." })
    .max(100, { message: "Password too long." }),
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email address." })
    .max(100, { message: "Email too long." })
    .refine(
      email => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email) && email.length >= 5;
      },
      { message: "Invalid email format." }
    )
    .transform(email => email.toLowerCase().trim()),
});
