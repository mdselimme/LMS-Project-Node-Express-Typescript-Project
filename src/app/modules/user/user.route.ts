import express from 'express'

import { UserControllers } from './user.controller'
import { UserValidations } from './user.validation'
import validateZodSchema from '../../middleware/validateZodSchemaRequest'

const router = express.Router()

router.post(
  '/',
  validateZodSchema(UserValidations.CreateUserValidationSchema),
  UserControllers.createUser
)


router.patch('/:id/status', UserControllers.changeUserStatus)

// change role
router.patch('/:id/role', UserControllers.changeUserRole)


export const UserRoutes = router
