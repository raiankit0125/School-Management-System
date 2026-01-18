import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await user.isPasswordCorrect(oldPassword);
    if (!ok) return res.status(400).json({ message: "Old password incorrect" });

    user.password = newPassword; // pre-save hook will hash
    user.mustChangePassword = false;
    user.passwordChangedAt = new Date();

    await user.save();

    return res.json(new ApiResponse(200, null, "Password changed successfully ✅"));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
