import { z } from 'zod'

export const LoginBody = z
  .object({
    // Trim before validating: mobile keyboards often append a space after an autocompleted address.
    email: z.string().trim().toLowerCase().max(200).pipe(z.email()),
    password: z.string().min(1).max(200),
  })
  .meta({ id: 'LoginBody' })

export const AdminUserSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    lastLoginAt: z.string().nullable(),
  })
  .meta({ id: 'AdminUser' })

export const SessionSchema = z
  .object({
    user: AdminUserSchema,
    accessTokenExpiresAt: z.string(),
  })
  .meta({ id: 'AdminSession' })

export const ChangePasswordBody = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z
      .string()
      .min(12, 'Use at least 12 characters')
      .max(200)
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
  })
  .meta({ id: 'ChangePasswordBody' })

/** Details for the signed-in administrator's own account. */
export const UpdateProfileBody = z
  .object({
    name: z.string().trim().min(1, 'Enter your name').max(120),
    email: z.string().trim().toLowerCase().max(200).pipe(z.email()),
  })
  .meta({ id: 'UpdateProfileBody' })
