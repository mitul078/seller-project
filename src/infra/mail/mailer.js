import nodemailer from "nodemailer"
import env from "../../shared/config/index.js"


const transport = nodemailer.createTransport({
    port: env.mail.port,
    host: env.mail.host,
    secure: false,
    auth: {
        user: env.mail.user,
        pass: env.mail.password
    }
})

transport.verify((err) => {
    if (err) {
        console.log("MAIL SERVER ERROR: ", { err })
    }
})

export async function send_email({ to, subject, html }) {
    try {

        await transport.sendMail({
            from: env.mail.from,
            to,
            subject,
            html
        })

    } catch (err) {
        throw err
    }
}