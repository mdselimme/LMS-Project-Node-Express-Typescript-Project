export interface TLoginUser  {
  email: string
  password: string
}
import { Model, Types } from 'mongoose'

export enum OTPPurpose {
  RESET_PASSWORD = 'reset_password',
  CREATE_ACCOUNT = 'create_account',
}

export interface TOtp {
  userId: Types.ObjectId
  otpCode: string
  token: string
  purpose: OTPPurpose
  used: boolean
  usedToken?: string
  isFinished: boolean
  expiresAt: Date
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OtpModel extends Model<TOtp> {}
