import { Request, Response } from 'express'
import axios from 'axios'
import { Document } from 'mongoose'
import MessageRequest from '../src/model/MessageRequest'
import hookController from '../src/controller/hookController'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>


describe('hookRequestHandler', () => {
  let req: Partial<Request>
  let res: Partial<Response>

  beforeEach(() => {
    req = {
      body: {
        // working payload
        payload: { to: 'calvadozzzz@gmail.com', subject: 'custom title email' }
      }
    }

    res = {
      sendStatus: jest.fn()
    }

    mockedAxios.post.mockResolvedValueOnce({ status: 200 })

    // Mock Mongoose model and methods
    jest
      .spyOn(MessageRequest.prototype, 'save')
      .mockImplementationOnce(async function save(this: Document) {
        // Mock success call
        return Promise.resolve(this)
      })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should save the message request, send a response with status 200, and call the email service', async () => {
    await hookController.hookRequestHandler(req as Request, res as Response)

    expect(res.sendStatus).toHaveBeenCalledWith(200)
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/email/send'),
      expect.objectContaining({
        payload: { to: 'calvadozzzz@gmail.com', subject: 'custom title email' }
      })
    )

    jest.restoreAllMocks()
  })

  it('should send a response with status 400 when the payload is invalid due', async () => {
    req.body.payload = ''
    await hookController.hookRequestHandler(req as Request, res as Response)

    expect(res.sendStatus).toHaveBeenCalledWith(400)
    expect(mockedAxios.post).not.toHaveBeenCalled()
  })

  it('should send a response with status 500 when an error occurs', async () => {
    req = {}
    const mockError = new TypeError(
      `Cannot destructure property 'payload' of 'req.body' as it is undefined.`
    )
    mockedAxios.post.mockRejectedValueOnce(mockError)

    // Mock the console.error function
    jest.spyOn(console, 'error').mockImplementationOnce(() => {})

    await hookController.hookRequestHandler(req as Request, res as Response)

    expect(res.sendStatus).toHaveBeenCalledWith(500)
    expect(console.error).toHaveBeenCalledWith(
      'Error handling incoming request: ',
      mockError
    )

    jest.restoreAllMocks()
  })
})
