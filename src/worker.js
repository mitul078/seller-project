import connectDB from "./infra/db.js";

import "./modules/product/jobs/image_processing.worker.js";
import "./modules/auth/jobs/otp_email.worker.js"

async function bootstrap() {
    await connectDB()
    console.log("WORKER RUNNING")

}

bootstrap().catch(e => {
    console.log("WORKER FAILED TO START")
    process.exit(1)

})