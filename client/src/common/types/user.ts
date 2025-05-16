/**
 * 用户相关的共享类型
 */

// 用户详细信息
export interface UserDetailSchema {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  status: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 用户基础信息 (用于列表展示)
export interface UserBasicSchema {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  status: string;
  createdAt: string;
}

// 搜索用户项
export interface SearchUserItem {
  id: number;
  username: string;
  avatar?: string;
  status: string;
}

// 用户列表响应数据
export interface UsersListResponse {
  users: UserBasicSchema[];
  total: number;
}

// 搜索用户响应数据
export interface SearchUsersResponse {
  users: SearchUserItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 搜索用户请求参数
export interface SearchUsersQuery {
  keyword: string;
  page?: number;
  limit?: number;
}

// 向后兼容，从API文档定义同步过来的类型
export type User = UserDetailSchema;
export type UserBasic = SearchUserItem;

// 获取用户参数
export interface GetUserParams {
  id: string;
}

// 添加好友请求体
export interface AddFriendBody {
  userId: number;
  message?: string;
}

// 处理好友请求体
export interface HandleFriendRequestBody {
  requestId: number;
  action: "accept" | "reject" | "block";
}

// 删除好友请求体
export interface DeleteFriendBody {
  friendshipId: number;
}
