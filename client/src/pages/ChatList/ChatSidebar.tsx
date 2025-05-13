// src/pages/ChatList/ChatSidebar.tsx
import { NavLink, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const mockChats = [
    {
        id: "1",
        name: "林然",
        avatar: "https://api.dicebear.com/7.x/personas/svg?seed=linran",
        lastMessage: "苏瑾：OK，等你！",
    },
    {
        id: "2",
        name: "苏瑾",
        avatar: "https://api.dicebear.com/7.x/personas/svg?seed=sujin",
        lastMessage: "林然：晚安！",
    },
];

export default function ChatSidebar() {
    const { id } = useParams();

    return (
        <aside className="w-64 flex flex-col rounded-lg bg-background  mr-1">
            <div className="p-4 font-bold text-lg">会话列表</div>
            <ul className="flex-1 overflow-y-auto">
                {mockChats.map((chat) => (
                    <li key={chat.id} className="p-2">
                        <NavLink
                            to={`/chatlist/${chat.id}`}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/60 transition rounded-md",
                                    isActive ? "bg-accent text-primary rounded-md" : ""
                                )
                            }
                        >
                            <Avatar className="size-10">
                                <AvatarImage src={chat.avatar} />
                                <AvatarFallback>{chat.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-medium">{chat.name}</div>
                                <div className="text-xs text-muted-foreground">{chat.lastMessage}</div>
                            </div>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </aside>
    );
}