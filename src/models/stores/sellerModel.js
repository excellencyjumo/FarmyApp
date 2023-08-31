import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const storeSchema = mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
    },
    storeAddress: {
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
    slug: {
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
    // location: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     required: false,
    //   },
    //   coordinates: {
    //     type: [Number],
    //     required: false,
    //   },
    // },
  },
  {
    timestamps: true,
  }
);

// storeSchema.index({ location: "2dsphere" });

// Match user entered password to hashed password in database
storeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
storeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Store = mongoose.model('Store', storeSchema);

export default Store;
