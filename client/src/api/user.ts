import Request from "./client";
import type {
  UserDetailSchema,
  UsersListResponse,
  SearchUsersResponse,
  SearchUsersQuery
} from '@/common/types/user';

/**
 * 获取当前登录用户的详细信息
 * @returns 当前用户的完整信息
 */
export const getCurrentUser = async (): Promise<UserDetailSchema> => {
  return await Request.get(`/users/me`);
};

/**
 * 获取系统中的所有用户列表
 * @returns 用户列表和总数
 */
export const getAllUsers = async (): Promise<UsersListResponse> => {
  return await Request.get(`/users/all`);
};

/**
 * 通过关键字搜索系统中的用户
 * @param params 搜索参数，包括关键词、页码、每页数量
 * @returns 搜索结果用户列表和分页信息
 */
export const searchUsers = async (params: SearchUsersQuery): Promise<SearchUsersResponse> => {
  return await Request.get(`/users/search`, { params });
};

/**
 * 通过用户ID获取指定用户的详细信息
 * @param userId 用户ID
 * @returns 用户的详细信息
 */
export const getUserById = async (userId: number): Promise<UserDetailSchema> => {
  return await Request.get(`/users/${userId}`);
};
