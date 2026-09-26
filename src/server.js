import app from "./app.js";
import connectDB from "./infra/db.js";
import env from "./shared/config/index.js";

async function bootstrap() {
    await connectDB()

    app.listen(env.port, () => {
        console.log("SERVER RUNNING")
    })

}

bootstrap().catch(e => {
    console.log("SERVER FAILED TO START")
    process.exit(1)

})