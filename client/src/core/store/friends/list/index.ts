// 好友列表相关状态
import { create } from "zustand";
import defaultFriendsState, { type FriendsState } from "./state";
import type { FriendData } from "@/common/types";

interface FriendsActions {
  setFriends: (friends: FriendData[]) => void;
}

type FriendsStore = FriendsState & FriendsActions;

const useFriendsStore = create<FriendsStore>((set) => ({
  ...defaultFriendsState,
  setFriends: (friends: FriendData[]) => {
    set({ friends });
  },
}));

export default useFriendsStore;
