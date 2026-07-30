const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");

const verifyAuth = async (request, response, next) => {
  
  const header = request.headers.authorization;
  
  if (!header) {
    return response
      .status(403)
      .json({ message: "Unauthorized, missing headers" });
  }

  // Authorization header = "Bearer ***token here***"
  const [bearer, token] = header.split(" ");
  if (bearer !== "Bearer" || !token) {
    return response
      .status(403)
      .json({ message: "Unauthorized, missing token" });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decodedToken.sub;

    const user = await User.findById(userId);

    if (!user) {
      return response
        .status(403)
        .json({ message: "Unauthorized, invalid user/token" });
    }

    request.user = user;
    next();
  } catch (err) {
  console.error("verifyAuth error:", err);

  return response.status(500).json({
    message: err.message,
  });
}
};

module.exports = { verifyAuth };
