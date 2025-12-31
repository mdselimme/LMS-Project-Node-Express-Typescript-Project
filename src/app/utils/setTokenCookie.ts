import { Response } from "express";

export interface IAuthToken {
    accessToken?: string;
    refreshToken?: string;
}

//Set Token in Cookie
export const setTokenAuthCookie = (res: Response, tokenInfo: IAuthToken) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24,
        })
    }
    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 30,
        })
    }
};