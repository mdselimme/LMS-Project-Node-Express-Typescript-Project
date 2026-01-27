import bcrypt from 'bcrypt'
import { Otp } from './otp.model'

const generateOtp = async (email: string) => {
  // 6 digit OTP (100000 - 999999)
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  const hashedOtp = await bcrypt.hash(otp, 10)

  // remove old OTPs
  await Otp.deleteMany({ email })

  await Otp.create({
    email,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  })

  return otp
}

const verifyOtp = async (email: string, userOtp: string) => {
  const record = await Otp.findOne({ email })

  if (!record) return false
  if (record.expiresAt < new Date()) return false

  const isMatch = await bcrypt.compare(userOtp, record.otp)

  if (isMatch) {
    await Otp.deleteMany({ email })
  }

  return isMatch
}

export const OtpServices = {
  generateOtp,
  verifyOtp
}
