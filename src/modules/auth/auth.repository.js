import { Auth, Otp, RefreshToken } from "./auth.model.js";

async function find_by_email(email) {
    return Auth.findOne({ email }).select("+password")
}

async function create_user({ email, password }) {
    return Auth.create({ email, password })
}


async function set_email_verified(email) {
    return Auth.findOneAndUpdate({ email }, { isVerified: true }, { new: true })
}

async function save_otp({ email, otp }) {
    return Otp.findOneAndUpdate({ email }, { otp }, { upsert: true, new: true })
}

async function find_otp(email) {
    return Otp.findOne({ email })
}

async function delete_otp(email) {
    return Otp.deleteOne({ email })
}

async function save_refresh_token({ userId, token, family, expiresAt }) {
    return RefreshToken.create({ userId, refreshToken: token, family, expiresAt })
}

async function find_refresh_token(token) {
    return RefreshToken.findOne({ refreshToken: token })
}

async function revoke_token(token) {
    return RefreshToken.findOneAndUpdate({ refreshToken: token }, { $set: { isRevoked: true } }, { new: true })
}

async function revoke_family(family) {
    return RefreshToken.updateMany({ family }, { $set: { isRevoked: true } })
}

export default {
    find_by_email,
    create_user,
    set_email_verified,
    save_otp,
    find_otp,
    delete_otp,
    save_refresh_token,
    find_refresh_token,
    revoke_family,
    revoke_token
}