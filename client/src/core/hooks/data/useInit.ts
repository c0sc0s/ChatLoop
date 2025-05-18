import useAppStore from "@/core/store/app";
import { fetchFriendsData } from "@/core/store/friends/list/hooks";
import { initReceivedFriendRequestData } from "@/core/store/friends/notification/hooks";
import { useEffect, useRef } from "react";

const useInitData = () => {
  const hasInitData = useRef(false);
  const hasLogin = useAppStore((state) => state.hasLogin);

  useEffect(() => {
    if (hasLogin && !hasInitData.current) {
      hasInitData.current = true;
      fetchFriendsData();
      initReceivedFriendRequestData();
    }
  }, [hasLogin])
}


export default useInitData;