import mongoose from "mongoose";
import env from "../shared/config/index.js";


export default async function connectDB() {
    try {

        await mongoose.connect(env.db.mongoUri)
        console.log("DATABASE CONNECTED")

    } catch (error) {
        console.log("DATABASE ERROR")
        throw error
    }
}