import type { FriendRequestItem } from "@/common/types";

export interface FriendNotificationState {
  receivedRequests: FriendRequestItem[];
  // sentRequests: SentFriendRequest[];
}

const deafultFriendNotificationState: FriendNotificationState = {
  receivedRequests: [],
};

export default deafultFriendNotificationState;
