import mongoose from 'mongoose';

const waitlistSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    city: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
        type: String,
        unique:true
    },
  },
  {
    timestamps: true,
  }
);

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;
