// StoreReactjs/src/component/Chatbot/ChatbotWidget.js

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItemCartStart } from '../../action/ShopCartAction';
import { toast } from 'react-toastify';
import CommonUtils from '../../utils/CommonUtils';

// **CẤU HÌNH QUAN TRỌNG:**
// Đảm bảo cổng 8080 khớp với cổng Backend (StoreAPI) của bạn
// URL gọi tới backend (Render) đã cấu hình /api/ai/chat
const CHAT_API_URL = `${process.env.REACT_APP_BACKEND_URL || 'https://api-n7s2.onrender.com'}/api/ai/chat`;

function ChatbotWidget() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
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

    // Hàm điều hướng đến trang chi tiết sản phẩm
    const handleViewProduct = (productId) => {
        navigate(`/detail-product/${productId}`);
        setIsOpen(false); // Đóng chatbot khi chuyển trang
    };

    // Hàm thêm sản phẩm vào giỏ hàng
    const handleAddToCart = (product) => {
        // Kiểm tra đăng nhập
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.id) {
            toast.warning('Bạn cần phải đăng nhập để thêm sản phẩm vào giỏ hàng');
            return;
        }

        // Kiểm tra sản phẩm có size không
        if (!product.productDetailSizeId) {
            toast.error('Sản phẩm này hiện không có size nào còn hàng');
            return;
        }

        // Thêm vào giỏ hàng
        dispatch(addItemCartStart({
            userId: userData.id,
            productdetailsizeId: product.productDetailSizeId,
            quantity: 1
        }));
        
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
    };

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
            const response = await fetch('https://api-n7s2.onrender.com/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: newHistory })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            // 3. Xử lý phản hồi từ Backend
            // Backend trả về { errCode: 0, reply: "...", products: [...] }
            const aiReply = data.reply; 
            const products = data.products || [];
            
            // Thêm phản hồi của AI vào lịch sử (bao gồm cả products nếu có)
            setMessages((prevMessages) => [...prevMessages, { 
                role: 'model', 
                text: aiReply,
                products: products
            }]);
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn đến API Chat:", error);
            setMessages((prevMessages) => [...prevMessages, { role: 'model', text: 'Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng liên hệ với bộ phận hỗ trợ.' }]);
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
                            <div key={index}>
                                <div 
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
                                
                                {/* Hiển thị sản phẩm nếu có */}
                                {msg.products && msg.products.length > 0 && (
                                    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                                        {msg.products.map((product, prodIndex) => (
                                            <div 
                                                key={prodIndex} 
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '8px',
                                                    padding: '8px',
                                                    marginBottom: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {/* Hình ảnh sản phẩm */}
                                                <img 
                                                    src={product.image || 'https://via.placeholder.com/60'}
                                                    alt={product.name}
                                                    onClick={() => handleViewProduct(product.id)}
                                                    style={{
                                                        width: '60px',
                                                        height: '60px',
                                                        objectFit: 'cover',
                                                        borderRadius: '5px',
                                                        marginRight: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                
                                                {/* Thông tin sản phẩm */}
                                                <div 
                                                    style={{ flexGrow: 1, cursor: 'pointer' }}
                                                    onClick={() => handleViewProduct(product.id)}
                                                >
                                                    <div style={{ 
                                                        fontWeight: '600', 
                                                        fontSize: '13px',
                                                        marginBottom: '4px',
                                                        color: '#333'
                                                    }}>
                                                        {product.name}
                                                    </div>
                                                    <div style={{ 
                                                        color: '#e53935', 
                                                        fontWeight: 'bold',
                                                        fontSize: '14px'
                                                    }}>
                                                        {CommonUtils.formatter.format(product.price)}
                                                    </div>
                                                </div>
                                                
                                                {/* Nút thêm giỏ hàng */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(product);
                                                    }}
                                                    style={{
                                                        backgroundColor: product.stock > 0 ? '#1E90FF' : '#ccc',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    disabled={product.stock === 0}
                                                >
                                                    {product.stock > 0 ? '+ Thêm' : 'Hết hàng'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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