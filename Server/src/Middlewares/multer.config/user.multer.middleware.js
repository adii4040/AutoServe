import multer from 'multer'
import fs from 'fs'
import path from 'path'

const userTempDir = path.resolve(process.cwd(), 'public', 'temp')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(userTempDir, { recursive: true })
    cb(null, userTempDir)
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`
    cb(null, filename )
  }
})

const userUpload = multer({ storage: storage })

export default userUpload
