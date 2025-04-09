// import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";

// ======================
// Register User
// ======================
export const register = async (req, res) => {
  try{
    const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Please fill the full form!",
    });
  }

  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return res.status(400).json({
      success: false,
      message: "Email already registered!",
    });
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });

  sendToken(user, 201, res, "User registered successfully!");
  }
  catch(error){
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================
// Login User
// ======================
export const login = async (req, res) => {
  try{
    const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Please provide email, password, and role!",
    });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password!",
    });
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password!",
    });
  }

  if (user.role !== role) {
    return res.status(404).json({
      success: false,
      message: `User with provided email and role '${role}' not found!`,
    });
  }

  sendToken(user, 200, res, "User logged in successfully!");
  }
  catch(error){
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================
// Logout User
// ======================
export const logout = async (req, res) => {
  try{
    res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged out successfully!",
    });
  }
  catch(error){
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================
// Get Logged-in User
// ======================
export const getUser = (req, res) => {
  try{
    const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
  }
  catch(error){
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
