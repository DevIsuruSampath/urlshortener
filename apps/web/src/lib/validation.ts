import { z } from "zod";

// Common validation patterns
export const urlSchema = z.string().url({ message: "Please enter a valid URL." });
export const emailSchema = z.string().email({ message: "Please enter a valid email address." });
export const passwordSchema = z.string().min(8, { message: "Password must be at least 8 characters." });

// Link creation/editing
export const linkSchema = z.object({
  destination: urlSchema,
  customAlias: z.string()
    .min(3, { message: "Custom alias must be at least 3 characters." })
    .max(50, { message: "Custom alias cannot exceed 50 characters." })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "Custom alias can only contain letters, numbers, hyphens, and underscores." })
    .optional(),
  tier: z.enum(["free", "premium"]).default("free"),
});

export type LinkFormValues = z.infer<typeof linkSchema>;

// Authentication
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema.optional(),
  recovery_code: z.string().min(6, { message: "Recovery code must be at least 6 characters." }).optional(),
}).refine(
  (data) => data.password || data.recovery_code,
  {
    message: "Either password or recovery code is required.",
    path: ["password"],
  }
);

export type LoginFormValues = z.infer<typeof loginSchema>;

// Password change
export const changePasswordSchema = z.object({
  current_password: passwordSchema,
  new_password: passwordSchema,
  confirm_password: passwordSchema,
}).refine(
  (data) => data.new_password === data.confirm_password,
  {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  }
);

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// Admin setup (initial configuration)
export const setupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirm_password: passwordSchema,
}).refine(
  (data) => data.password === data.confirm_password,
  {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  }
);

export type SetupFormValues = z.infer<typeof setupSchema>;

// Settings
export const settingsSchema = z.object({
  site_name: z.string().min(1, { message: "Site name is required." }).max(100),
  site_description: z.string().max(500).optional(),
  contact_email: emailSchema.optional(),
  default_redirect_url: urlSchema.optional(),
  enable_captcha: z.boolean().default(true),
  rate_limit_per_ip: z.number().min(1).max(1000).default(100),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

// Utility functions
export function validateUrl(url: string): boolean {
  try {
    urlSchema.parse(url);
    return true;
  } catch {
    return false;
  }
}

export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validatePassword(password: string): boolean {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
}