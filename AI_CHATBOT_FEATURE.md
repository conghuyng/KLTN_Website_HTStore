# Tính Năng AI Chatbot - Hiển Thị Sản Phẩm

## Tổng Quan
Tính năng AI Chatbot đã được cải tiến để hiển thị sản phẩm với hình ảnh, cho phép người dùng:
- Xem hình ảnh sản phẩm trực tiếp trong chat
- Click vào sản phẩm để xem chi tiết
- Click nút "+ Thêm" để chuyển đến trang chi tiết sản phẩm

## Cách Hoạt Động

### Backend (StoreAPI)

#### 1. **productService.js** - Lấy thông tin sản phẩm với hình ảnh
```javascript
let getProductsForAI = () => {
    // Lấy 20 sản phẩm mới nhất
    // Bao gồm: id, name, price, description, image
    // Image được convert từ Buffer sang binary string
}
```

#### 2. **aiService.js** - AI instruction được cập nhật
```javascript
const systemInstruction = `...
QUAN TRỌNG: Khi gợi ý sản phẩm, bạn PHẢI kết thúc câu trả lời với dòng "[PRODUCTS: id1, id2, id3]" 
trong đó id1, id2, id3 là ID của các sản phẩm bạn gợi ý. Ví dụ: "[PRODUCTS: 5, 12, 8]"`;
```

#### 3. **aiController.js** - Parse và trả về sản phẩm
- Parse pattern `[PRODUCTS: id1, id2, id3]` từ AI response
- Lấy thông tin chi tiết sản phẩm từ database
- Trả về cả text và danh sách sản phẩm:
```json
{
  "errCode": 0,
  "reply": "Text từ AI...",
  "products": [
    {
      "id": 5,
      "name": "Tên sản phẩm",
      "price": 100000,
      "image": "base64_image_string",
      "brandData": {...},
      "categoryData": {...}
    }
  ]
}
```

### Frontend (StoreReactjs)

#### **ChatboxWidget.js** - Hiển thị sản phẩm

**Cấu trúc tin nhắn:**
```javascript
{
  role: 'model',
  text: 'Câu trả lời từ AI',
  products: [...]  // Danh sách sản phẩm
}
```

**Hiển thị sản phẩm:**
- Hình ảnh: 60x60px, có thể click để xem chi tiết
- Tên sản phẩm: Click để xem chi tiết
- Giá: Định dạng tiền tệ VND
- Nút "+ Thêm": Chuyển đến trang chi tiết sản phẩm

**Xử lý khi click:**
```javascript
handleViewProduct(productId) {
  navigate(`/detail-product/${productId}`);
  setIsOpen(false); // Đóng chatbot
}
```

## Cách Sử Dụng

### 1. Khởi động Backend
```bash
cd StoreAPI
npm start
```

### 2. Khởi động Frontend
```bash
cd StoreReactjs
npm start
```

### 3. Test tính năng
1. Mở website và click vào icon chatbot (💬)
2. Hỏi AI về sản phẩm, ví dụ:
   - "Tôi muốn mua laptop"
   - "Có áo thun nào đẹp không?"
   - "Giới thiệu cho tôi điện thoại"
3. AI sẽ gợi ý sản phẩm kèm hình ảnh
4. Click vào hình ảnh hoặc tên sản phẩm để xem chi tiết
5. Click nút "+ Thêm" để chuyển đến trang chi tiết sản phẩm

## Yêu Cầu

### Backend
- Đảm bảo có dữ liệu sản phẩm trong database
- Các bảng: Product, ProductDetail, ProductImage
- Sản phẩm phải có statusId = 'S1' (đang hoạt động)

### Frontend
- CommonUtils.formatter phải được định nghĩa để format giá
- Router phải có route `/detail-product/:id`

## Lưu Ý

1. **Hình ảnh sản phẩm**: Nếu không có hình ảnh, sẽ hiển thị placeholder
2. **Click behavior**: 
   - Click vào hình ảnh/tên sản phẩm → Xem chi tiết
   - Click nút "+ Thêm" → Chuyển đến trang chi tiết
3. **AI Pattern**: AI phải trả về format `[PRODUCTS: id1, id2, id3]` để frontend parse được
4. **Giới hạn**: Tối đa 3 sản phẩm được gợi ý mỗi lần (theo system instruction)

## Troubleshooting

### Sản phẩm không hiển thị hình ảnh
- Kiểm tra ProductImage table có dữ liệu không
- Kiểm tra image được convert đúng từ Buffer

### AI không gợi ý sản phẩm
- Kiểm tra AI có trả về pattern `[PRODUCTS: ...]` không
- Xem console log trong aiController.js

### Click không hoạt động
- Kiểm tra router có route `/detail-product/:id` không
- Kiểm tra productId có đúng không

## Files Đã Thay Đổi

### Backend
- ✅ `StoreAPI/src/services/productService.js` - Thêm image vào getProductsForAI
- ✅ `StoreAPI/src/services/aiService.js` - Cập nhật system instruction
- ✅ `StoreAPI/src/controllers/aiController.js` - Parse và trả về products

### Frontend
- ✅ `StoreReactjs/src/component/Chatbox/ChatboxWidget.js` - Hiển thị sản phẩm với hình ảnh và nút thêm
