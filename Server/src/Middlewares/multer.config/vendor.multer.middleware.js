import fs from 'fs'
import path from 'path'
import multer from 'multer'

const vendorTempDir = path.resolve(process.cwd(), 'public', 'vendor', 'temp')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(vendorTempDir, { recursive: true })
    cb(null, vendorTempDir)
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`
    cb(null, filename)
  }
})

const vendorUpload = multer({ storage: storage })

export {
  vendorUpload
}
