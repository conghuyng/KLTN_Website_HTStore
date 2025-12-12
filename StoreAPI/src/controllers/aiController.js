import aiService from '../services/aiService'; // Import service object (giả định service dùng export default hoặc CommonJS)
import dotenv from 'dotenv';

dotenv.config();

/**
 * Xử lý yêu cầu POST từ Frontend
 * Payload mong đợi từ client: { history: [{ role: 'user', text: '...' }, ...] }
 */
let handleChatRequest = async (req, res) => {
    try {
        // Lịch sử chat được gửi từ React Frontend
        // Sử dụng giá trị mặc định là mảng rỗng để tránh lỗi .map()
        const { history = [] } = req.body; 
        
        if (history.length === 0) {
            return res.status(400).json({ 
                errCode: 1, 
                message: "Thiếu dữ liệu lịch sử chat." 
            });
        }
        
        // 1. Tách tin nhắn mới nhất và lịch sử chat cũ
        // Tin nhắn mới nhất là phần tử cuối cùng
        const userPrompt = history[history.length - 1].text;
        // Lịch sử chat (từ đầu đến phần tử áp cuối)
        const chatHistory = history.slice(0, -1);

        // 2. Lấy Product Context (Danh sách sản phẩm đang hoạt động)
        const productContext = await aiService.prepareProductContext();

        // 3. Gọi hàm service để giao tiếp với AI (với cả context)
        let aiReply = await aiService.getAIChatResponse(
            userPrompt,
            productContext,
            chatHistory
        );
        
        // 4. Parse product IDs từ AI reply
        let productIds = [];
        let textReply = aiReply;
        
        // Tìm pattern [PRODUCTS: id1, id2, id3]
        const productMatch = aiReply.match(/\[PRODUCTS:\s*([\d,\s]+)\]/);
        if (productMatch) {
            // Lấy danh sách IDs
            productIds = productMatch[1].split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            // Xóa phần [PRODUCTS: ...] khỏi text reply
            textReply = aiReply.replace(/\[PRODUCTS:\s*[\d,\s]+\]/g, '').trim();
        }
        
        // 5. Lấy thông tin chi tiết sản phẩm nếu có
        let products = [];
        if (productIds.length > 0) {
            const productService = require('../services/productService');
            const allProducts = await productService.getProductsForAI();
            
            // Filter các sản phẩm được AI gợi ý
            products = allProducts.filter(p => productIds.includes(p.id));
        }
        
        // Trả về câu trả lời cho Frontend
        return res.status(200).json({
            errCode: 0,
            message: 'OK',
            reply: textReply,
            products: products  // Thêm danh sách sản phẩm
        });

    } catch (e) {
        console.error("Lỗi Controller xử lý Chat:", e);
        // Lấy thông báo lỗi cụ thể để trả về
        const errorMessage = e.message || e;

        return res.status(500).json({
            errCode: -1,
            message: 'Lỗi server nội bộ.',
            internalError: errorMessage
        });
    }
}

export default {
    handleChatRequest
};