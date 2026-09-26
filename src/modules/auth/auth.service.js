
import authRepository from "./auth.repository.js"
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../../shared/errors/index.js"
import bcrypt from "bcrypt"
import generate_otp from "../../shared/utils/otp_generate.js"
import { otp_template } from "../../infra/mail/templates/otp.js"
import { generate_family_id, hash_token, set_access_token, set_refresh_token, verify_refresh_token } from "../../shared/utils/token_generate.js"
import { email_queue } from "../../infra/queues/queues.js"


async function signup({ email, password }) {
    const existing_user = await authRepository.find_by_email(email)
    if (existing_user) {
        throw new ConflictError("EMAIL ALREADY EXISTS")
    }

    const hash_password = await bcrypt.hash(password, 10)
    const user = await authRepository.create_user({ email, password: hash_password })

    const otp = generate_otp()
    console.log("OTP IS:", otp)
    const hash_otp = await bcrypt.hash(String(otp), 10)
    await authRepository.save_otp({ email, otp: hash_otp })

    await email_queue.add("sent-otp", {
        to: email,
        subject: "VERIFY YOUR ACCOUNT",
        html: otp_template(otp)
    })

    return { id: user._id, email: user.email }
}

async function verify_otp({ email, otp }) {
    const otp_record = await authRepository.find_otp(email)
    if (!otp_record) {
        throw new NotFoundError("OTP NOT FOUND")
    }

    const decode_otp = await bcrypt.compare(String(otp), otp_record.otp)
    if (!decode_otp) {
        throw new ValidationError("INVALID OTP")
    }

    await authRepository.set_email_verified(email)
    await authRepository.delete_otp(email)

    return { message: "VERIFICATION DONE" }
}

async function signin({ email, password }) {
    const user = await authRepository.find_by_email(email)
    if (!user) throw new UnauthorizedError("INVALID CREDENTIALS")
    if (!user.isVerified) throw new UnauthorizedError("VERIFIED YOUR EMAIL ID FIRST")

    const is_match = await bcrypt.compare(password, user.password)
    if (!is_match) throw new UnauthorizedError("INVALID CREDENTIALS")

    const family = generate_family_id()
    const payload = { id: user._id, email: user.email }

    const access_token = set_access_token(payload)
    const refresh_token = set_refresh_token({ ...payload, family })

    await authRepository.save_refresh_token({
        userId: user._id,
        token: hash_token(refresh_token),
        family,
        expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
    })

    return { user: { id: user._id, email: user.email }, access_token, refresh_token }

}

async function rotate_refresh_token(token) {
    let decoded

    try {

        decoded = await verify_refresh_token(token)

    } catch (error) {
        throw new UnauthorizedError("INVALID TOKEN")

    }

    const hashToken = hash_token(token)
    const stored_token = await authRepository.find_refresh_token(hashToken)
    if (!stored_token) {
        throw new UnauthorizedError("INVALID TOKEN")
    }

    if (stored_token.isRevoked) {
        await authRepository.revoke_family(stored_token.family)
        throw new UnauthorizedError("PLEASE SIGN IN AGAIN")
    }

    await authRepository.revoke_token(hashToken)
    const user = await authRepository.find_by_email(decoded.email)
    if (!user) throw new NotFoundError("USER NOT FOUND")

    const payload = { id: user._id, email: user.email }
    const access_token = set_access_token(payload)
    const refresh_token = set_refresh_token({ ...payload, family: stored_token.family })

    await authRepository.save_refresh_token({
        userId: user._id,
        token: hash_token(refresh_token),
        family: stored_token.family,
        expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
    })

    return { user: payload, access_token, refresh_token }


}

async function signout(token) {
    const hashToken = hash_token(token)
    await authRepository.revoke_token(hashToken)
    return { message: "SIGNOUT SUCCESSFUL" }
}

export default {
    signup,
    verify_otp,
    signin,
    rotate_refresh_token,
    signout
}