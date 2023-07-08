import { google, gmail_v1 } from 'googleapis'
import readline from 'readline'
import { Request, Response } from 'express'
import { EmailMessage } from '../model/types'

const sendEmailHandler = async (req: Request, res: Response) => {
  // Define the default email content
  const defaultRecipient = 'calvadozzzz@gmail.com'
  const defaultSubject = 'Greetings from Kelvin.'
  const defaultMessage =
    'If you received this message, thank God my Gmail API is working, thanks for being part of the test. Have a nice day :)'
  try {
    const {
      to: recipient,
      subject: title,
      message: body
    }: EmailMessage = req.body.payload
    const { _id: id } = req.body

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

    //update mongoDB data upon successful
    console.log('Email sent:', gmailRes.data)
    res.status(200)
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({ errorMessage: 'Failed to send Email' })
  }
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

  console.log('Authorize this app by visiting this URL:', authUrl)

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
    rl.question('Paste the authorization code from the URL: ', (code) => {
      rl.close()
      resolve(code)
    })
  })
}

export default { sendEmailHandler }
