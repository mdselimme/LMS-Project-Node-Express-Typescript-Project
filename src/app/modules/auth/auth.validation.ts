import { z } from 'zod'

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ error: 'Email is required.' }).email({ message: 'Invalid email format.' }),
    password: z
      .string({ error: 'Password is required' })
      .min(6, { message: 'Password must be at least 6 characters long.' })
  })
})

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
})

const verifyForgotOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6)
  })
})

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    newPassword: z.string().min(6)
  })
})


export const AuthValidations = {
  loginValidationSchema,
  forgotPasswordSchema,
  verifyForgotOtpSchema,
  resetPasswordSchema
}
