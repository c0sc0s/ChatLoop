import Request from "./client";
import type {
  FriendsListResponse,
  FriendRequestsResponse,
} from '@/common/types/friends';

/**
 * 获取当前用户的所有好友
 * @returns 好友列表和总数
 */
export const getFriends = async (): Promise<FriendsListResponse> => {
  return await Request.get(`/friends`);
};

/**
 * 获取发送给当前用户的待处理好友请求
 * @returns 好友请求列表和总数
 */
export const getFriendRequests = async (): Promise<FriendRequestsResponse> => {
  return await Request.get(`/friends/requests`);
};

/**
 * 向指定用户发送好友请求
 * @param targetUserId 目标用户ID
 * @returns 好友请求ID
 */
export const sendFriendRequest = async (targetUserId: number): Promise<{ requestId: number }> => {
  return await Request.post(`/friends/request`, { targetUserId });
};

/**
 * 接受一个好友请求
 * @param requestId 好友请求ID
 */
export const acceptFriendRequest = async (requestId: number): Promise<void> => {
  return await Request.post(`/friends/accept`, { requestId });
};

/**
 * 拒绝一个好友请求
 * @param requestId 好友请求ID
 */
export const rejectFriendRequest = async (requestId: number): Promise<void> => {
  return await Request.post(`/friends/reject`, { requestId });
};

/**
 * 删除一个现有的好友关系
 * @param friendId 要删除的好友的用户ID
 */
export const deleteFriend = async (friendId: number): Promise<void> => {
  return await Request.delete(`/friends/${friendId}`);
};

/**
 * 获取当前用户发送的待处理好友请求
 * @returns 已发送的好友请求列表
 */
export const getSentFriendRequests = async (): Promise<{ requests: any[] }> => {
  return await Request.get(`/friends/sent-requests`);
};

/**
 * 取消已发送的好友请求
 * @param requestId 请求ID
 */
export const cancelFriendRequest = async (requestId: number): Promise<void> => {
  return await Request.delete(`/friends/request/${requestId}`);
};
