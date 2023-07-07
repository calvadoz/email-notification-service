import mongoose, { Schema, Document, model } from 'mongoose';

export interface MessageRequest extends Document {
  payload: object;
}

const RequestSchema: Schema = new Schema({
    payload: { type: Object, required: true },
    email: { type: String, required: true },
    status: { type: String, default: 'pending' },
    timestamp: { type: Date, default: Date.now },
    // tbd
});

export default model<MessageRequest>('Request', RequestSchema);