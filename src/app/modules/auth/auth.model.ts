import { Schema, model } from 'mongoose'
import { TOtp, OtpModel, OTPPurpose } from './auth.interface'

const OtpSchema = new Schema<TOtp, OtpModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    otpCode: {
      type: String,
      required: true,
      length: 5,
      trim: true
    },

    token: {
      type: String,
      required: true,
      trim: true
    },

    purpose: {
      type: String,
      enum: Object.values(OTPPurpose),
      required: true
    },

    used: {
      type: Boolean,
      default: false
    },

    usedToken: {
      type: String,
      trim: true
    },

    isFinished: {
      type: Boolean,
      default: false
    },

    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
)

/**
 * Auto-delete expired OTPs
 */
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Otp = model<TOtp, OtpModel>('Otp', OtpSchema)
