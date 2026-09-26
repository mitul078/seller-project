import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    images: [
        {
            thumbnail: String,
            medium: String,
            large: String
        }
    ],
    quantity: { type: Number, min: 1, required: true },
    category: { type: String, enum: ["SOFAS", "BEDS", "CHAIRS", "DESKS", "TABLES"] },
    status: { type: String, enum: ["DRAFT", "PROCESSING", "PUBLISHED"], default: "PROCESSING" }
}, { timestamps: true })

productSchema.index({ userId: 1, _id: 1 })

const Product = mongoose.model("Product", productSchema)
export default Product