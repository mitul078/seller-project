import { verify_access_token } from "../utils/token_generate.js"
import { UnauthorizedError } from "../errors/error_types.js"

export default function authenticate(req, res, next) {
    const auth_header = req.headers.authorization
    if (!auth_header?.startsWith("Bearer ")) {
        return next(new UnauthorizedError("SIGN IN TO ACCESS RESOURCES"))
    }

    const token = auth_header.split(" ")[1]
    if (!token) {
        return next(new UnauthorizedError("SIGN IN TO ACCESS RESOURCES"))
    }

    try {
        const decoded = verify_access_token(token)
        req.user = decoded
        next()
    } catch (error) {
        next(new UnauthorizedError("INVALID TOKEN, PLEASE SIGN IN AGAIN"))
    }
}