import { Model } from 'mongoose'
import { USER_ROLE } from './user.constant'


export interface TUser {
  name: string
  email: string
  profileImg?: string
  password: string
  role:  'admin' |"user" |"superAdmin"
  status: 'active' | 'blocked' | "pending"
  userName:string
}


// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserModel extends Model<TUser> {

}

export type TUserRole = keyof typeof USER_ROLE
