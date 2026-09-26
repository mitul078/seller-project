import authRepository from "./auth.repository.js"
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../../shared/errors/index.js"
import bcrypt from "bcrypt"
import generate_otp from "../../shared/utils/otp_generate.js"
import { otp_template } from "../../infra/mail/templates/otp.js"
import {
    generate_family_id,
    hash_token,
    set_access_token,
    set_refresh_token,
    verify_refresh_token,
} from "../../shared/utils/token_generate.js"
import { email_queue } from "../../infra/queues/queues.js"

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

async function issue_tokens(user, family) {
    const payload = { id: user._id, email: user.email }
    const access_token = set_access_token(payload)
    const refresh_token = set_refresh_token({ ...payload, family })

    await authRepository.save_refresh_token({
        userId: user._id,
        token: hash_token(refresh_token),
        family,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    })

    return { access_token, refresh_token }
}

async function signup({ email, password }) {
    const existing_user = await authRepository.find_by_email(email)

    if (existing_user && existing_user.isVerified) {
        throw new ConflictError("EMAIL ALREADY EXISTS")
    }

    let user = existing_user
    if (!user) {
        const hash_password = await bcrypt.hash(password, 10)
        user = await authRepository.create_user({ email, password: hash_password })
    }

    const otp = generate_otp()
    if (process.env.NODE_ENV !== "production") {
        console.log("OTP IS:", otp)
    }

    const hash_otp = await bcrypt.hash(String(otp), 10)
    await authRepository.save_otp({ email, otp: hash_otp })

    await email_queue.add("sent-otp", {
        to: email,
        subject: "VERIFY YOUR ACCOUNT",
        html: otp_template(otp),
    })

    return { id: user._id, email: user.email }
}

async function verify_otp({ email, otp }) {
    const otp_record = await authRepository.find_otp(email)
    if (!otp_record) {
        throw new NotFoundError("OTP NOT FOUND OR EXPIRED")
    }

    const is_match = await bcrypt.compare(String(otp), otp_record.otp)
    if (!is_match) {
        throw new ValidationError("INVALID OTP")
    }

    await authRepository.set_email_verified(email)
    await authRepository.delete_otp(email)

    return { message: "VERIFICATION DONE" }
}

async function signin({ email, password }) {
    const user = await authRepository.find_by_email(email)
    if (!user) throw new UnauthorizedError("INVALID CREDENTIALS")
    if (!user.isVerified) throw new UnauthorizedError("VERIFY YOUR EMAIL FIRST")

    const is_match = await bcrypt.compare(password, user.password)
    if (!is_match) throw new UnauthorizedError("INVALID CREDENTIALS")

    const family = generate_family_id()
    const { access_token, refresh_token } = await issue_tokens(user, family)

    return { user: { id: user._id, email: user.email }, access_token, refresh_token }
}

async function rotate_refresh_token(token) {
    if (!token) throw new UnauthorizedError("NO REFRESH TOKEN PROVIDED")

    let decoded
    try {
        decoded = await verify_refresh_token(token)
    } catch (error) {
        throw new UnauthorizedError("INVALID OR EXPIRED TOKEN")
    }

    const hashed_token = hash_token(token)
    const stored_token = await authRepository.find_refresh_token(hashed_token)
    if (!stored_token) {
        throw new UnauthorizedError("INVALID TOKEN")
    }

    if (stored_token.isRevoked) {
        await authRepository.revoke_family(stored_token.family)
        throw new UnauthorizedError("SESSION COMPROMISED — PLEASE SIGN IN AGAIN")
    }

    const [, user] = await Promise.all([
        authRepository.revoke_token(hashed_token),
        authRepository.find_by_id(decoded.id),
    ])

    if (!user) throw new NotFoundError("USER NOT FOUND")

    const { access_token, refresh_token } = await issue_tokens(user, stored_token.family)

    return { user: { id: user._id, email: user.email }, access_token, refresh_token }
}

async function signout(token) {
    if (!token) return { message: "SIGNOUT SUCCESSFUL" }

    const hashed_token = hash_token(token)
    await authRepository.revoke_token(hashed_token)
    return { message: "SIGNOUT SUCCESSFUL" }
}

export default {
    signup,
    verify_otp,
    signin,
    rotate_refresh_token,
    signout,
}