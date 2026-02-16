import mongoose from "mongoose"
import { ApiError } from "../Utils/index"

export const validateObjectId = (paramName = "id") => {
    return (req, res, next) => {
        const id = req.params[paramName]
        if (!mongoose.Types.ObjectId.isValid(id)) next(new ApiError(400, `Invalid ${paramName}: Not a valid ObjectId`))

        next()
    }
}