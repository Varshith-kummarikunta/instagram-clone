const { User } = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signToken = (userId) => {
  // (payload, secret, options)
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const userLogin = async (request, response) => {
  const { identifier, password } = request.body;

  if (!identifier || !password) {
    return response
      .status(400)
      .json({ message: "Please fill all the details" });
  }

  const normalizedIdentifier = identifier.includes("@")
    ? identifier.toLowerCase()
    : identifier;

  const user = await User.findOne({
    $or: [
      { email: normalizedIdentifier },
      { username: normalizedIdentifier },
      { phone: normalizedIdentifier },
    ],
  });

  if (!user) {
    return response.status(400).json({
      message: "Invalid credentials",
    });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return response.status(400).json({
      message: "Invalid credentials",
    });
  }

  const token = signToken(user._id);

  const userObj = user.toObject();
  delete userObj.passwordHash;

  return response.status(200).json({
    token,
    ...userObj,
  });
};
const userSignup = async (request, response) => {
  let { username, identifier, password, name } = request.body;


  if (!username || !password || !identifier || !name) {
    return response
      .status(400)
      .json({ message: "Please fill all the details" });
  }


  username = username.toLowerCase().trim();
  identifier = identifier.toLowerCase().trim();

  const isEmail = identifier.includes("@");

  if (!isEmail && !/^\d{10}$/.test(identifier)) {
    return response.status(400).json({
      message: "Enter a valid email or 10-digit phone number.",
    });
  }

  let email = null;
let phone = null;

if (isEmail) {
  email = identifier.toLowerCase().trim();
} else {
  phone = identifier.trim();
}

  // If user already exists
 const existingUser = await User.findOne({
  $or: [
    ...(email ? [{ email }] : []),
    ...(phone ? [{ phone }] : []),
    { username },
  ],
});

  if (existingUser) {
    return response.status(400).json({
      message: "Email, phone number or username already exists.",
    });
  }
  // hashing password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // create a new user
  const newUser = new User({
    username,
    email,
    phone,
    passwordHash,
    name,
  });
  const savedUser = await newUser.save();

  if (!savedUser) {
    return response.status(500).json({ message: "Internal Server Error" });
  }

  const token = signToken(savedUser._id);

  // converting mongoose document to plain JS object
  const userObj = savedUser.toObject();
  delete userObj.passwordHash;

  return response.status(200).json({ token, ...userObj });
};

module.exports = { userLogin, userSignup };
