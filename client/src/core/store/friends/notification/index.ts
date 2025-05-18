import { create } from "zustand";
import type { FriendNotificationState } from "./state";

const useFriendNotificationStore = create<FriendNotificationState>((set) => ({
  receivedRequests: [],
}));

export default useFriendNotificationStore;