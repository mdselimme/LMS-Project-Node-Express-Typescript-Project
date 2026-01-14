import bcrypt from 'bcrypt'
import httpStatus from 'http-status'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { TLoginUser } from './auth.interface'
import { createToken, verifyToken } from './auth.utils'
import { User } from '../user/user.model'
import { envVars } from '../../../config/envVariable.config'
import ApiError from '../../utils/ApiError'
import isPasswordMatched from '../../utils/isPasswordMatched'
import { sendEmail } from '../../utils/sendEmail'


const loginUser = async (payload: TLoginUser) => {
  // checking if the user is exist
  const user = await User.findOne({ email: payload.email })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'This user is not found !')
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted

  if (isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This user is deleted !')
  }

  // checking if the user is blocked/pending
  if (user?.status === 'blocked' || user?.status === 'pending') {
    throw new ApiError(httpStatus.FORBIDDEN, `This user is ${user?.status} ! !`)
  }


  //checking if the password is correct

  if (!(await isPasswordMatched(payload?.password, user.password)))
    throw new ApiError(httpStatus.FORBIDDEN, 'Password do not matched')

  //create token and sent to the  client

  const jwtPayload = {
    userId: user._id,
    role: user.role
  }

  const accessToken = createToken(
    jwtPayload,
    envVars.jwt_access_secret as string,
    envVars.jwt_access_expires_in as string
  )

  const refreshToken = createToken(
    jwtPayload,
    envVars.jwt_refresh_secret as string,
    envVars.jwt_refresh_expires_in as string
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
    throw new ApiError(httpStatus.NOT_FOUND, 'This user is not found !')
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted

  if (isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This user is deleted !')
  }

  // checking if the user is blocked
  const userStatus = user?.status

  if (userStatus === 'blocked') {
    throw new ApiError(httpStatus.FORBIDDEN, 'This user is blocked ! !')
  }

  const jwtPayload = {
    userId: user._id,
    role: user.role
  }

  const resetToken = createToken(jwtPayload, envVars.jwt_forget_password_access as string, envVars.forgot_password_time as string)

  const resetUILink = `${envVars.FROENT_END_LINK}/auth/reset-password?id=${user._id}&token=${resetToken} `
  await sendEmail(
    user.email,
    `Reset your password within ${envVars.forgot_password_time?.slice(0, -1)} minutes!`,
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

This link will expire in <strong>${envVars.forgot_password_time?.slice(0, -1)} minutes</strong>. <br/><br/>

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
    throw new ApiError(httpStatus.NOT_FOUND, 'This user is not found !')
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted

  if (isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This user is deleted !')
  }

  const decoded = jwt.verify(token, envVars.jwt_forget_password_access as string) as JwtPayload

  //localhost:3000?id=A-0001&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJBLTAwMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDI4NTA2MTcsImV4cCI6MTcwMjg1MTIxN30.-T90nRaz8-KouKki1DkCSMAbsHyb9yDi0djZU3D6QO4

  if (payload.id !== decoded.userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are forbidden!')
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(payload.newPassword, Number(envVars.bcrypt_salt_rounds))

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
    throw new ApiError(httpStatus.NOT_FOUND, 'This user is not found!')
  }

  if (user.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This user is deleted!')
  }

  if (user.status === 'blocked') {
    throw new ApiError(httpStatus.FORBIDDEN, 'This user is blocked!')
  }

  // Verify old password
  const isMatched = await isPasswordMatched(payload.oldPassword, user.password)
  if (!isMatched) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Password does not match!')
  }

  // Hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(envVars.bcrypt_salt_rounds)
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
  const decoded = verifyToken(token, envVars.jwt_refresh_secret as string)

  const { userId, } = decoded

  // checking if the user is exist
  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'This user is not found !')
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted

  if (isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This user is deleted !')
  }

  // checking if the user is blocked
  const userStatus = user?.status

  if (userStatus === 'blocked') {
    throw new ApiError(httpStatus.FORBIDDEN, 'This user is blocked ! !')
  }


  const jwtPayload = {
    userId: user._id,
    role: user.role
  }

  const accessToken = createToken(
    jwtPayload,
    envVars.jwt_access_secret as string,
    envVars.jwt_access_expires_in as string
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
