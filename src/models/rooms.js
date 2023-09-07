import mongoose from 'mongoose';

const roomSchema = mongoose.Schema(
  {
    user1: {
      type: Object,
      required: true,
    },
    user2: {
      type: Object,
      required: true,
    },
    user1Type: {
      type: String,
      required: true,
    },
    user2Type: {
      type: String,
      required: true,
    },
    lastTimeUpdated: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model('Room', roomSchema);

export default Room;
