// StoreReactjs/src/component/Chatbot/ChatbotWidget.js

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// **CẤU HÌNH QUAN TRỌNG:**
// Đảm bảo cổng 8080 khớp với cổng Backend (StoreAPI) của bạn
// URL này gọi đến route /api/ai/chat bạn vừa thiết lập trong web.js
const CHAT_API_URL = 'http://localhost:8003/api/ai/chat'

function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false); // Trạng thái mở/đóng cửa sổ chat
    const [messages, setMessages] = useState([
        // Tin nhắn chào mừng mặc định
        { role: 'model', text: 'Chào bạn! Tôi là tư vấn viên AI của HTStore. Tôi có thể giúp bạn tìm kiếm sản phẩm hoặc tư vấn về chính sách nhé.' }
    ]);
    const [input, setInput] = useState(''); // Giá trị ô nhập liệu
    const [isLoading, setIsLoading] = useState(false); // Trạng thái chờ phản hồi
    const messagesEndRef = useRef(null); // Dùng để tự động cuộn

    // Tự động cuộn xuống tin nhắn mới nhất
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() === '' || isLoading) return;

        // 1. Chuẩn bị tin nhắn mới và lịch sử
        const userMessage = { role: 'user', text: input };
        const newHistory = [...messages, userMessage];
        
        // Cập nhật trạng thái UI ngay lập tức
        setMessages(newHistory);
        setInput('');
        setIsLoading(true);

        // 2. Gửi request đến Backend (StoreAPI)
        try {
            const response = await axios.post(CHAT_API_URL, { 
                history: newHistory, // Gửi toàn bộ lịch sử để AI giữ bối cảnh
            });

            // 3. Xử lý phản hồi từ Backend
            // Backend trả về { errCode: 0, reply: "..." }
            const aiReply = response.data.reply; 
            
            // Thêm phản hồi của AI vào lịch sử
            setMessages((prevMessages) => [...prevMessages, { role: 'model', text: aiReply }]);
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn đến API Chat:", error);
            setMessages((prevMessages) => [...prevMessages, { role: 'model', text: 'Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng kiểm tra server Backend.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    //==============================================
    //               GIAO DIỆN CHATBOT
    //==============================================
    return (
        <div className="chatbot-container">
            {/* Nút bật tắt widget (Bạn cần thêm icon và CSS) */}
            <button 
                className="chatbot-toggle-button" 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 9999,
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#1E90FF',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer'
                }}
            >
                {isOpen ? '✖' : '💬'} 
            </button>

            {/* Cửa sổ Chat */}
            {isOpen && (
                <div 
                    className="chatbot-window"
                    style={{
                        position: 'fixed',
                        bottom: '90px',
                        right: '20px',
                        width: '350px',
                        height: '450px',
                        backgroundColor: '#f9f9f9',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 9998
                    }}
                >
                    <div className="chatbot-header" style={{ padding: '10px', backgroundColor: '#1E90FF', color: 'white', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', textAlign: 'center' }}>
                        Tư Vấn AI [HTStore]
                    </div>
                    
                    <div className="chatbot-messages" style={{ flexGrow: 1, padding: '10px', overflowY: 'auto' }}>
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`message ${msg.role}`}
                                style={{
                                    marginBottom: '10px',
                                    maxWidth: '80%',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    backgroundColor: msg.role === 'user' ? '#DCF8C6' : '#FFFFFF',
                                    marginLeft: msg.role === 'user' ? 'auto' : '0'
                                }}
                            >
                                {msg.role === 'model' && <strong>AI: </strong>}
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && <div className="message model">AI đang gõ...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-area" style={{ padding: '10px', borderTop: '1px solid #ddd', display: 'flex' }}>
                        <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Nhập câu hỏi..."
                            disabled={isLoading}
                            style={{ flexGrow: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '5px', marginRight: '5px' }}
                        />
                        <button 
                            onClick={handleSendMessage} 
                            disabled={isLoading}
                            style={{ padding: '8px 15px', border: 'none', backgroundColor: '#00BFFF', color: 'white', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            Gửi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatbotWidget;