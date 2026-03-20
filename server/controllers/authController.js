const { User } = require("../models/index.js");
const { hashPassword, comparePassword } = require("../helpers/bcrypt.js");
const { signToken } = require("../helpers/jwt.js");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");

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

      const isValid = await comparePassword(password, user.password);

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
          googleId: payload.sub,
          password: crypto.randomBytes(16).toString("hex"),
          firstName,
          lastName,
        });
      } else if (!user.googleId) {
        await user.update({ googleId: payload.sub });
      }

      const access_token = signToken({ id: user.id });

      res.json({ access_token });
    } catch (err) {
      next(err);
    }
  }

  // GITHUB LOGIN
  static async githubLogin(req, res, next) {
    try {
      const { code } = req.body;
      if (!code) throw { name: "BadRequest", message: "GitHub code required" };

      // 1. Exchange code for access token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenData = await tokenResponse.json();
      if (tokenData.error) throw { name: "Unauthorized", message: tokenData.error_description || "Invalid GitHub token" };
      const accessToken = tokenData.access_token;

      // 2. Fetch user profile
      const userResponse = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const githubProfile = await userResponse.json();

      // 3. Fetch primary email (since profile email can be null if private)
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const emailsData = await emailsResponse.json();
      const primaryEmailObj = emailsData.find((e) => e.primary) || emailsData[0];
      const email = primaryEmailObj?.email;

      if (!email) throw { name: "BadRequest", message: "GitHub email not found" };

      const firstName = githubProfile.name?.split(" ")[0] || githubProfile.login || "User";
      const lastName = githubProfile.name?.split(" ").slice(1).join(" ") || "-";

      let user = await User.findOne({ where: { email } });

      if (!user) {
        user = await User.create({
          email,
          githubId: githubProfile.id.toString(),
          password: crypto.randomBytes(16).toString("hex"),
          firstName,
          lastName,
          profilePicture: githubProfile.avatar_url,
        });
      } else if (!user.githubId) {
        await user.update({ githubId: githubProfile.id.toString() });
      }

      const access_token = signToken({ id: user.id });

      res.json({ access_token });
    } catch (err) {
      console.error('GitHub Login Error:', err);
      next(err);
    }
  }
};

module.exports = AuthController;
