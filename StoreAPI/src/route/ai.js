import express from 'express';
// Đảm bảo đường dẫn này là chính xác, không thừa thiếu .js
import aiController from '../controllers/aiController'; 

let router = express.Router();

// Route cho API Chat: /chat (khi được gắn vào web.js sẽ thành /api/ai/chat)
router.post('/chat', aiController.handleChatRequest); 

// Quan trọng: Phải export router object
export default router;