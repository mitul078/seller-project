import multer from "multer"
import fs from "fs"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE_MB = 5

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const upload_path = `uploads/products/${req.user.id}/${req.params.productId}`
        fs.mkdirSync(upload_path, { recursive: true })
        cb(null, upload_path)
    },
    filename: function (req, file, cb) {
        const file_name = Date.now() + "-" + file.originalname
        cb(null, file_name)
    },
})

function fileFilter(req, file, cb) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error("Only JPEG, PNG, or WEBP images are allowed"))
    }
    cb(null, true)
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
})

export default upload