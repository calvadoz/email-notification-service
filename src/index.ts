import express, { Request, Response } from 'express'
import hookController from './controller/hookController'
import sendEmail from './service/emailService'
import dotenv from 'dotenv'
import mongoose, { ConnectOptions } from 'mongoose'
import MessageRequest from './model/MessageRequest'

dotenv.config()

const port = process.env.PORT || 4000
// setting up mongoDB
const dbUsername = process.env.MONGODB_USERNAME
const dbPassword = process.env.MONGODB_PASSWORD
const dbName = process.env.MONGODB_DBNAME
const dbUri = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.atbza.mongodb.net/${dbName}?retryWrites=true&w=majority`
const app = express()

async function connectToMongoDB() {
  try {
    // connect to cloud mongoDB, please contact me for access whitelisting if starting server throws access error
    await mongoose.connect(dbUri)

    console.log('Connected to MongoDB')

    app.use(express.json())

    // route setup
    // decided not to setup default route, security, less route less concern :)

    // healthcheck endpoint for alive ping
    app.get('/api/healthcheck', (req: Request, res: Response) => {
      res.status(200).json('Beep bop, I am healthy and alive')
    })

    // email service endpoint
    app.post('/api/email/send', sendEmail.sendEmailHandler)

    // hook route entry point
    app.post('/api/hook', hookController.hookRequestHandler)

    app.get('/auth/callback', (req: Request, res: Response) => {
      res.status(200).json(JSON.stringify(req))
    })

    app.listen(port, () => console.log(`Server is running on port ${port}`))
  } catch (error) {
    console.error('Error connecting to MongoDB: ', error)
  }
}

connectToMongoDB()
