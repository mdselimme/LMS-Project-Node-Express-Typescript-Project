import jwt, { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createToken = (jwtPayload: { userId: ObjectId; role: string }, secret: string, expiresIn: any) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn
  })
}

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload
}
