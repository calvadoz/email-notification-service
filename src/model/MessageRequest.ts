import { Schema, model } from 'mongoose'

// export interface MessageRequest extends Document {
//   payload: object
// }

const messageRequestSchema: Schema = new Schema({
  payload: { type: Object, required: true },
  status: { type: String, default: 'pending' },
  timestamp: { type: Date, default: Date.now }
  // tbd
})

const MessageRequest = model('MessageRequest', messageRequestSchema)

export default MessageRequest
