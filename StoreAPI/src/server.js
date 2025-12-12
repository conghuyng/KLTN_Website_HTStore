import express from "express";
import bodyParser from "body-parser";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";

import viewEngine from "./config/viewEngine.js";
import initwebRoutes from "./route/web.js";
import connectDB from "./config/connectDB.js";
import { sendMessage } from "./services/messageService.js";

dotenv.config();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const app = express();

// Lấy URL REACT từ ENV
const URL_REACT = process.env.URL_REACT || "http://localhost:5000";

// ==========================
// CORS CHUẨN CHO RAILWAY
// ==========================
const corsOptions = {
    origin: URL_REACT,
    credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Cấu hình view engine
viewEngine(app);

// Kết nối DB
connectDB();

// Khai báo routes
initwebRoutes(app);

const server = http.createServer(app);

// ==========================
// SOCKET.IO CHUẨN ESM
// ==========================
import { Server } from "socket.io";

const io = new Server(server, {
    cors: {
        origin: URL_REACT,
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("sendDataClient", (data) => {
        sendMessage(data);
        io.emit("sendDataServer", { data });
    });

    socket.on("loadRoomClient", (data) => {
        io.emit("loadRoomServer", { data });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// ==========================
// START SERVER
// ==========================
const port = process.env.PORT || 6969;

server.listen(port, () => {
    console.log("Backend Nodejs is running on the port:", port);
});
