import express from 'express'
import { Request, Response } from 'express'

const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.sendStatus(200)
})

app.listen(port, () => console.log(`Server is running on port ${port}`))

export default app
