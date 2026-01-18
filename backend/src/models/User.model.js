import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },

    mustChangePassword: { type: Boolean, default: true },
    passwordChangedAt: { type: Date },

    role: {
      type: String,
      enum: ["ADMIN", "TEACHER", "STUDENT"],
      default: "STUDENT",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (pass) {
  return bcrypt.compare(pass, this.password);
};

export const User = mongoose.model("User", userSchema);
