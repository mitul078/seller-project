import authService from "./auth.service.js"
import ApiResponse from "../../shared/utils/api_response.js"

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

export const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const user = await authService.signup({ email, password })
        return res.status(201).json(new ApiResponse(user, "SIGNUP DONE"))
    } catch (error) {
        next(error)
    }
}

export const verify_otp = async (req, res, next) => {
    try {
        const { email, otp } = req.body
        const result = await authService.verify_otp({ email, otp })
        return res.status(200).json(new ApiResponse(result, "VERIFICATION DONE"))
    } catch (error) {
        next(error)
    }
}

export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const { refresh_token, access_token, user } = await authService.signin({ email, password })

        res.cookie("refreshToken", refresh_token, REFRESH_COOKIE_OPTIONS)
        return res.status(200).json(new ApiResponse({ user, access_token }, "LOGIN SUCCESSFUL"))
    } catch (error) {
        next(error)
    }
}

export const rotate_refresh_token = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken
        const { access_token, refresh_token } = await authService.rotate_refresh_token(token)

        res.cookie("refreshToken", refresh_token, REFRESH_COOKIE_OPTIONS)
        return res.status(200).json(new ApiResponse({ access_token }, "TOKEN REFRESHED"))
    } catch (error) {
        next(error)
    }
}

export const signout = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken
        await authService.signout(token)
        res.clearCookie("refreshToken")

        return res.status(200).json(new ApiResponse(null, "SIGNOUT SUCCESSFUL"))
    } catch (error) {
        next(error)
    }
}