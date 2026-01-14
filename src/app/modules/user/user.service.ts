/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcrypt"
import { User, } from './user.model'
import { envVars } from '../../../config/envVariable.config'
import ApiError from "../../utils/ApiError"

export const createUser = async (payload: any) => {

  // Check if email already exists
  const isUserExists = await User.findOne({ email: payload.email });
  if (isUserExists) {
    throw new ApiError(400, 'User already exists. Please login.');
  }

  // Hash password
  const saltRounds = Number(envVars.bcrypt_salt_rounds);

  if (Number.isNaN(saltRounds)) {
    throw new Error('Invalid BCRYPT_SALT_ROUNDS value');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    saltRounds,
  );

  // Create user
  const [authUser] = await User.create([
    {
      name: payload.name,
      userName: payload.userName,
      email: payload.email,
      password: hashedPassword,
      role: 'user',
      status: 'active',
    },
  ]);

  return authUser;
};





/** Change a user's status (active | blocked | pending) */
const changeUserStatus = async (userId: string, status: 'active' | 'blocked' | 'pending'): Promise<void> => {
  const ALLOWED_STATUS = new Set(['active', 'blocked', 'pending'])

  if (!ALLOWED_STATUS.has(status)) {
    throw new ApiError(400, `Invalid status. Allowed statuses: ${[...ALLOWED_STATUS].join(', ')}`)
  }

  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  if (user.status === status) {
    throw new ApiError(400, `User is already in '${status}' status`)
  }

  user.status = status
  await user.save()


}

/** Change a user's role (admin | user) */
const changeUserRole = async (userId: string, role: 'admin' | "user"): Promise<void> => {
  const ALLOWED_ROLES = new Set(['admin', 'user'])

  if (!ALLOWED_ROLES.has(role)) {
    throw new ApiError(400, `Invalid role. Allowed roles: ${[...ALLOWED_ROLES].join(', ')}`)
  }

  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  if (user.role === role) {
    throw new ApiError(400, `User already has the role '${role}'`)
  }

  user.role = role
  await user.save()

}





export const UserServices = {
  createUser,
  changeUserStatus,
  changeUserRole

}
