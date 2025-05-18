// 好友列表相关状态
import { create } from "zustand";
import deafultFriendsNavState, { type FriendsNavState } from "./state";
import type { FriendGroup } from "./hooks";

interface FriendsNavActions {
  setCurrentGroupId: (currentGroupId: string) => void;
  setCurrentGroup: (currentGroup: FriendGroup) => void;
  updateGroups: (groups: FriendGroup[]) => void;
}

type FriendsNavStore = FriendsNavState & FriendsNavActions;

const useFriendsNavStore = create<FriendsNavStore>((set) => ({
  ...deafultFriendsNavState,
  setCurrentGroupId: (currentGroupId: string) => set({ currentGroupId }),
  setCurrentGroup: (currentGroup: FriendGroup) => set({ currentGroup }),
  updateGroups: (groups: FriendGroup[]) => set({ groups }),
}));

export default useFriendsNavStore;
