import { Worker } from "bullmq";

import {send_email} from "../../../infra/mail/mailer.js"
import { connection } from "../../../infra/queues/queues.js";

const email_worker = new Worker("email-processing", async (job) => {
    const { to, subject, html } = job.data

    await send_email({ to, subject, html })

}, { connection })

email_worker.on("failed", (job, err) => {
    console.log("EMAIL JOB ERROR: ", { error: err })
})

export default email_worker