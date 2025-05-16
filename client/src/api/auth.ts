import Request from "./client";
import type {
    AuthData,
    LoginInput,
    RegisterInput
} from "@/common/types/auth";

/**
 * 获取当前登录用户的基本信息
 * @returns 当前用户信息和token
 */
export const getMe = async (): Promise<AuthData> => {
    return await Request.get(`/auth/me`);
};

/**
 * 用户登录
 * @param data 包含email和password的登录信息
 * @returns 用户信息和JWT令牌
 */
export const login = async (data: LoginInput): Promise<AuthData> => {
    return await Request.post(`/auth/login`, data);
};

/**
 * 用户注册
 * @param data 包含用户名、邮箱、密码等的注册信息
 * @returns 新创建的用户信息和JWT令牌
 */
export const register = async (data: RegisterInput): Promise<AuthData> => {
    return await Request.post(`/auth/register`, data);
};

/**
 * 用户登出
 * @returns void
 */
export const logout = async (): Promise<void> => {
    return await Request.post(`/auth/logout`);
};


