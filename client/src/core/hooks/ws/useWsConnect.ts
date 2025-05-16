// 在用户登录后连接 ws
import useAppStore from "@/core/store/app";
import { useEffect } from "react";
import WsClient from "@/core/ws/client";

export function useWsConnect() {
  const hasLogin = useAppStore((state) => state.hasLogin);

  useEffect(() => {
    if (hasLogin) {
      WsClient.init();
    }
  }, [hasLogin]);
}
