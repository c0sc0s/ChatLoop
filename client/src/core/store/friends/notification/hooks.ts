import type { FriendRequestItem } from "@/common/types";
import useFriendNotificationStore from "./index";
import { getFriendRequests, acceptFriendRequest as acceptFriendRequestApi, rejectFriendRequest as rejectFriendRequestApi } from "@/api/friends";
import { fetchFriendsData } from "../list/hooks";

export const initReceivedFriendRequestData = () => {
  getFriendRequests().then(res => {
    setReceivedFriendRequest(res.requests);
  });
}

export const useReceviedFriendRequest = () => {
  const receivedRequests = useFriendNotificationStore(state => state.receivedRequests);
  return receivedRequests;
};

export const updateReceivedFriendRequest = (request: FriendRequestItem) => {
  useFriendNotificationStore.setState(state => ({
    receivedRequests: [...state.receivedRequests, request]
  }));
}

export const setReceivedFriendRequest = (requests: FriendRequestItem[]) => {
  useFriendNotificationStore.setState(state => ({
    receivedRequests: requests
  }));
}

export const hasFriendRequestNotification = () => {
  const receivedRequests = useFriendNotificationStore(state => state.receivedRequests);
  return receivedRequests.length > 0;
}

export const acceptFriendRequest = (request: FriendRequestItem) => {
  return acceptFriendRequestApi(request.id).then(() => {
    useFriendNotificationStore.setState(state => ({
      receivedRequests: state.receivedRequests.filter(request => request.id !== request.id)
    }));
  }).then(fetchFriendsData);
}

export const rejectFriendRequest = (requestId: number) => {
  return rejectFriendRequestApi(requestId).then(() => {
    useFriendNotificationStore.setState(state => ({
      receivedRequests: state.receivedRequests.filter(request => request.id !== requestId)
    }));
  });
}