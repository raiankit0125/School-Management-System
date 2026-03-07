import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getChatContacts,
  getChatThread,
  sendChatMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.use(protect);

router.get("/contacts", getChatContacts);
router.get("/thread/:otherUserId", getChatThread);
router.post("/send", sendChatMessage);

export default router;
