import { Schema, model } from 'mongoose'

const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    otp: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
)

export const Otp = model('Otp', otpSchema)
