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
import { TForgotPassword, TVerifyForgotOtp, TResetPassword } from './auth.interface'
import { OtpServices } from '../otp/otp.service'


const loginUser = async (payload: TLoginUser) => {
  // checking if the user is exist
  const user = await User.findOne({ email: payload.email })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'This user is not found !')
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
    email: user.email,
    role: user.role
  }

  const Token = createToken(
    jwtPayload,
    envVars.jwt_access_secret as string,
    envVars.jwt_access_expires_in as string
  )

  

  return {
    Token,
    data: user
  }
}

const forgotPassword = async (payload: TForgotPassword) => {
  const user = await User.findOne({ email: payload.email })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  const otp = await OtpServices.generateOtp(user.email)

await sendEmail(
  user.email,
  'Password Reset OTP',
  `<h2>Your OTP is ${otp}</h2><p>Valid for 5 minutes</p>`
)
  return {
    message: 'OTP sent to email'
  }
}


const verifyForgotOtp = async (payload: TVerifyForgotOtp) => {
  const isValid = await OtpServices.verifyOtp(payload.email, payload.otp)

  if (!isValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP')
  }

  return {
    message: 'OTP verified successfully'
  }
}

const resetPassword = async (payload: TResetPassword) => {
  const hashedPassword = await bcrypt.hash(payload.newPassword, 10)

  await User.updateOne(
    { email: payload.email },
    { password: hashedPassword }
  )

  return {
    message: 'Password reset successful'
  }
}

export const AuthServices = {
  loginUser,
  forgotPassword,
  verifyForgotOtp,
  resetPassword

}
