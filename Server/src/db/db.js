import mongoose from 'mongoose'
import { logger } from '../Utils/logger.js'

export const connectDb = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL
        const connectionInstance = await mongoose.connect(`${mongoUri}`)
        logger.info(`MongoDb connected successfully!! Db host: ${connectionInstance.connection.host}`)
    } catch (error) {
        logger.error('Error while connecting to db', { error: error?.message || error })
        process.exit(1)
    }
}