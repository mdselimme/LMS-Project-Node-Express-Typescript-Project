import bcrypt from 'bcrypt'
import httpStatus from 'http-status'
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken'
import { OTPPurpose, TLoginUser } from './auth.interface'
import { createToken, generateOTP, verifyToken } from './auth.utils'
import { User } from '../user/user.model'
import { envVars } from '../../../config/envVariable.config'
import ApiError from '../../utils/ApiError'
import isPasswordMatched from '../../utils/isPasswordMatched'
import { sendEmail } from '../../utils/sendEmail'
import { Otp } from './auth.model'


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
  const user = await User.findOne({ email: userEmail })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'This user is not found!')
  }

  if (user.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This user is deleted!')
  }

  if (user.status === 'blocked') {
    throw new ApiError(httpStatus.FORBIDDEN, 'This user is blocked!')
  }

  // Generate OTP
  const otpCode = generateOTP()

  // Expiry
  const expiresAt = new Date()
  expiresAt.setMinutes(
    expiresAt.getMinutes() +
    Number(envVars.forgot_password_time?.slice(0, -1))
  )

  // JWT token
  const token = jwt.sign(
    { email: user.email },
    envVars.jwt_forget_password_access as Secret,
    {
      expiresIn: envVars.forgot_password_time as SignOptions['expiresIn'],
    }
  )

  // Save OTP
  await Otp.create({
    userId: user._id,
    otpCode,
    token,
    purpose: OTPPurpose.RESET_PASSWORD,
    expiresAt,
    used: false,
    isFinished: false
  })

  // Send email
  await sendEmail(
    user.email,
    `Reset your password within ${envVars.forgot_password_time?.slice(0, -1)} minutes!`,
    `Hi ${user.name}, <br/><br/>
Your OTP code is: <strong>${otpCode}</strong><br/>
It will expire in <strong>${envVars.forgot_password_time?.slice(0, -1)} minutes</strong>.<br/><br/>
If you didn’t request this, please ignore this email.<br/><br/>
The LMS Team`
  )

  return { token }
}





const resetPassword = async (token: string, otpCode: string) => {
  let decoded: JwtPayload

  try {
    decoded = jwt.verify(
      token,
      envVars.jwt_forget_password_access as string
    ) as JwtPayload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP has expired!')
    }
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized!')
  }

  const email = decoded.email

  const user = await User.findOne({ email })

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found!')
  if (user.isDeleted) throw new ApiError(httpStatus.FORBIDDEN, 'User deleted!')
  if (user.status === 'blocked')
    throw new ApiError(httpStatus.FORBIDDEN, 'User blocked!')

  const otp = await Otp.findOne({
    userId: user._id,
    purpose: OTPPurpose.RESET_PASSWORD,
    token,
    used: false,
    isFinished: false
  }).sort({ createdAt: -1 })

  if (!otp) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired OTP!')
  }

  if (new Date() > otp.expiresAt) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP has expired!')
  }

  if (otp.otpCode !== otpCode) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP!')
  }

  // Create reset-password token
  const resetPasswordToken = jwt.sign(
    { email: user.email },
    envVars.jwt_reset_password_access as string,
    { expiresIn: '30min' }
  )

  // Update OTP
  otp.used = true
  otp.usedToken = resetPasswordToken
  await otp.save()

  return { token: resetPasswordToken }
}

const resetChangePassword = async (
  token: string,
  newPassword: string
) => {
  let decoded: JwtPayload

  // 1️⃣ Verify token
  try {
    decoded = jwt.verify(
      token,
      envVars.jwt_reset_password_access as string
    ) as JwtPayload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'Time expired! Please try again.'
      )
    }
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not authorized!')
  }

  const email = decoded.email

  // 2️⃣ Find user
  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!')
  }

  if (user.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is deleted!')
  }

  if (user.status === 'blocked') {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is blocked!')
  }

  // 3️⃣ Validate OTP
  const otp = await Otp.findOne({
    userId: user._id,
    purpose: OTPPurpose.RESET_PASSWORD,
    usedToken: token,
    used: true,
    isFinished: false
  }).sort({ createdAt: -1 })

  if (!otp) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'OTP has expired. Please request a new one.'
    )
  }

  // 4️⃣ Hash password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(envVars.bcrypt_salt_rounds)
  )

  // 5️⃣ Update password
  user.password = hashedPassword
  user.passwordChangedAt = new Date()
  await user.save()

  // 6️⃣ Finish OTP
  otp.isFinished = true
  await otp.save()

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
  resetChangePassword,
  refreshToken,
  forgetPassword,
  resetPassword
}
