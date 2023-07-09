import express, { Request, Response } from 'express'
import hookController from './controller/hookController'
import sendEmail from './service/emailService'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import http from 'http'
import MessageRequest from './model/MessageRequest'
import { Server as SocketIOServer } from 'socket.io'

dotenv.config()

let socketServer: SocketIOServer
const port = process.env.PORT || 4000
const dbUsername = process.env.MONGODB_USERNAME
const dbPassword = process.env.MONGODB_PASSWORD
const dbName = process.env.MONGODB_DBNAME
const dbUri = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.atbza.mongodb.net/${dbName}?retryWrites=true&w=majority`

async function connectToMongoDB() {
  try {
    await mongoose.connect(dbUri)
    console.log('Connected to MongoDB')

    const app = express()
    const server = http.createServer(app)

    app.use(express.json())

    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Methods', 'GET, POST')
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
      )
      next()
    })

    app.get('/api/healthcheck', (req: Request, res: Response) => {
      res.status(200).json('Beep bop, I am healthy and alive')
    })

    app.post('/api/email/send', sendEmail.sendEmailHandler)

    app.post('/api/hook', hookController.hookRequestHandler)

    app.get('/api/email/list', async (req: Request, res: Response) => {
      sendMessage('Hello')
      const messageList = await MessageRequest.find()
      res.status(200).json(messageList.reverse())
    })

    socketServer = new SocketIOServer(server, {
      // cors just for my local development for now
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    })

    socketServer.on('connection', (socket) => {
      console.log('WebSocket client connected')

      socket.on('message', (message: string) => {
        console.log(`Received message from client: ${message}`)
        socket.send('Echo: ' + message)
      })
    })

    server.listen(port, () => console.log(`Server is running on port ${port}`))
  } catch (error) {
    console.error('Error connecting to MongoDB: ', error)
  }
}

export function sendMessage(message: string) {
  if (socketServer) {
    socketServer.emit('message', message);
  }
}

connectToMongoDB()
