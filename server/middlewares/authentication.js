const jwt = require("jsonwebtoken");
const { User } = require("../models/index.js");

const authentication = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization;

    if (!bearer) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = bearer.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authentication;