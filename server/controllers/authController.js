const { User } = require("../models/index.js");
const { hashPassword, comparePassword } = require("../helpers/bcrypt.js");
const { signToken } = require("../helpers/jwt.js");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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
      const tokenResponse = await fetch(
        "https://github.com/login/oauth/access_token",
        {
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
        },
      );
      const tokenData = await tokenResponse.json();
      if (tokenData.error)
        throw {
          name: "Unauthorized",
          message: tokenData.error_description || "Invalid GitHub token",
        };
      const accessToken = tokenData.access_token;

      // 2. Fetch user profile
      const userResponse = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const githubProfile = await userResponse.json();

      if (githubProfile.message || !githubProfile.id) {
        throw {
          name: "Unauthorized",
          message: githubProfile.message || "Failed to fetch GitHub profile",
        };
      }

      // 3. Fetch primary email (since profile email can be null if private)
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const emailsData = await emailsResponse.json();

      let email = githubProfile.email;
      if (Array.isArray(emailsData)) {
        const primaryEmailObj =
          emailsData.find((e) => e.primary) || emailsData[0];
        if (primaryEmailObj) email = primaryEmailObj.email;
      }

      if (!email)
        throw {
          name: "BadRequest",
          message: "GitHub email not found or private",
        };

      const firstName =
        githubProfile.name?.split(" ")[0] || githubProfile.login || "User";
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
      console.error("GitHub Login Error:", err);
      next(err);
    }
  }

  // FORGOT PASSWORD
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) throw { name: "BadRequest", message: "Email required" };

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Untuk security, biasanya kita tidak memberitahu apakah emailnya salah atau tidak
        return res.json({
          message: "If that email is registered, a reset link has been sent.",
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000;
      await user.save();

      const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Dietary App Support" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Dietary - Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Reset Your Password</h2>
            <p>You requested a password reset. Click the button below to choose a new password. This link will expire in 1 hour.</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px; margin-bottom: 16px;">
              Reset Password
            </a>
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      res.json({
        message: "If that email is registered, a reset link has been sent.",
      });
    } catch (err) {
      next(err);
    }
  }

  // RESET PASSWORD
  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        throw {
          name: "BadRequest",
          message: "Token and new password required",
        };
      }

      const { Op } = require("sequelize");
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [Op.gt]: new Date() },
        },
      });

      if (!user) {
        throw {
          name: "BadRequest",
          message: "Invalid or expired password reset token",
        };
      }

      user.password = await hashPassword(newPassword);
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.json({ message: "Password has been successfully reset" });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
