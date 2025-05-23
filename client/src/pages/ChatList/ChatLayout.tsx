import { Outlet } from "react-router-dom";
import ChatSidebar from "./chat/sidebar/ChatSidebar";
import { VideoCallDialog } from "./chat/panel/vedio/VedioDialog";

// 聊天布局组件，用于嵌套路由
export default function ChatLayout() {
  return (
    <div className="flex h-full rounded-2xl bg-muted/50 overflow-hidden">
      <ChatSidebar />
      <div className="flex-1">
        <Outlet />
      </div>
      <VideoCallDialog />
    </div>
  );
}
