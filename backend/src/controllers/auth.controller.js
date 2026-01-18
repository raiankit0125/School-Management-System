import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { Teacher } from "../models/Teacher.model.js";
import { Student } from "../models/Student.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });

    // auto create profile doc
    if (role === "TEACHER") await Teacher.create({ user: user._id });
    if (role === "STUDENT") await Student.create({ user: user._id });

    return res.status(201).json(
      new ApiResponse(201, {
        user: { id: user._id, name: user.name, role: user.role, email: user.email },
        token: generateToken(user._id),
      }, "Registered")
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await user.isPasswordCorrect(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    return res.json(
      new ApiResponse(200, {
        user: { id: user._id, name: user.name, role: user.role, email: user.email },
        token: generateToken(user._id),
      }, "Logged in")
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
