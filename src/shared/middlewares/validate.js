export function validate(schema) {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", errors: parsed.error.issues })
        }
        req.body = parsed.data
        next()
    }
}