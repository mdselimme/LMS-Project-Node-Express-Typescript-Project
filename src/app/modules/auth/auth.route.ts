import express from 'express'
import { AuthControllers } from './auth.controller'
import { AuthValidations } from './auth.validation'
import validateZodSchema from '../../middleware/validateZodSchemaRequest'


const router = express.Router()

router.post('/login', validateZodSchema(AuthValidations.loginValidationSchema), AuthControllers.loginUser)

router.post(
  '/forgot-password',
  validateZodSchema(AuthValidations.forgotPasswordSchema),
  AuthControllers.forgotPassword
)

router.post(
  '/verify-otp',
  validateZodSchema(AuthValidations.verifyForgotOtpSchema),
  AuthControllers.verifyForgotOtp
)

router.post(
  '/reset-password',
  validateZodSchema(AuthValidations.resetPasswordSchema),
  AuthControllers.resetPassword
)




export const AuthRoutes = router
