/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose'

import { UserStatus } from './user.constant'
import { TUser, UserModel } from './user.interface'

const UserSchema = new Schema<TUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true
    },
    userName: {
      type: String,
      required: [true, 'UserName is required.'],
      trim: true,
      unique: true
    },

    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true
    },
    profileImg: {
      type: String
    },

    password: {
      type: String,
      required: [true, 'Password is required.']
    },
    role: {
      type: String,
      enum: ['admin', 'user','superAdmin'],
      default: 'user'
    },

    status: {
      type: String,
      enum: UserStatus,
      required: [true, 'status is required.']
    },

    passwordChangedAt: {
      type: Date
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)


export const User = model<TUser, UserModel>('User', UserSchema)


