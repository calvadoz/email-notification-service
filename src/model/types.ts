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

export enum EmailEvent {
  EMAIL_ADDED = 'EMAIL_ADDED',
  EMAIL_UPDATED = 'EMAIL_UPDATED',
}

export type MessagePayload = {
  emailEventType: EmailEvent
  payload: object
}