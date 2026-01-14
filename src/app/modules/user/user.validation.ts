import { z } from 'zod'

const CreateUserValidationSchema =  z.object({
  body:z.object({
  name: z
    .string({ error: 'Full name is required.' })
    .min(2, { message: 'Full name must be at least 2 characters long.' }),

  userName: z
    .string({ error: 'Username is required.' })
    .min(3, { message: 'Username must be at least 3 characters long.' }),

  email: z
    .string({ error: 'Email is required.' })
    .email({ message: 'Invalid email format.' }),

  password: z
    .string({ error: 'Password is required.' })
    .min(6, { message: 'Password must be at least 6 characters long.' }),

  profileImg: z.string().optional(),
})
})


export const UserValidations = { CreateUserValidationSchema }
