import express from 'express'
import { Request, Response } from 'express'
import hookController from './controller/hookController'

const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.sendStatus(200)
})
app.post('/hook', hookController.hookRequestHandler)

app.listen(port, () => console.log(`Server is running on port ${port}`))

export default app
