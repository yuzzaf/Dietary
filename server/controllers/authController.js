const { User } = require("../models/index.js");
const { hashPassword, comparePassword } = require("../helpers/bcrypt.js");
const { signToken } = require("../helpers/jwt.js");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const AuthController = class AuthController {
  // REGISTER
  static async register(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        throw { name: "BadRequest", message: "Email & password required" };
      }

      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
      });

      res.status(201).json({
        id: user.id,
        email: user.email,
      });
    } catch (err) {
      next(err);
    }
  }

  // LOGIN
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw { name: "BadRequest", message: "Email & password required" };
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw { name: "Unauthorized", message: "Invalid email/password" };
      }

      const isValid = comparePassword(password, user.password);

      if (!isValid) {
        throw { name: "Unauthorized", message: "Invalid email/password" };
      }

      const access_token = signToken({ id: user.id });

      res.json({ access_token });
    } catch (err) {
      next(err);
    }
  }

  // GOOGLE LOGIN
  static async googleLogin(req, res, next) {
    try {
      const { id_token } = req.body;

      if (!id_token) {
        throw { name: "BadRequest", message: "Google token required" };
      }

      const ticket = await client.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      const email = payload.email;
      const firstName =
        payload.given_name || payload.name?.split(" ")[0] || "User";
      const lastName =
        payload.family_name ||
        payload.name?.split(" ").slice(1).join(" ") ||
        "-";

      let user = await User.findOne({ where: { email } });

      if (!user) {
        user = await User.create({
          email,
          google_id: payload.sub,
          password: "google_login",
          firstName,
          lastName,
        });
      } else if (!user.google_id) {
        await user.update({ google_id: payload.sub });
      }

      const access_token = signToken({ id: user.id });

      res.json({ access_token });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
