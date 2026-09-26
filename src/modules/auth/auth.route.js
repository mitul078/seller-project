import { Router } from "express"
import { rotate_refresh_token, signin, signout, signup, verify_otp } from "./auth.controller.js"
import { validate } from "../../shared/middlewares/validate.js"
import { signupSchema, verifyOtpSchema, signinSchema } from "./auth.validator.js"
import rateLimit from "express-rate-limit"

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
})

const router = Router()

router.post("/signup", authLimiter, validate(signupSchema), signup)
router.post("/verify-otp", authLimiter, validate(verifyOtpSchema), verify_otp)
router.post("/signin", authLimiter, validate(signinSchema), signin)
router.post("/refresh", rotate_refresh_token)
router.post("/signout", signout)

export default router