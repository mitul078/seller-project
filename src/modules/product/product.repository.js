import Product from "./product.model.js"
import mongoose from "mongoose"
import { ValidationError } from "../../shared/errors/error_types.js"

async function save_product({ name, price, quantity, status, userId, category, images = [] }) {
    return await Product.create({
        userId,
        name,
        quantity,
        status,
        category,
        images,
        price
    })
}

async function list_product(userId, cursor, limit = 10) {

    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50)
    let filter = { userId }
    if (cursor) {
        if (!mongoose.Types.ObjectId.isValid(cursor)) {
            throw new ValidationError("INVALID CURSOR")
        }
        filter._id = { $gt: cursor }
    }

    const products = await Product.find(filter)
        .select("name price quantity category status images.thumbnail createdAt")
        .sort({ _id: 1 })
        .limit(safeLimit)
        .lean()
    const next_cursor = products.length > 0 ? products[products.length - 1]._id : null

    return { products, next_cursor }

}

async function product_by_id(productId, userId) {
    return Product.findOne({ _id: productId, userId })
}

async function upload_images(productId, userId, images) {
    return Product.findOneAndUpdate(
        { _id: productId, userId },
        { images, status: "DRAFT" },
        { new: true, runValidators: true }
    )
}

async function remove_product(productId, userId) {
    return Product.deleteOne({ _id: productId, userId })
}

async function set_status(productId, userId, status) {
    return Product.findOneAndUpdate(
        { _id: productId, userId },
        { status },
        { new: true, runValidators: true }
    )
}

async function update_product({ productId, userId, name, price, quantity, category, images = [] }) {
    let updated_data = {}
    if (name !== undefined) updated_data.name = name
    if (price !== undefined) updated_data.price = price
    if (quantity !== undefined) updated_data.quantity = quantity
    if (category !== undefined) updated_data.category = category
    if (images !== undefined && images.length > 0) updated_data.images = images

    return Product.findOneAndUpdate(
        { _id: productId, userId },
        updated_data,
        { new: true, runValidators: true }
    )
}


async function publish_if_draft(productId, userId) {
    return Product.findOneAndUpdate(
        { _id: productId, userId, status: "DRAFT" },
        { status: "PUBLISHED" },
        { new: true }
    )
}

export default {
    save_product,
    list_product,
    product_by_id,
    upload_images,
    remove_product,
    update_product,
    set_status,
    publish_if_draft
}