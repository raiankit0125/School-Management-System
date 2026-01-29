import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

dotenv.config({ path: "./.env" });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`✅ Server running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((err) => console.log("❌ DB Connection Failed:", err));
