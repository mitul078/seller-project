import { Router } from "express";
import authenticate from "../../shared/middlewares/authenticate.js";
import upload from "../../shared/middlewares/upload_images.js";
import productController from "./product.controller.js";
const router = Router()

router.post("/create", authenticate, productController.create_product)
router.get("/", authenticate, productController.get_products)
router.get("/:productId", authenticate, productController.get_product_by_id)
router.patch("/:productId", authenticate, productController.update_product)
router.delete("/:productId", authenticate, productController.delete_product)
router.post("/:productId/publish", authenticate, productController.publish_product)
router.post("/:productId/upload-image", authenticate, upload.single("image"), productController.upload_image)

export default router