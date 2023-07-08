import { google, gmail_v1 } from 'googleapis'
import readline from 'readline'
import { Request, Response } from 'express'

// Define the email content
const email = {
  to: 'calvadozzzz@gmail.com',
  subject: 'Greetings from Kelvin.',
  message: 'If you received this message, thank God my Gmail API is working, thanks for being part of the test. Have a nice day :)'
}

const clientId = process.env.GMAIL_CLIENTID
const clientSecret = process.env.GMAIL_CLIENTSECRET
const redirectURI = 'https://developers.google.com/oauthplayground'

const sendEmailHandler = async (req: Request, res: Response) => {
  try {
    // Authorize the client
    const auth = await authorize()
    const gmail = google.gmail({ version: 'v1', auth })

    // Create the email message
    const message = createMessage(email)

    // Send the email
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: message
      }
    })
    console.log('Email sent:', res.data)
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({ errorMessage: 'Failed to send Email' })
  }
}

async function authorize(): Promise<
  gmail_v1.Params$Resource$Users$Messages$Send['auth']
> {
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
