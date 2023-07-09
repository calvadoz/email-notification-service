import { google, gmail_v1 } from 'googleapis'
import readline from 'readline'
import { Request, Response } from 'express'
import { EmailEvent, EmailMessage, MessagePayload } from '../model/types'
import MessageRequest from '../model/MessageRequest'
import { sendMessage } from '..'

const sendEmailHandler = async (req: Request, res: Response) => {
  // Define the default email content
  const defaultRecipient = 'calvadozzzz@gmail.com'
  const defaultSubject = 'Greetings from Kelvin.'
  const defaultMessage =
    'If you received this message, thank God my Gmail API is working, thanks for being part of the test. Have a nice day :)'
  const { _id: messageId } = req.body

  try {
    const {
      to: recipient,
      subject: title,
      message: body
    }: EmailMessage = req.body.payload

    // Authorize the client
    const auth = await authorize()
    const gmail = google.gmail({ version: 'v1', auth })

    // setting up email message
    const email = {
      to: recipient ?? defaultRecipient,
      subject: title ?? defaultSubject,
      message: body ?? defaultMessage
    }

    // Create the email message
    const message = createMessage(email)

    // Send the email
    const gmailRes = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: message
      }
    })

    console.log('Email sent:', gmailRes.data)
    // update mongoDB data upon successful
    await updateEmailStatus(messageId, true)
    const messageAddedPayload: MessagePayload = {
      emailEventType: EmailEvent.EMAIL_UPDATED,
      payload: messageId
    }
    sendMessage(JSON.stringify(messageAddedPayload))
    res.status(200)
  } catch (error) {
    console.error('Error sending email:', error)
    await updateEmailStatus(messageId, false)
    const messageAddedPayload: MessagePayload = {
      emailEventType: EmailEvent.EMAIL_UPDATED,
      payload: messageId
    }
    sendMessage(JSON.stringify(messageAddedPayload))
    res.status(500).json({ errorMessage: 'Failed to send Email' })
  }
}

async function updateEmailStatus(messageId: string, isSuccess: boolean) {
  const updateMessage = await MessageRequest.findById(messageId)
  // don't do anything if there is nothing found in db, ignore this process completely as this is asynchronous ops
  if (!updateMessage) return
  updateMessage.status = isSuccess ? 'delivered' : 'failed'
  await updateMessage.save()
}

async function authorize(): Promise<
  gmail_v1.Params$Resource$Users$Messages$Send['auth']
> {
  const clientId = process.env.GMAIL_CLIENTID
  const clientSecret = process.env.GMAIL_CLIENTSECRET
  const redirectURI = 'https://developers.google.com/oauthplayground'
  // const redirectURI = 'http://localhost:4000/auth/callback'
  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectURI
  )

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send']
  })

  console.log('\nAuthorize app by visiting this URL => ', authUrl)

  const code = await getAuthorizationCode()

  try {
    const { tokens } = await oAuth2Client.getToken(code)
    oAuth2Client.setCredentials(tokens)
    return oAuth2Client
  } catch (error) {
    console.error('Error authenticating:', error)
    throw error
  }
}

function createMessage({
  to,
  subject,
  message
}: {
  to: string
  subject: string
  message: string
}): string {
  const emailLines = []

  emailLines.push(`To: ${to}`)
  emailLines.push('Content-Type: text/html; charset=utf-8')
  emailLines.push('MIME-Version: 1.0')
  emailLines.push(`Subject: ${subject}`)
  emailLines.push('')
  emailLines.push(message)

  return Buffer.from(emailLines.join('\r\n')).toString('base64')
}

function getAuthorizationCode(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question('\nPaste the authorization code from the URL: ', (code) => {
      rl.close()
      resolve(code)
    })
  })
}

export default { sendEmailHandler }
