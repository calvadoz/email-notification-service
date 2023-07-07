import { Request, Response } from 'express'

const hookRequestHandler = async (req: Request, res: Response) => {
  console.log(req.body)
  res.sendStatus(200)
}

export default { hookRequestHandler }
