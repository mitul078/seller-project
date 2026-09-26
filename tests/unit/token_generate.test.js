process.env.JWT_ACCESS_SECRET = "test_access_secret"
process.env.JWT_REFRESH_SECRET = "test_refresh_secret"

jest.mock("../../src/shared/config/index.js", () => ({
    __esModule: true,
    default: {
        auth: {
            accessToken: "test_access_secret",
            accessTokenExpiry: "15m",
            refreshToken: "test_refresh_secret",
            refreshTokenExpiry: "7d",
        },
    },
}))

import {
    hash_token,
    generate_family_id,
    set_access_token,
    set_refresh_token,
    verify_access_token,
    verify_refresh_token,
} from "../../src/shared/utils/token_generate.js"

describe("token_generate", () => {
    const payload = { id: "user123", email: "test@example.com" }

    describe("set_access_token / verify_access_token", () => {
        it("should sign and verify a valid access token", () => {
            const token = set_access_token(payload)
            const decoded = verify_access_token(token)

            expect(decoded.id).toBe(payload.id)
            expect(decoded.email).toBe(payload.email)
            expect(decoded.type).toBe("access")
        })

        it("should reject a malformed token", () => {
            expect(() => verify_access_token("not.a.valid.token")).toThrow()
        })

        it("should reject an access token verified as a refresh token", () => {
            const accessToken = set_access_token(payload)
            expect(() => verify_refresh_token(accessToken)).toThrow()
        })
    })

    describe("set_refresh_token / verify_refresh_token", () => {
        it("should sign and verify a valid refresh token", () => {
            const token = set_refresh_token({ ...payload, family: "family-abc" })
            const decoded = verify_refresh_token(token)

            expect(decoded.id).toBe(payload.id)
            expect(decoded.family).toBe("family-abc")
            expect(decoded.type).toBe("refresh")
        })

        it("should reject a refresh token verified as an access token", () => {
            const refreshToken = set_refresh_token(payload)
            expect(() => verify_access_token(refreshToken)).toThrow()
        })
    })

    describe("hash_token", () => {
        it("should produce a consistent hash for the same input", () => {
            const token = "some-refresh-token-value"
            expect(hash_token(token)).toBe(hash_token(token))
        })

        it("should produce different hashes for different inputs", () => {
            expect(hash_token("token-a")).not.toBe(hash_token("token-b"))
        })

        it("should produce a 64-character hex string (SHA-256 HMAC output)", () => {
            const hash = hash_token("some-token")
            expect(hash).toMatch(/^[a-f0-9]{64}$/)
        })
    })

    describe("generate_family_id", () => {
        it("should generate a valid UUID", () => {
            const id = generate_family_id()
            expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        })

        it("should generate unique values on each call", () => {
            const id1 = generate_family_id()
            const id2 = generate_family_id()
            expect(id1).not.toBe(id2)
        })
    })
})