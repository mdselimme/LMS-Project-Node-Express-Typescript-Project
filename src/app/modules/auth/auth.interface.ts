export interface TLoginUser  {
  email: string
  password: string
}

export interface TForgotPassword {
  email: string
}

export interface TVerifyForgotOtp {
  email: string
  otp: string
}

export interface TResetPassword {
  email: string
  newPassword: string
}
