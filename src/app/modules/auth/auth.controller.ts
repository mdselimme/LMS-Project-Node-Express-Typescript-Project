import httpStatus from 'http-status'
import catchAsync from '../../utils/catchAsync'
import { AuthServices } from './auth.service'
import ApiError from '../../utils/ApiError'
import sendResponse from '../../utils/sendResponse'


const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body)

   sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is logged in successfully!',
    data: result
  })
})

const forgotPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgotPassword(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent to email",
    data: result
  })
})

const verifyForgotOtp = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyForgotOtp(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP verified successfully",
    data: result
  })
})

const resetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.resetPassword(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successful",
    data: result
  })
})


export const AuthControllers = {
  loginUser,
  forgotPassword,
  verifyForgotOtp,
  resetPassword
 
}
