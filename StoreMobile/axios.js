import axios from "axios";
import _ from "lodash";

import AsyncStorage from "@react-native-async-storage/async-storage";
const instance = axios.create({
    baseURL: "http://192.168.1.185:8003",
    //  withCredentials: true
});

AsyncStorage.getItem("token").then((value) => {
    if (value) {
        instance.interceptors.request.use(
            (config) => {
                config.headers.authorization =
                    "Bearer " + value.replace('"', "");
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
    }
}); // Add some error handling, also you can simply do setIsFirstLaunch(null)

instance.interceptors.response.use((response) => {
    // Thrown error for request with OK status code
    const { data } = response;
    return response.data;
});

export default instance;
