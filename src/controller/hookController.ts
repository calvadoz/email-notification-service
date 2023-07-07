import { Request, Response } from 'express'
import MessageRequest from '../model/Request'

type MessageBody = {
  payload: object
  email: string
  status?: string
  timestamp?: string
}

const hookRequestHandler = async (req: Request, res: Response) => {
  try {
    // destructure email & payload from body
    const { email, payload }: MessageBody = req.body

    // Commit to save to mongoDB
    const newMessageRequest = new MessageRequest({
      email,
      payload
    })

    newMessageRequest
      .save()
      .then(() => console.log('Message request saved successfully'))
      .catch((err) => console.error('Error while saving request ', err))

    // if (!payload) {
    //   res.sendStatus(400)
    //   return
    // }
    res.sendStatus(200)
  } catch (err) {
    console.error('Error handling incoming request: ', err)
    res.sendStatus(500)
  }
}

export default { hookRequestHandler }