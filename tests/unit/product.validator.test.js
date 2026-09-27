import {
    createProductSchema,
    updateProductSchema,
    listProductsQuerySchema,
    productIdParamSchema,
} from "../../src/modules/product/product.validator.js"

describe("createProductSchema", () => {
    const valid = { name: "Oak Dining Table", price: 299.99, quantity: 10, category: "TABLES" }

    it("should pass with valid data", () => {
        expect(createProductSchema.safeParse(valid).success).toBe(true)
    })

    it("should fail when price is zero or negative", () => {
        expect(createProductSchema.safeParse({ ...valid, price: 0 }).success).toBe(false)
        expect(createProductSchema.safeParse({ ...valid, price: -10 }).success).toBe(false)
    })

    it("should fail when quantity is less than 1", () => {
        expect(createProductSchema.safeParse({ ...valid, quantity: 0 }).success).toBe(false)
    })

    it("should fail with an invalid category", () => {
        expect(createProductSchema.safeParse({ ...valid, category: "RUGS" }).success).toBe(false)
    })

    it("should fail when name is too short", () => {
        expect(createProductSchema.safeParse({ ...valid, name: "A" }).success).toBe(false)
    })
})

describe("updateProductSchema", () => {
    it("should pass with a partial update", () => {
        expect(updateProductSchema.safeParse({ price: 150 }).success).toBe(true)
    })

    it("should pass with an empty object (no-op update)", () => {
        expect(updateProductSchema.safeParse({}).success).toBe(true)
    })

    it("should reject an unknown/disallowed field silently stripped or fail on invalid types", () => {
        expect(updateProductSchema.safeParse({ price: "not-a-number" }).success).toBe(false)
    })
})

describe("listProductsQuerySchema", () => {
    it("should pass with no query params", () => {
        expect(listProductsQuerySchema.safeParse({}).success).toBe(true)
    })

    it("should coerce a string limit to a number", () => {
        const result = listProductsQuerySchema.safeParse({ limit: "20" })
        expect(result.success).toBe(true)
        expect(result.data.limit).toBe(20)
    })

    it("should fail when limit exceeds 50", () => {
        expect(listProductsQuerySchema.safeParse({ limit: "100" }).success).toBe(false)
    })

    it("should fail with a malformed cursor", () => {
        expect(listProductsQuerySchema.safeParse({ cursor: "not-an-object-id" }).success).toBe(false)
    })
})

describe("productIdParamSchema", () => {
    it("should pass with a valid ObjectId", () => {
        expect(productIdParamSchema.safeParse({ productId: "507f1f77bcf86cd799439011" }).success).toBe(true)
    })

    it("should fail with an invalid ObjectId", () => {
        expect(productIdParamSchema.safeParse({ productId: "not-valid" }).success).toBe(false)
    })
})