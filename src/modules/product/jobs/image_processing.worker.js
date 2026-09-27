import { Worker } from "bullmq"
import { resize_image } from "../../../infra/image/resize.js"
import productRepository from "../product.repository.js"
import { connection } from "../../../infra/queues/queues.js"

const image_worker = new Worker(
    "image-processing",
    async (job) => {
        const { productId, userId, filePath } = job.data

        const resized_image = await resize_image(filePath)

        const updated = await productRepository.upload_images(productId, userId, [resized_image])

        if (!updated) {
            throw new Error(`Product ${productId} not found for user ${userId} — image not saved`)
        }

        console.log("IMAGE PROCESSED FOR PRODUCT", { productId })
    },
    { connection, concurrency: 3 }
)

image_worker.on("failed", (job, err) => {
    console.log("IMAGE JOB FAILED", { productId: job?.data?.productId, error: err.message })
})

export default image_worker