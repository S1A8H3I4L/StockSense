const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

// @desc  Register new user
// @route POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get current logged in user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc  Request OTP for password reset
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: "StockSense - Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`,
    });

    res.json({ message: "OTP sent to your registered email address" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Verify OTP
// @route POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+otp +otpExpires");

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Reset password after OTP verification
// @route POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+otp +otpExpires");

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful. Please login with your new password." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    if (req.body.password) user.password = req.body.password;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, getMe, forgotPassword, verifyOtp, resetPassword, updateProfile };
