import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const logisticsSchema = mongoose.Schema(
  {
    logisticsName: {
      type: String,
      required: true,
    },
    logisticsAddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
        type: String,
        unique:true
    },
    phoneNumber: {
        type: String,
        unique: true
    },
    avatar: {
      type: String
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
logisticsSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
logisticsSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Logistics = mongoose.model('Logistics', logisticsSchema);

export default Logistics;
