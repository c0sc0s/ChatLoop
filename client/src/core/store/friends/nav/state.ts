import type { FriendGroup } from "./hooks";

export interface FriendsNavState {
  currentGroupId: string;
  currentGroup: FriendGroup | null;
  groups: FriendGroup[];
}

const deafultFriendsNavState: FriendsNavState = {
  currentGroupId: "all",
  currentGroup: null,
  groups: [],
};

export default deafultFriendsNavState;
