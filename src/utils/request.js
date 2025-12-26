import { getToken } from "@/utils/auth";
import axios from 'axios';

// 创建axios实例
const service = axios.create({
    baseURL: window.baseUrl, // api的base_url
    timeout: 180000 // 请求超时时间
});

// request拦截器
service.interceptors.request.use(
    config => {
        // 在发送请求之前做些什么
        // 让每个请求携带token
        config.headers['Authorization'] = getToken();
        return config;
    },
    error => {
        // 对请求错误做些什么
        console.log(error); // for debug
        Promise.reject(error);
    }
);

// respone拦截器
service.interceptors.response.use(
    response => {
        const res = response.data;
        return res;
    },
    error => {
        console.log('err' + error); // for debug
        return Promise.reject(error);
    }
);

export default service;