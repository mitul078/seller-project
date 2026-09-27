import { Redis } from "ioredis";
import { Queue } from "bullmq";
import env from "../../shared/config/index.js";


export const connection = new Redis(env.redis.url, {
    maxRetriesPerRequest: null
})


export const image_queue = new Queue("image-processing", { connection })
export const email_queue = new Queue("email-processing", { connection })