import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const authentication = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization;

    // cek token ada atau tidak
    if (!bearer) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // format: Bearer token
    const token = bearer.split(" ")[1];

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // cari user di DB
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // simpan user ke req
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
