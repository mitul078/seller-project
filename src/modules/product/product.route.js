import { Router } from "express"
import authenticate from "../../shared/middlewares/authenticate.js"
import upload from "../../shared/middlewares/upload_images.js"
import { validate, validateParams, validateQuery } from "../../shared/middlewares/validate.js"
import { createProductSchema, updateProductSchema, listProductsQuerySchema, productIdParamSchema } from "./product.validator.js"
import productController from "./product.controller.js"

const router = Router()

router.post("/create", authenticate, validate(createProductSchema), productController.create_product)
router.get("/", authenticate, validateQuery(listProductsQuerySchema), productController.get_products)
router.get("/:productId", authenticate, validateParams(productIdParamSchema), productController.get_product_by_id)
router.patch("/:productId", authenticate, validateParams(productIdParamSchema), validate(updateProductSchema), productController.update_product)
router.delete("/:productId", authenticate, validateParams(productIdParamSchema), productController.delete_product)
router.post("/:productId/publish", authenticate, validateParams(productIdParamSchema), productController.publish_product)
router.post("/:productId/upload-image", authenticate, validateParams(productIdParamSchema), upload.single("image"), productController.upload_image)

export default router