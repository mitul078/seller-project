jest.mock("../../src/shared/utils/token_generate.js", () => ({
    verify_access_token: jest.fn(),
}))

import authenticate from "../../src/shared/middlewares/authenticate.js"
import { verify_access_token } from "../../src/shared/utils/token_generate.js"

function buildRes() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    }
}

describe("authenticate middleware", () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should call next with UnauthorizedError when no Authorization header is present", () => {
        const req = { headers: {} }
        const res = buildRes()
        const next = jest.fn()

        authenticate(req, res, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(next.mock.calls[0][0].message).toMatch(/sign in/i)
    })

    it("should call next with UnauthorizedError when header doesn't start with 'Bearer '", () => {
        const req = { headers: { authorization: "Basic sometoken" } }
        const res = buildRes()
        const next = jest.fn()

        authenticate(req, res, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(next.mock.calls[0][0].message).toMatch(/sign in/i)
    })

    it("should attach decoded user and call next() with no error on a valid token", () => {
        verify_access_token.mockReturnValue({ id: "user123", email: "test@example.com", type: "access" })

        const req = { headers: { authorization: "Bearer valid.token.here" } }
        const res = buildRes()
        const next = jest.fn()

        authenticate(req, res, next)

        expect(req.user).toEqual({ id: "user123", email: "test@example.com", type: "access" })
        expect(next).toHaveBeenCalledWith()
    })

    it("should call next with UnauthorizedError when token verification throws", () => {
        verify_access_token.mockImplementation(() => {
            throw new Error("jwt expired")
        })

        const req = { headers: { authorization: "Bearer expired.token.here" } }
        const res = buildRes()
        const next = jest.fn()

        authenticate(req, res, next)

        expect(next).toHaveBeenCalledTimes(1)
        expect(next.mock.calls[0][0].message).toMatch(/invalid token/i)
    })
})