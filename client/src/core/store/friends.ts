import { create } from "zustand";
import WebSocketAPI from "@/api/webscoket";

// 好友信息接口
export interface Friend {
  id: number;
  username: string;
  avatar: string | null;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastActiveAt: string | null;
  sign?: string; // 个性签名
}

// 好友分组接口
export interface FriendGroup {
  id: string;
  name: string;
  friends: Friend[];
}

// 好友请求接口
export interface FriendRequest {
  requestId: number;
  from: {
    id: number;
    username: string;
    avatar: string | null;
  };
  message?: string;
  timestamp: string;
}

interface FriendsState {
  // 好友分组列表
  groups: FriendGroup[];
  // 好友请求列表
  friendRequests: FriendRequest[];
  // 加载状态
  loading: boolean;
  // 错误信息
  error: string | null;
}

interface FriendsActions {
  // 初始化好友列表
  initFriends: (friends: Friend[]) => void;
  // 添加好友到分组
  addFriend: (friend: Friend, groupId: string) => void;
  // 移除好友
  removeFriend: (friendId: number) => void;
  // 更新好友状态
  updateFriendStatus: (friendId: number, status: 'online' | 'offline' | 'away' | 'busy', lastActiveAt?: string) => void;
  // 添加好友请求
  addFriendRequest: (request: FriendRequest) => void;
  // 移除好友请求
  removeFriendRequest: (requestId: number) => void;
  // 添加好友分组
  addGroup: (groupName: string) => void;
  // 移除好友分组
  removeGroup: (groupId: string) => void;
  // 设置加载状态
  setLoading: (loading: boolean) => void;
  // 设置错误信息
  setError: (error: string | null) => void;
}

const useFriendsStore = create<FriendsState & FriendsActions>((set, get) => ({
  groups: [
    { id: "default", name: "我的好友", friends: [] },
    { id: "star", name: "星标好友", friends: [] }
  ],
  friendRequests: [],
  loading: false,
  error: null,

  // 初始化好友列表
  initFriends: (friends) => {
    const defaultGroup = get().groups.find(g => g.id === "default");
    if (defaultGroup) {
      const updatedGroups = get().groups.map(group =>
        group.id === "default"
          ? { ...group, friends }
          : group
      );
      set({ groups: updatedGroups });
    } else {
      set({
        groups: [
          { id: "default", name: "我的好友", friends },
          ...get().groups.filter(g => g.id !== "default")
        ]
      });
    }
  },

  // 添加好友到分组
  addFriend: (friend, groupId) => {
    set({
      groups: get().groups.map(group =>
        group.id === groupId
          ? { ...group, friends: [...group.friends, friend] }
          : group
      )
    });
  },

  // 从所有分组中移除好友
  removeFriend: (friendId) => {
    set({
      groups: get().groups.map(group => ({
        ...group,
        friends: group.friends.filter(friend => friend.id !== friendId)
      }))
    });
  },

  // 更新好友状态
  updateFriendStatus: (friendId, status, lastActiveAt) => {
    set({
      groups: get().groups.map(group => ({
        ...group,
        friends: group.friends.map(friend =>
          friend.id === friendId
            ? {
              ...friend,
              status,
              lastActiveAt: lastActiveAt || friend.lastActiveAt
            }
            : friend
        )
      }))
    });
  },

  // 添加好友请求
  addFriendRequest: (request) => {
    // 避免重复添加
    if (!get().friendRequests.some(req => req.requestId === request.requestId)) {
      set({ friendRequests: [...get().friendRequests, request] });
    }
  },

  // 移除好友请求
  removeFriendRequest: (requestId) => {
    set({
      friendRequests: get().friendRequests.filter(
        request => request.requestId !== requestId
      )
    });
  },

  // 添加好友分组
  addGroup: (groupName) => {
    const newGroupId = `group_${Date.now()}`;
    set({
      groups: [...get().groups, { id: newGroupId, name: groupName, friends: [] }]
    });
    return newGroupId;
  },

  // 移除好友分组
  removeGroup: (groupId) => {
    // 不允许删除默认分组
    if (groupId === "default") return;

    // 将该分组中的好友移动到默认分组
    const groupToRemove = get().groups.find(g => g.id === groupId);
    if (groupToRemove) {
      // 先更新默认分组
      set({
        groups: get().groups.map(group =>
          group.id === "default"
            ? {
              ...group,
              friends: [...group.friends, ...groupToRemove.friends]
            }
            : group
        )
      });

      // 然后移除目标分组
      set({
        groups: get().groups.filter(g => g.id !== groupId)
      });
    }
  },

  // 设置加载状态
  setLoading: (loading) => set({ loading }),

  // 设置错误信息
  setError: (error) => set({ error })
}));

// 获取好友在线状态的函数
export const fetchFriendsStatus = async () => {
  const store = useFriendsStore.getState();
  store.setLoading(true);
  store.setError(null);

  try {
    const response = await WebSocketAPI.presence.getFriendsStatus();
    if (response && response.success) {
      response.friends.forEach(friend => {
        store.updateFriendStatus(
          friend.id,
          friend.isOnline ? 'online' : 'offline',
          friend.lastActiveAt
        );
      });
    }
  } catch (error) {
    console.error('获取好友在线状态失败:', error);
    store.setError('获取好友在线状态失败');
  } finally {
    store.setLoading(false);
  }
};

// 发送好友请求的函数
export const sendFriendRequest = async (targetUserId: string, message?: string) => {
  const store = useFriendsStore.getState();
  store.setLoading(true);
  store.setError(null);

  try {
    const response = await WebSocketAPI.friend.sendRequest(targetUserId, message);
    if (response && response.success) {
      return response.friendship;
    }
    return null;
  } catch (error) {
    console.error('发送好友请求失败:', error);
    store.setError('发送好友请求失败');
    return null;
  } finally {
    store.setLoading(false);
  }
};

// 响应好友请求的函数
export const respondToFriendRequest = async (requestId: number, action: 'accept' | 'reject' | 'block') => {
  const store = useFriendsStore.getState();
  store.setLoading(true);
  store.setError(null);

  try {
    const response = await WebSocketAPI.friend.respondToRequest(requestId, action);
    if (response && response.success) {
      // 从请求列表中移除该请求
      store.removeFriendRequest(requestId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('响应好友请求失败:', error);
    store.setError('响应好友请求失败');
    return false;
  } finally {
    store.setLoading(false);
  }
};

// 删除好友的函数
export const removeFriend = async (friendshipId: number, friendId: number) => {
  const store = useFriendsStore.getState();
  store.setLoading(true);
  store.setError(null);

  try {
    const response = await WebSocketAPI.friend.removeFriend(friendshipId);
    if (response && response.success) {
      // 从列表中移除该好友
      store.removeFriend(friendId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('删除好友失败:', error);
    store.setError('删除好友失败');
    return false;
  } finally {
    store.setLoading(false);
  }
};

export default useFriendsStore; 