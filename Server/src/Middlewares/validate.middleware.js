import mongoose from 'mongoose'
import validator from 'validator'
import { ApiError } from "../Utils/index.js"

const validationSource = {
    BODY: "body",
    PARAMS: "params",
    HEADERS: "headers",
    QUERY: "query"
}

const sanitizeDeep = (value) => {
    if (typeof value === 'string') {
        return validator.escape(value.trim())
    }

    if (Array.isArray(value)) {
        return value.map(sanitizeDeep)
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, sanitizeDeep(nestedValue)]))
    }

    return value
}

const validate = (schema, source = validationSource.BODY) => {
    return (req, res, next) => {
        const result = schema.safeParse(req[source])

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path?.join('.') || source,
                message: issue.message,
            }))

            const validationError = new ApiError(400, 'Validation failed', errors)
            validationError.type = 'VALIDATION_ERROR'
            validationError.statusCode = 400
            validationError.errors = errors

            return next(validationError)
        }

        req[source] = sanitizeDeep(result.data)
        next()
    }
}


const validateObjectId = (paramName = "id") => {
    return (req, res, next) => {
        const id = req.params[paramName]
        if(!mongoose.Types.ObjectId.isValid(id)) return next(new ApiError(401, `Invalid ${id}: Not a valid ID `))

        next()
    }
}








export {
    validationSource, 
    validate,
    validateObjectId,

}