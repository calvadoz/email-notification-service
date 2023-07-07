import { Request, Response } from 'express'
import RequestModel from '../model/Request'

const hookRequestHandler = async (req: Request, res: Response) => {
  try {
    const { payload } = req.body
    if (!payload) {
      res.sendStatus(400)
      return
    }
    res.sendStatus(200)
  } catch (err) {
    console.error('Error handling incoming request: ', err)
    res.sendStatus(500)
  }
}

export default { hookRequestHandler }
