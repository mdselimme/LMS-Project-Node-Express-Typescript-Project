import { z } from 'zod'

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ error: 'Email is required.' }).email({ message: 'Invalid email format.' }),
    password: z
      .string({ error: 'Password is required' })
      .min(6, { message: 'Password must be at least 6 characters long.' })
  })
})

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      error: 'Old password is required'
    }),
    newPassword: z
      .string({ error: 'Password is required' })
      .min(6, { message: 'Password must be at least 6 characters long.' })
  })
})

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      error: 'Refresh token is required!'
    })
  })
})

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z
      .string({
        error: 'Email is required!'
      })
      .email({ message: 'Invalid email format.' })
  })
})

const resetPasswordValidationSchema = z.object({
  body: z.object({
    id: z.string({
      error: 'User id is required!'
    }),
    newPassword: z
      .string({
        error: 'User password is required!'
      })
      .min(6, { message: 'Password must be at least 6 characters long.' })
  })
})

export const AuthValidations = {
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema
}
