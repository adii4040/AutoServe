import dotenv from 'dotenv'
dotenv.config({ path: '.env', debug: true }) //to supress env logs -- quiet: true

import { app } from "./app.js";
import { connectDb } from "./db/db.js"

const port = process.env.PORT || 8002


connectDb()
    .then(() => {

        app.on('error', (err) => {
            console.log(`Connection err ${err}`)
            throw new Error
        })
        app.listen(port, () => console.log(`⚙️ Server successfully running on port:${port}`))
    })
    .catch((err) => console.log(`Error connecting database ERROR:${err}`))




