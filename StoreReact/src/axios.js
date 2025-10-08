// import axios from "axios";
// import _ from "lodash";

// const instance = axios.create({
//     baseURL: process.env.REACT_APP_BACKEND_URL,

//     //  withCredentials: true
// });
// if (localStorage.getItem("token")) {
//     instance.interceptors.request.use(
//         (config) => {
//             config.headers.authorization =
//                 "Bearer " + localStorage.getItem("token").replaceAll('"', "");

//             return config;
//         },
//         (error) => {
//             return Promise.reject(error);
//         }
//     );
// }

// instance.interceptors.response.use((response) => {
//     // Thrown error for request with OK status code
//     const { data } = response;
//     return response.data;
// });

// export default instance;


import axios from "axios";
import _ from "lodash";

// Tạo instance
const instance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    // withCredentials: true
});

// Gắn token nếu có
if (localStorage.getItem("token")) {
    instance.interceptors.request.use(
        (config) => {
            config.headers.authorization =
                "Bearer " + localStorage.getItem("token").replaceAll('"', "");
            return config;
        },
        (error) => Promise.reject(error)
    );
}

// Response interceptor: chỉ trả về response.data
instance.interceptors.response.use((response) => {
    return response.data;
});

// ==================== MOCK TẠM THỜI ====================
if (process.env.REACT_APP_USE_API_MOCK === "true") {
    console.log("✅ Mock API đang được sử dụng");

    instance.get = async (url, config) => {
        switch (url) {
            case "/users":
                return Promise.resolve([
                    { id: 1, name: "Nguyễn Văn A" },
                    { id: 2, name: "Trần Thị B" }
                ]);
            case "/me":
                return Promise.resolve({ id: 1, name: "Mocked User", email: "mock@example.com" });
            default:
                return Promise.reject(new Error("Mocked GET endpoint không tồn tại: " + url));
        }
    };

    instance.post = async (url, data, config) => {
        switch (url) {
            case "/login":
                return Promise.resolve({ token: "mocked-token-123" });
            default:
                return Promise.reject(new Error("Mocked POST endpoint không tồn tại: " + url));
        }
    };
}

// =======================================================

export default instance;
