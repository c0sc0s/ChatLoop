import { useMemo } from "react";
import useFriendsNavStore from "."
import { useFriends } from "../list/hooks";
import type { FriendData } from "@/common/types";

export const useCurrentFriendGroupId = () => {
  const currentFriendGroupId = useFriendsNavStore(state => state.currentGroupId);
  return currentFriendGroupId;
}

export const setCurrentFriendGroupId = (currentGroupId: string) => {
  useFriendsNavStore.getState().setCurrentGroupId(currentGroupId);
}

export const useCurrentFriendGroup = () => {
  const navs = useFriendsNav();
  const currentGroupId = useCurrentFriendGroupId();

  const currentGroup = useMemo(() => {
    return navs.find(nav => nav.id === currentGroupId);
  }, [navs, currentGroupId]);

  return currentGroup as FriendGroup;
}

export const setCurrentFriendGroup = (currentGroup: FriendGroup) => {
  useFriendsNavStore.getState().setCurrentGroup(currentGroup);
}

export interface FriendGroup {
  id: string;
  name: string;
  friends: FriendData[];
}

export const useFriendsNav = () => {
  const friends = useFriends();

  const navs = useMemo(() => {
    return [
      {
        id: "all",
        name: "全部好友",
        friends: friends,
      },
      {
        id: "online",
        name: "在线好友",
        friends: friends.filter((friend) => friend.status === "online"),
      },
      {
        id: "offline",
        name: "离线好友",
        friends: friends.filter((friend) => friend.status !== "online"),
      },
    ]
  }, [friends]);

  return navs;
}

