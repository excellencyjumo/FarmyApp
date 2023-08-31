import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const farmSchema = mongoose.Schema(
  {
    farmName: {
      type: String,
      required: true,
    },
    farmAddress: {
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
      // required: true,
    },
    // one of the following 4 will be filled, or the password field is available
		googleID: {
			type: String,
		},
		githubID: {
			type: String,
		},
		twitterID: {
			type: String,
		},
		linkedinID: {
			type: String,
		},
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
farmSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
farmSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const Farm = mongoose.model('Farm', farmSchema);

export default Farm;
