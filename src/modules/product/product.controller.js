import ApiResponse from "../../shared/utils/api_response.js"
import productService from "./product.service.js"

async function create_product(req, res, next) {
    try {
        const { name, price, quantity, category } = req.body
        const { id: userId } = req.user

        const product = await productService.create_product({ userId, name, price, quantity, category })
        return res.status(201).json(new ApiResponse(product, "PRODUCT CREATED"))
    } catch (error) {
        next(error)
    }
}

async function get_products(req, res, next) {
    try {
        const { id: userId } = req.user
        const { cursor, limit } = req.query

        const result = await productService.get_products({ userId, cursor, limit })
        return res.status(200).json(new ApiResponse(result, "PRODUCTS FETCHED"))
    } catch (error) {
        next(error)
    }
}

async function get_product_by_id(req, res, next) {
    try {
        const { productId } = req.params
        const { id: userId } = req.user

        const result = await productService.get_product_by_id(productId, userId)
        return res.status(200).json(new ApiResponse(result, "PRODUCT FETCHED"))
    } catch (error) {
        next(error)
    }
}

async function update_product(req, res, next) {
    try {
        const { productId } = req.params
        const { id: userId } = req.user
        const { name, price, quantity, category } = req.body

        const result = await productService.update_product_detail({
            userId,
            productId,
            name,
            price,
            quantity,
            category,
        })

        return res.status(200).json(new ApiResponse(result, "PRODUCT UPDATED"))
    } catch (error) {
        next(error)
    }
}

async function delete_product(req, res, next) {
    try {
        const { productId } = req.params
        const { id: userId } = req.user

        const result = await productService.delete_product(productId, userId)
        return res.status(200).json(new ApiResponse(result, result.message))
    } catch (error) {
        next(error)
    }
}

async function publish_product(req, res, next) {
    try {
        const { productId } = req.params
        const { id: userId } = req.user

        const result = await productService.publish_product(productId, userId)
        return res.status(200).json(new ApiResponse(result, result.message))
    } catch (error) {
        next(error)
    }
}

async function upload_image(req, res, next) {
    try {
        const { productId } = req.params
        const { id: userId } = req.user

        if (!req.file) {
            return res.status(400).json({ message: "IMAGE FILE REQUIRED" })
        }

        const result = await productService.put_images(productId, userId, req.file.path)
        return res.status(200).json(new ApiResponse(result, result.message))
    } catch (error) {
        next(error)
    }
}

export default {
    create_product,
    get_products,
    get_product_by_id,
    update_product,
    delete_product,
    publish_product,
    upload_image,
}