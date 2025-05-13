import ChatSidebar from "./ChatSidebar";
import { Outlet } from "react-router-dom";

export default function ChatLayout() {
    return (
        <div className="flex h-full">
            <ChatSidebar />
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
}