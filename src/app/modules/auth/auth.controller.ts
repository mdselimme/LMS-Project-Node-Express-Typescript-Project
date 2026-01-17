import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { AuthServices } from './auth.service'
import ApiError from '../../utils/ApiError'
import sendResponse from '../../utils/sendResponse'


const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body)


  // res.cookie('refreshToken', refreshToken, {
  //   secure: config.NODE_ENV === 'production',
  //   httpOnly: true,
  //   sameSite: 'none',
  //   maxAge: eval(config.refresh_token_cookie_expires_in as string)
  // })

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is logged in successfully!',
    data: result
  })
})


const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies
  const result = await AuthServices.refreshToken(refreshToken)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: result
  })
})


const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email is required')
  }

  const result = await AuthServices.forgetPassword(email)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP has been successfully sent to your email.',
    data: result
  })
})



const resetPassword = catchAsync(async (req, res) => {
  const { token, otp } = req.body

  if (!token || !otp) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Token and OTP are required'
    )
  }

  const result = await AuthServices.resetPassword(token, otp)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP confirmed successfully!',
    data: result
  })
})

/**
 * RESET PASSWORD (FINAL STEP)
 */
const resetChangePassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body

  if (!token) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not authorized!'
    )
  }

  if (!newPassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'New password is required'
    )
  }

  const result = await AuthServices.resetChangePassword(
    token,
    newPassword
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully. Please login.',
    data: result
  })
})
export const AuthControllers = {
  loginUser,
  refreshToken,
  forgetPassword,
  resetPassword,
  resetChangePassword
}
