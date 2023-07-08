export type EmailMessage = {
  to: string
  subject?: string
  message?: string
}

export type MessageBody = {
  payload: EmailMessage
  status?: string
  timestamp?: string
}
