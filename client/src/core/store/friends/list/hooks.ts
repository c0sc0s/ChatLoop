import type { FriendItem } from "@/common/types";
import useFriendsNavStore from ".";
import { useShallow } from "zustand/react/shallow";
import { getFriends, deleteFriend as deleteFriendApi } from "@/api/friends";
import useFriendsStore from ".";
import { toast } from "sonner";
export const fetchFriendsData = () => {
  getFriends().then(res => {
    useFriendsStore.getState().setFriends(res?.friends);
  })
}

export const useFriends = () => {
  return useFriendsNavStore(useShallow((state) => state.friends));
};

export const addFriend = (friend: FriendItem) => {
  useFriendsNavStore.setState((state) => ({
    friends: [...state.friends, friend],
  }));
};

export const deleteFriend = async (friend: FriendItem) => {
  try {
    await deleteFriendApi(friend.id);
    useFriendsNavStore.setState((state) => ({
      friends: state.friends.filter((f) => f.id !== friend.id),
    }));
    toast.success("删除好友成功");
  } catch (error) {
    toast.error("删除好友失败", {
      description: (error as Error).message,
    });
  }
};

