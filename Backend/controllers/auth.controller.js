import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import {
  senderVerficationEmail,
  sendForgotPassword,
} from "../utils/emailService.js";
import jwt from "jsonwebtoken";

// to register a user
export const register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = req.body.role || "user";

    // generate a otp
    const verficationOTP = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const verificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 min

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      verficationOTP,
      verificationOTPExpires,
    });

    //to send verifiaction email
    try {
      await senderVerficationEmail(email, name, verficationOTP);
    } catch (error) {
      console.error("Failed to send verfication Email:", error);
    }
    res.status(201).json({
      success: true,
      message:
        "Account create Successfully! please chec your email for 6-digit verfication code",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: false,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// to login a user

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email address before logging in",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // to generate a token

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(200).json({
      success: true,
      message: "Login Successfull",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// to verify the email

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and otp are required",
      });
    }

    const user = await User.findOne({
      email,
      verificationOTP: otp,
      verificationOTPExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully! you can now login",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// if user forgot password

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is Required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User with email is not found",
      });
    }

    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOTPExpires = Date.now() + 10 * 60 * 1000; //10 min

    user.resetPasswordOTP = resetOTP;
    user.resetPasswordOTPExpires = resetOTPExpires;
    await user.save();

    try {
      await sendForgotPassword(email, user.name, resetOTP);
    } catch (error) {
      console.error("Failed to send reset email:", error);
    }
    res.status(200).json({
      success: true,
      message: "Password rest to OTP send two your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//reset the password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email,OTP and NewPassword is Required",
      });
    }

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or Expires OTP",
      });
    }

    // to hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password reset successfull you can now  login with you new password",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
