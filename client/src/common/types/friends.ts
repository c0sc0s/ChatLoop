/**
 * 好友相关的共享类型
 */

// 好友项接口
export interface FriendItem {
  id: number;
  username: string;
  avatar: string | null;
  status: string;
  lastActiveAt: string | null;
}

// 好友列表响应
export interface FriendsListResponse {
  friends: FriendItem[];
  total: number;
}

// 好友请求的用户信息
export interface FriendRequestUser {
  id: number;
  username: string;
  avatar: string | null;
  status: string;
}

// 好友请求项
export interface FriendRequestItem {
  id: number;
  initiatorId: number;
  receiverId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: FriendRequestUser;
}

// 好友请求列表响应
export interface FriendRequestsResponse {
  requests: FriendRequestItem[];
  total: number;
}

// 向后兼容的类型定义
export interface FriendData extends FriendItem { }

// 好友请求
export interface FriendRequest {
  id: number;
  sender: FriendRequestSender;
  createdAt: string;
}

// 好友请求发送者信息
export interface FriendRequestSender {
  id: number;
  username: string;
  avatar: string;
}

// 好友请求接收者信息
export interface FriendRequestReceiver {
  id: number;
  username: string;
  avatar: string;
}

// 发送出去的好友请求
export interface SentFriendRequest {
  id: number;
  receiver: FriendRequestReceiver;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

// 好友请求响应
export interface FriendRequestResponse {
  requestId: number;
}