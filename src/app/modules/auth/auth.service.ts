import bcrypt from 'bcrypt'
import httpStatus from 'http-status'
import jwt, { JwtPayload } from 'jsonwebtoken'
import config from '../../config'
import AppError from '../../errors/AppError'
import { sendEmail } from '../../utils/sendEmail'

import { TLoginUser } from './auth.interface'
import { createToken, verifyToken } from './auth.utils'
import isPasswordMatched from '../../helpers/auth/isPasswordMatched'
import { User } from '../user/user.model'
import { isJWTIssuedBeforeOtherDevicesLogOutAt } from '../../utils/isJWTIssuedBeforeOtherDevicesLogOutAt'


const loginUser = async (payload: TLoginUser) => {
  // checking if the user is exist
  const user = await User.findOne({ email: payload.email })

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !')
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !')
  }

  // checking if the user is blocked/pending
  if (user?.status === 'blocked' || user?.status === 'pending') {
    throw new AppError(httpStatus.FORBIDDEN, `This user is ${user?.status} ! !`)
  }


  //checking if the password is correct

  if (!(await isPasswordMatched(payload?.password, user.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched')

  //create token and sent to the  client

  const jwtPayload = {
    userId: user._id,
    role: user.role
  }

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  )

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  )

  return {
    accessToken,
    refreshToken,
    userId: user._id,
    role: user.role
  }
}



const forgetPassword = async (userEmail: string) => {
  // checking if the user is exist
  const user = await User.findOne({ email: userEmail })

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !')
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !')
  }

  // checking if the user is blocked
  const userStatus = user?.status

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !')
  }

  const jwtPayload = {
    userId: user._id,
    role: user.role
  }

  const resetToken = createToken(jwtPayload, config.jwt_forget_password_access as string, config.forgot_password_time as string)

  const resetUILink = `${config.front_end_link}/auth/reset-password?id=${user._id}&token=${resetToken} `
  await sendEmail(
    user.email,
    `Reset your password within ${config.forgot_password_time?.slice(0, -1)} minutes!`,
    `Hi ${user.name}, <br/><br/>

You recently requested to reset your password. <br/><br/>

To reset your password, please click the link below: <br/><br/>

<a href="${resetUILink}" 
   style="
     display: inline-block;
     padding: 10px 20px;
     background-color: #007bff;
     color: #ffffff;
     text-decoration: none;
     border-radius: 5px;
     font-weight: bold;
   ">
   Reset Password
</a>

<br/><br/>

If the button above doesn’t work, copy and paste this link into your browser: <br/>
<a href="${resetUILink}" style="color: #007bff;">${resetUILink}</a>
<br/><br/>

This link will expire in <strong>${config.forgot_password_time?.slice(0, -1)} minutes</strong>. <br/><br/>

If you didn't request this, you can safely ignore this email. <br/><br/><br/>

Best regards, <br/>
The Banglaversity Team`
  )
  return null
}




const resetPassword = async (payload: { id: string; newPassword: string }, token: string) => {
  // checking if the user is exist
  const user = await User.findById(payload.id)
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !')
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !')
  }

  const decoded = jwt.verify(token, config.jwt_forget_password_access as string) as JwtPayload

  //localhost:3000?id=A-0001&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJBLTAwMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDI4NTA2MTcsImV4cCI6MTcwMjg1MTIxN30.-T90nRaz8-KouKki1DkCSMAbsHyb9yDi0djZU3D6QO4

  if (payload.id !== decoded.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!')
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_rounds))

  await User.findOneAndUpdate(
    {
      _id: decoded.userId,
      role: decoded.role
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date()
    }
  )
}


const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string; otherDevicesLogOut?: boolean }
) => {
  // Check if the user exists
  const user = await User.findById(userData.userId)

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!')
  }

  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!')
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!')
  }

  // Verify old password
  const isMatched = await isPasswordMatched(payload.oldPassword, user.password)
  if (!isMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password does not match!')
  }

  // Hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  )

  // Prepare update object

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {
    password: newHashedPassword,
    passwordChangedAt: new Date(),
    ...(payload.otherDevicesLogOut && { otherDevicesLogOut: new Date() })
  }

  await User.findOneAndUpdate(
    { _id: user._id, role: user.role },
    updateData
  )

  return null
}



const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string)

  const { userId, iat } = decoded

  // checking if the user is exist
  const user = await User.findById(userId)

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !')
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !')
  }

  // checking if the user is blocked
  const userStatus = user?.status

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !')
  }

  if (user.otherDevicesLogOutAt && isJWTIssuedBeforeOtherDevicesLogOutAt(user.otherDevicesLogOutAt, iat as number)) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !')
  }

  const jwtPayload = {
    userId: user._id,
    role: user.role
  }

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  )

  return {
    accessToken
  }
}



export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword
}
