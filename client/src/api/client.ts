// src/api/client.ts
import clientLocalStorage from '@/core/util/localStorage';
import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type {
    ErrorResponse,
    ApiResponse
} from '@/common/types/auth';

export const apiBaseURL = 'http://127.0.0.1:3001/api/v1';

const Request = axios.create({
    baseURL: apiBaseURL,
    timeout: 10000,
});

Request.interceptors.request.use(
    (config) => {
        const token = clientLocalStorage.getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器
Request.interceptors.response.use(
    (response: AxiosResponse) => {
        const responseData = response.data as ApiResponse<any>;
        if (responseData.success) {
            // 只返回业务 data
            return Promise.resolve(responseData.data);
        } else {
            // 业务错误，抛出 message 或 error
            return Promise.reject(responseData.error || responseData.message || '未知错误');
        }
    },
    (error) => {
        if (error.response && error.response.data) {
            const errorData = error.response.data as ErrorResponse;
            return Promise.reject(errorData.error || errorData.message || '服务器错误');
        }
        // 网络或服务器错误
        return Promise.reject(error.message || '网络错误，请检查您的网络连接');
    }
);

export default Request;