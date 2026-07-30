const mongoose = require("mongoose");

// Step 1: Create a Schema
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

 email: {
  type: String,
  unique: true,
  sparse: true,
  lowercase: true,
  trim: true,
  default: undefined,
},

  phone: {
  type: String,
  unique: true,
  sparse: true,
  default: undefined,
},

  passwordHash: {
    type: String,
    required: true,
  },
});

// Step 2: Create a model from the Schema
const User = mongoose.model("User", userSchema);

// Step 3: Export/expose the Model
module.exports = { User };
