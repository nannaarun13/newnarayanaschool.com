
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const admissionInquirySchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  classApplied: z.string().min(1, 'Class applied for is required'),
  presentClass: z.string().min(1, 'Present class is required'),
  previousClass: z.string().optional(),
  previousSchool: z.string().optional(),
  fatherName: z.string().min(1, 'Father name is required'),
  motherName: z.string().min(1, 'Mother name is required'),
  primaryContact: z.string().regex(/^\+91[6-9]\d{9}$/, 'Please enter a valid Indian mobile number with +91'),
  secondaryContact: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  additionalInfo: z.string().optional(),
});

export const contactInfoSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Please enter a valid Indian mobile number with +91'),
});

export const adminRegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Please enter a valid Indian mobile number with +91'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
