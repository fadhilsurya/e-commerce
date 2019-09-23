require('dotenv').config()
const path = require('path')
const multer = require('multer')({
            checkFile: function (req, res, next) {
                if ((path.extname(file.originalname) === '.jpg' || path.extname(file.originalname) === '.png')) {
                        next(null, true)
                    } else {
                        res.status(400).json({
                            message: 'bad request bro'
                        })
                    }
                },
                limits: {
                    fileSize: 9 * 1024 * 1024
                }
            })

        // console.log('masuk ke upload image <<<<<<<<<<<<<<<<<', process.env.CLOUD_BUCKET)
        // BELUM DI SET 

        const {
            Storage
        } = require('@google-cloud/storage')

        const CLOUD_BUCKET = process.env.CLOUD_BUCKET

        const storage = new Storage({
            projectId: process.env.GCLOUD_PROJECT,
            keyFilename: process.env.KEYFILE_PATH
        })


        const bucket = storage.bucket(CLOUD_BUCKET)


        const sendUploadToGCS = (req, res, next) => {
            if (!req.file) {
                return next()
            }
            console.log(req.file, '<<<<<< INI REQ.FILE BROOH')



            const fileName = Date.now() + req.file.originalname
            const file = bucket.file(fileName)

            const stream = file.createWriteStream({
                metadata: {
                    contentType: req.file.mimetype
                }
            })

            stream.on('error', (err) => {
                req.file.cloudStorageError = err
                next(err)
            })

            stream.on('finish', () => {
                // req.file.cloudStorageObject = gcsname

                file.makePublic().then(() => {

                        // req.file.cloudStoragePublicUrl = getPublicUrl(gcsname)
                        req.body.imageUrl = `https://storage.googleapis.com/${CLOUD_BUCKET}/${fileName}`
                        next()
                    })
                    .catch(next)
            })

            stream.end(req.file.buffer)
        }

        module.exports = {
            sendUploadToGCS,
            multer
        }