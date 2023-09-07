import mongoose, { Schema } from 'mongoose';

const chatSchema = mongoose.Schema(
  {
    room: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Room',
    },
    from: {
      type: Object,
      required: true,
    },
    fromType: {
      type: String,
      required: true,
    },
    to: {
      type: Object,
      required: true,
    },
    toType: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
