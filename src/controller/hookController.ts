import { Request, Response } from 'express'
import MessageRequest from '../model/MessageRequest'
import { Client } from 'undici'

type EmailMessage = {
  to: string
  subject?: string
  message?: string
}

type MessageBody = {
  payload: EmailMessage
  // email: string
  status?: string
  timestamp?: string
}

const gatewayURI = process.env.GATEWAY_URI || 'http://localhost:4000'

const hookRequestHandler = async (req: Request, res: Response) => {
  try {
    const client = new Client(gatewayURI)
    // destructure  payload from body
    const { payload }: MessageBody = req.body
    if (!validatePayload(payload)) {
      res.sendStatus(400)
      return
    }

    // Commit to save to mongoDB
    const newMessageRequest = new MessageRequest({
      payload
    })

    newMessageRequest
      .save()
      .then(() =>
        console.log('Message request saved successfully', newMessageRequest)
      )
      .catch((err) => console.error('Error while saving request ', err))

    res.sendStatus(200)
    // call EmailService here then asynchronously without waiting
    client.request({
      path: '/api/email/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newMessageRequest)
    })
  } catch (err) {
    console.error('Error handling incoming request: ', err)
    res.sendStatus(500)
  }
}

function validatePayload(payload: EmailMessage) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  // console.log('Is Email Valid: ', emailRegex.test(payload.to))
  if (!payload) return false
  if (!emailRegex.test(payload.to)) return false
  return true
}

export default { hookRequestHandler }
