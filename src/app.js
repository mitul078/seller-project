import express from "express"
import errorHandler from "./shared/middlewares/error_handler.js"
import { authRoutes } from "./modules/auth/index.js"
import cookieParser from "cookie-parser"
import { productRoutes } from "./modules/product/index.js"

const app = express()
app.use(express.json())
app.use(cookieParser())




app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/product", productRoutes)
app.use(errorHandler)

export default app