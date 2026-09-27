jest.mock("../../src/modules/product/product.repository.js")
jest.mock("../../src/infra/queues/queues.js", () => ({
    image_queue: { add: jest.fn() },
}))

import productService from "../../src/modules/product/product.service.js"
import productRepository from "../../src/modules/product/product.repository.js"
import { image_queue } from "../../src/infra/queues/queues.js"

const userId = "user123"
const productId = "product123"

afterEach(() => {
    jest.clearAllMocks()
})

describe("update_product_detail", () => {
    it("should update and return the product in a single repository call", async () => {
        productRepository.update_product.mockResolvedValue({ _id: productId, name: "Updated" })

        const result = await productService.update_product_detail({
            userId,
            productId,
            name: "Updated",
        })

        expect(productRepository.update_product).toHaveBeenCalledTimes(1)
        expect(result.updated_product.name).toBe("Updated")
    })

    it("should throw NotFoundError when the product doesn't exist or isn't owned by the user", async () => {
        productRepository.update_product.mockResolvedValue(null)

        await expect(
            productService.update_product_detail({ userId, productId, name: "X" })
        ).rejects.toThrow(/not found/i)
    })
})

describe("delete_product", () => {
    it("should delete in a single repository call", async () => {
        productRepository.remove_product.mockResolvedValue({ _id: productId })

        const result = await productService.delete_product(productId, userId)

        expect(productRepository.remove_product).toHaveBeenCalledTimes(1)
        expect(result.message).toMatch(/deleted/i)
    })

    it("should throw NotFoundError when nothing was deleted", async () => {
        productRepository.remove_product.mockResolvedValue(null)

        await expect(productService.delete_product(productId, userId)).rejects.toThrow(/not found/i)
    })
})

describe("put_images", () => {
    it("should enqueue a job with retry options when the product exists", async () => {
        productRepository.product_by_id.mockResolvedValue({ _id: productId })

        const result = await productService.put_images(productId, userId, "/uploads/img.jpg")

        expect(image_queue.add).toHaveBeenCalledWith(
            "resize-product-image",
            { productId: productId.toString(), userId, filePath: "/uploads/img.jpg" },
            expect.objectContaining({ attempts: 3 })
        )
        expect(result.message).toMatch(/processing/i)
    })

    it("should throw NotFoundError and never enqueue when the product doesn't exist", async () => {
        productRepository.product_by_id.mockResolvedValue(null)

        await expect(productService.put_images(productId, userId, "/uploads/img.jpg")).rejects.toThrow(
            /not found/i
        )
        expect(image_queue.add).not.toHaveBeenCalled()
    })
})

describe("publish_product", () => {
    it("should succeed when the product is in DRAFT status", async () => {
        productRepository.publish_if_draft.mockResolvedValue({ _id: productId, status: "PUBLISHED" })

        const result = await productService.publish_product(productId, userId)
        expect(result.message).toMatch(/published/i)
    })

    it("should throw ConflictError when the product exists but isn't in DRAFT", async () => {
        productRepository.publish_if_draft.mockResolvedValue(null)
        productRepository.product_by_id.mockResolvedValue({ _id: productId, status: "PROCESSING" })

        await expect(productService.publish_product(productId, userId)).rejects.toThrow(/draft/i)
    })

    it("should throw NotFoundError when the product doesn't exist at all", async () => {
        productRepository.publish_if_draft.mockResolvedValue(null)
        productRepository.product_by_id.mockResolvedValue(null)

        await expect(productService.publish_product(productId, userId)).rejects.toThrow(/not found/i)
    })
})