import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { senderVerficationEmail } from "../utils/emailService.js";
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
    const userRole = role || "user";

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
      (res.status(401),
        json({
          success: false,
          message: "Please verify your email address before logging in",
        }));
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

//to verify the email
