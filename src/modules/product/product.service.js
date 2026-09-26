import { resize_image } from "../../infra/image/resize.js";
import { image_queue } from "../../infra/queues/queues.js";
import { ConflictError, NotFoundError } from "../../shared/errors/error_types.js";
import productRepository from "./product.repository.js";

async function create_product({ userId, name, price, quantity, category }) {
    const product = await productRepository.save_product({
        userId,
        name,
        price,
        quantity,
        category
    })

    return { product }
}

async function get_products({ userId, cursor, limit }) {

    const { products, next_cursor } = await productRepository.list_product(userId, cursor, limit)
    return { products, next_cursor }
}

async function get_product_by_id(productId, userId) {
    const product = await productRepository.product_by_id(productId, userId)
    if (!product) {
        throw new NotFoundError("PRODUCT NOT FOUND")
    }

    return { product }

}

async function update_product_detail({ userId, productId, name, price, quantity, category, images = [] }) {
    const product = await productRepository.product_by_id(productId, userId)
    if (!product) {
        throw new NotFoundError("PRODUCT NOT FOUND OR YOU CAN'T ACCESS IT")
    }

    const updated_product = await productRepository.update_product({
        productId,
        userId,
        name,
        price,
        quantity,
        images,
        category
    })

    return { updated_product }

}

async function put_images(productId, userId, filePath) {

    const product = await productRepository.product_by_id(productId, userId)
    if (!product) throw new NotFoundError("PRODUCT NOT FOUND OR YOU CAN'T ACCESS IT")

    await image_queue.add("resize-product-image", {
        productId: product._id,
        userId,
        filePath
    })

    return { message: "IMAGE UPLOADED, PROCESSING IN BACKGROUND" }

}


async function publish_product(productId, userId) {
    const updated = await productRepository.publish_if_draft(productId, userId)
    if (!updated) {
        const exists = await productRepository.product_by_id(productId, userId)
        if (!exists) throw new NotFoundError("PRODUCT NOT FOUND OR YOU CAN'T ACCESS IT")
        throw new ConflictError("PRODUCT MUST BE IN DRAFT STATUS TO PUBLISH")
    }
    return { message: "PRODUCT HAS BEEN PUBLISHED" }
}

async function delete_product(productId, userId) {
    const product = await productRepository.product_by_id(productId, userId)
    if (!product) {
        throw new NotFoundError("PRODUCT NOT FOUND OR YOU CAN'T ACCESS IT")
    }

    await productRepository.remove_product(productId, userId)

    return { message: "SUCCESSFULLY DELETED" }
}

export default {
    create_product,
    get_products,
    get_product_by_id,
    update_product_detail,
    delete_product,
    publish_product,
    put_images
}