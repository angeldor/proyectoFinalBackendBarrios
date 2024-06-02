import mongoose from 'mongoose';

const usersCollection = 'users';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["usuario", "premium"],
    default: "usuario",
  },
  documents: [
    {
      name: String,
      reference: String
    }
  ],
  last_conection: Date
});

export const userModel = mongoose.model(usersCollection, userSchema);