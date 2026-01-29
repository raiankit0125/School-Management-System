import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { Teacher } from "../models/Teacher.model.js";
import { Student } from "../models/Student.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const ALLOWED_ROLES = ["ADMIN", "TEACHER", "STUDENT"];
const normalizeRole = (role) => (ALLOWED_ROLES.includes(role) ? role : "STUDENT");

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedRole = normalizeRole(role);

    if (normalizedRole === "ADMIN") {
      const adminExists = await User.exists({ role: "ADMIN" });
      if (adminExists) {
        return res.status(403).json({ message: "Admin already exists" });
      }
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
      mustChangePassword: false,
    });

    // auto create profile doc
    if (normalizedRole === "TEACHER") await Teacher.create({ user: user._id });
    if (normalizedRole === "STUDENT") await Student.create({ user: user._id });

    return res.status(201).json(
      new ApiResponse(201, {
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          email: user.email,
          mustChangePassword: user.mustChangePassword,
        },
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
      new ApiResponse(
        200,
        {
          user: {
            id: user._id,
            name: user.name,
            role: user.role,
            email: user.email,
            mustChangePassword: user.mustChangePassword,
          },
          token: generateToken(user._id),
        },
        "Logged in"
      )
    );
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
