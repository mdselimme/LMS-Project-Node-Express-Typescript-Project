


export interface IJwtTokenPayload {
    userId: string;
    role: string
    email: string
    fullName: string
    iat: number
    exp: number
}
