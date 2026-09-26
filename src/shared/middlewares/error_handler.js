export default function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500
    const message = err.message || "SOMETHING WENT WRONG"

    res.status(statusCode).json({ success: false, message })
}