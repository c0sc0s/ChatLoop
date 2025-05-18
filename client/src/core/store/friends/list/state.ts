// 好友列表数据
import type { FriendData } from "@/common/types";

export interface FriendsState {
  friends: FriendData[];
}

const deafultFriendsState: FriendsState = {
  friends: [],
};

export default deafultFriendsState;
