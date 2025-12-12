// BẮT BUỘC: Đọc biến môi trường từ .env
require('dotenv').config(); 

// Import service để lấy dữ liệu sản phẩm
const productService = require('./productService');

// === PHẦN CONFIG VÀ LOGIC GỌI API GEMINI (SỬ DỤNG FETCH TIÊU CHUẨN NODE.JS) ===

// Lấy API Key từ biến môi trường (Ưu tiên dùng GEMINI_API_KEY của bạn)
const API_KEY = process.env.GEMINI_API_KEY || ""; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
const MODEL = "gemini-2.5-flash-preview-09-2025"; 

// System Prompt: Định hình vai trò của Chatbot
const systemInstruction = `Bạn là Trợ lý Mua sắm thông minh của hệ thống bán hàng. Nhiệm vụ của bạn là phân tích nhu cầu của khách hàng (về sản phẩm, chất liệu, chức năng, phong cách, màu sắc, và kích cỡ), sau đó gợi ý TỐI ĐA 3 sản phẩm CÓ SẴN trong kho hàng (dựa trên DANH SÁCH SẢN PHẨM cung cấp), đồng thời hỏi thêm một câu hỏi để làm rõ nhu cầu của khách hàng. Phản hồi phải ngắn gọn, thân thiện và tập trung vào lợi ích sản phẩm.

QUAN TRỌNG: Khi gợi ý sản phẩm, bạn PHẢI kết thúc câu trả lời với dòng "[PRODUCTS: id1, id2, id3]" trong đó id1, id2, id3 là ID của các sản phẩm bạn gợi ý. Ví dụ: "[PRODUCTS: 5, 12, 8]"`;


/**
 * 1. Hàm chuẩn bị danh sách sản phẩm thành chuỗi context
 */
let prepareProductContext = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Lưu ý: Cần đảm bảo hàm getProductsForAI đã được export trong productService
            const products = await productService.getProductsForAI(); 

            if (!products || products.length === 0) {
                return resolve("Không tìm thấy dữ liệu sản phẩm nào trong kho.");
            }

            // Định dạng dữ liệu thành chuỗi Markdown
            const formattedProducts = products.map(p => {
                const safeDescription = (p.description || '').replace(/"/g, "'");

                // Thêm tiêu đề 'Sản phẩm' để AI dễ nhận biết
                return `**Sản phẩm ID ${p.id}**: Tên: "${p.name}", Giá: ${p.price}, Thương hiệu: ${p.brandData.value}, Danh mục: ${p.categoryData.value}, Mô tả ngắn: "${safeDescription}"`;
            }).join('\n');

            // Tạo chuỗi context hoàn chỉnh
            const contextString = `--- DANH SÁCH SẢN PHẨM HIỆN CÓ TRONG KHO (Dùng để tham chiếu và gợi ý) ---\n\n${formattedProducts}`;
            
            resolve(contextString);

        } catch (e) {
            console.error("Lỗi khi chuẩn bị dữ liệu sản phẩm cho AI:", e);
            reject("Lỗi hệ thống khi chuẩn bị dữ liệu sản phẩm.");
        }
    })
}

/**
 * 2. Hàm gọi API Gemini để nhận phản hồi với Context (sản phẩm)
 */
let getAIChatResponse = (userPrompt, productContext, chatHistory) => {
    return new Promise(async (resolve, reject) => {
        if (!API_KEY) {
            console.error("Lỗi: Không tìm thấy GEMINI_API_KEY trong biến môi trường.");
            return reject("Thiếu cấu hình API Key. Vui lòng kiểm tra file .env.");
        }
        
        try {
            // Thêm Product Context vào System Instruction để AI luôn nhớ đến kho hàng
            const fullSystemInstruction = `${systemInstruction}\n\n${productContext}`;
            
            // Xây dựng contents từ lịch sử chat và tin nhắn mới
            const contents = chatHistory.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            // Thêm tin nhắn mới nhất của người dùng vào contents
            contents.push({
                role: 'user',
                parts: [{ text: userPrompt }]
            });
            
            // Payload cho Gemini API
            const payload = {
                contents: contents,
                systemInstruction: {
                    parts: [{ text: fullSystemInstruction }]
                },
                // tools: [{ "google_search": {} }],
            };

            // === Logic gọi API với Exponential Backoff ===
            const maxRetries = 3;
            for (let i = 0; i < maxRetries; i++) {
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const result = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(`API returned status ${response.status}: ${JSON.stringify(result)}`);
                    }

                    const candidate = result.candidates?.[0];
                    if (candidate && candidate.content?.parts?.[0]?.text) {
                        resolve(candidate.content.parts[0].text);
                        return;
                    } else {
                        throw new Error("Phản hồi từ AI không chứa nội dung.");
                    }

                } catch (error) {
                    if (i < maxRetries - 1) {
                        const delay = Math.pow(2, i) * 1000;
                        await new Promise(res => setTimeout(res, delay));
                        // console.log(`Retrying API call in ${delay}ms...`);
                    } else {
                        throw error;
                    }
                }
            }


        } catch (e) {
            console.error("Lỗi khi gọi API Gemini:", e);
            reject("Xin lỗi, hiện tại tôi đang gặp sự cố kết nối AI. Vui lòng thử lại sau hoặc liên hệ với bộ phận hỗ trợ.");
        }
    });
}

// === ĐÃ CHUYỂN SANG CÚ PHÁP COMMONJS CHO ĐỒNG BỘ VỚI CONTROLLER ===
module.exports = {
    prepareProductContext: prepareProductContext,
    getAIChatResponse: getAIChatResponse
};
