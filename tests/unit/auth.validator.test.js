import { signupSchema, verifyOtpSchema, signinSchema } from "../../src/modules/auth/auth.validator.js"

describe("auth validators", () => {
    describe("signupSchema", () => {
        it("should pass with a valid email and password", () => {
            const result = signupSchema.safeParse({ email: "test@example.com", password: "password123" })
            expect(result.success).toBe(true)
        })

        it("should fail with an invalid email", () => {
            const result = signupSchema.safeParse({ email: "not-an-email", password: "password123" })
            expect(result.success).toBe(false)
        })

        it("should fail when password is under 8 characters", () => {
            const result = signupSchema.safeParse({ email: "test@example.com", password: "short" })
            expect(result.success).toBe(false)
        })
    })

    describe("verifyOtpSchema", () => {
        it("should pass with a valid 6-digit otp", () => {
            const result = verifyOtpSchema.safeParse({ email: "test@example.com", otp: "123456" })
            expect(result.success).toBe(true)
        })

        it("should fail when otp is not 6 digits", () => {
            const result = verifyOtpSchema.safeParse({ email: "test@example.com", otp: "123" })
            expect(result.success).toBe(false)
        })
    })

    describe("signinSchema", () => {
        it("should pass with valid email and non-empty password", () => {
            const result = signinSchema.safeParse({ email: "test@example.com", password: "anything" })
            expect(result.success).toBe(true)
        })

        it("should fail with an empty password", () => {
            const result = signinSchema.safeParse({ email: "test@example.com", password: "" })
            expect(result.success).toBe(false)
        })
    })
})