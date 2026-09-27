import { z } from "zod"
import mongoose from "mongoose"

const CATEGORIES = ["SOFAS", "BEDS", "CHAIRS", "DESKS", "TABLES"]

export const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ID format",
})

export const createProductSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
    price: z.number().positive("Price must be greater than 0"),
    quantity: z.number().int().min(1, "Quantity must be at least 1"),
    category: z.enum(CATEGORIES),
})

export const updateProductSchema = z.object({
    name: z.string().trim().min(2).max(120).optional(),
    price: z.number().positive().optional(),
    quantity: z.number().int().min(1).optional(),
    category: z.enum(CATEGORIES).optional(),
})

export const listProductsQuerySchema = z.object({
    cursor: objectIdSchema.optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
})

export const productIdParamSchema = z.object({
    productId: objectIdSchema,
})