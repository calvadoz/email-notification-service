import express from 'express'
import { Request, Response } from 'express'
import hookController from './controller/hookController'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const port = process.env.PORT || 4000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.sendStatus(200)
})
app.post('/hook', hookController.hookRequestHandler)

app.listen(port, () => console.log(`Server is running on port ${port}`))

export default app
