import express from 'express'
import { AuthControllers } from './auth.controller'
import { AuthValidations } from './auth.validation'
import validateZodSchema from '../../middleware/validateZodSchemaRequest'


const router = express.Router()

router.post('/login', validateZodSchema(AuthValidations.loginValidationSchema), AuthControllers.loginUser)

router.post(
  '/change-password',
// TODO add auth here
  validateZodSchema(AuthValidations.changePasswordValidationSchema),
  AuthControllers.changePassword
)

router.post(
  '/refresh-token',
  validateZodSchema(AuthValidations.refreshTokenValidationSchema),
  AuthControllers.refreshToken
)

router.post(
  '/forget-password',
  validateZodSchema(AuthValidations.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword
)

router.post(
  '/reset-password',
  validateZodSchema(AuthValidations.resetPasswordValidationSchema),
  AuthControllers.resetPassword
)

export const AuthRoutes = router
