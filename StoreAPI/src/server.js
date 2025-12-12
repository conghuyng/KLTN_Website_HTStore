import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine.js";
import initwebRoutes from "./route/web";
import connectDB from "./config/connectDB";
import http from "http";
import { sendMessage } from "./services/messageService";
import cors from 'cors'; // Bổ sung import thư viện cors
require("dotenv").config();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

let app = express();

// Lấy URL của React Frontend từ .env (đã xác nhận là http://localhost:5000)
const URL_REACT = process.env.URL_REACT || 'http://localhost:5000';

// ===============================================
// BƯỚC 1: CẤU HÌNH CORS VỚI THƯ VIỆN `CORS` (KHẮC PHỤC LỖI PREFLIGHT)
// ===============================================

const corsOptions = {
    // Chỉ cho phép origin duy nhất là Frontend
    origin: URL_REACT, 
    // Bắt buộc phải là true vì Frontend cần gửi cookies/headers xác thực
    credentials: true, 
};

// Sử dụng thư viện cors để xử lý tất cả các yêu cầu CORS và Preflight (OPTIONS)
app.use(cors(corsOptions)); 

// LOẠI BỎ MIDDLEWARE CORS THỦ CÔNG CŨ

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

viewEngine(app);
// Chỉnh lại hàm connectDB nếu nó đang nhận app
connectDB(); // Giả định connectDB không cần đối số app

initwebRoutes(app); // Gọi initwebRoutes sau khi cấu hình app


const server = http.createServer(app);

// ===============================================
// BƯỚC 2: CẤU HÌNH SOCKET.IO VỚI ORIGIN CHÍNH XÁC
// ===============================================

const socketIo = require("socket.io")(server, {
    cors: {
        // Cần chỉ định origin chính xác
        origin: URL_REACT, 
        methods: ["GET", "POST"],
    },
});

socketIo.on("connection", (socket) => {
    console.log("New client connected" + socket.id);

    socket.on("sendDataClient", function (data) {
        sendMessage(data);
        socketIo.emit("sendDataServer", { data });
    });
    socket.on("loadRoomClient", function (data) {
        socketIo.emit("loadRoomServer", { data });
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});
let port = process.env.PORT || 6969;

server.listen(port, () => {
    console.log("Backend Nodejs is running on the port : " + port);
});