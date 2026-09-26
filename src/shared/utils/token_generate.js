import jwt from "jsonwebtoken"
import crypto from "crypto"
import env from "../config/index.js"

export function hash_token(token) {
    return crypto.createHmac("sha256", env.auth.refreshToken).update(token).digest("hex")
}

export function generate_family_id() {
    return crypto.randomUUID()
}

export function set_access_token(payload) {
    return jwt.sign({ ...payload, type: "access" }, env.auth.accessToken, {
        expiresIn: env.auth.accessTokenExpiry
    })
}

export function set_refresh_token(payload) {
    return jwt.sign({...payload , type:"refresh"}, env.auth.refreshToken, {
        expiresIn: env.auth.refreshTokenExpiry
    })
}

export function verify_refresh_token(token) {
    const decoded = jwt.verify(token, env.auth.refreshToken)
    if (decoded.type !== "refresh") {
        throw new Error("Invalid token type")
    }
    return decoded
}
export function verify_access_token(token) {
    const decoded = jwt.verify(token, env.auth.accessToken)
    if (decoded.type !== "access") {
        throw new Error("Invalid token type")
    }
    return decoded
}