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

export function validateParams(schema) {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.params)
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid parameters", errors: parsed.error.issues })
        }
        req.params = parsed.data
        next()
    }
}

export function validateQuery(schema) {
    return (req, res, next) => {
        const parsed = schema.safeParse(req.query)
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid query parameters", errors: parsed.error.issues })
        }
        req.query = parsed.data
        next()
    }
}