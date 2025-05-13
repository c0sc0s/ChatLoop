import { useParams } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockChats = [
    {
        id: "1",
        name: "小明",
        avatar: "https://api.dicebear.com/7.x/personas/svg?seed=xiaoming",
        messages: [
            { from: "xiaoming", text: "你好，小红！", time: "10:00" },
            { from: "xiaohong", text: "你好，小明！", time: "10:01" },
            { from: "xiaoming", text: "今天过得怎么样？", time: "10:02" },
            { from: "xiaohong", text: "挺好的，你呢？", time: "10:03" },
            { from: "xiaoming", text: "我也不错！", time: "10:04" },
        ],
    },
    {
        id: "2",
        name: "小红",
        avatar: "https://api.dicebear.com/7.x/personas/svg?seed=xiaohong",
        messages: [
            { from: "xiaohong", text: "小明，你在吗？", time: "09:00" },
            { from: "xiaoming", text: "在的，有什么事吗？", time: "09:01" },
            { from: "xiaohong", text: "想请你帮个忙。", time: "09:02" },
            { from: "xiaoming", text: "没问题，什么忙？", time: "09:03" },
        ],
    },
];

const currentUser = {
    id: "xiaohong",
    name: "小红",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=xiaohong",
};

export default function ChatList() {
    const { id } = useParams();
    const [input, setInput] = useState("");
    const chat = mockChats.find((c) => c.id === id);

    if (!id || !chat) {
        return (
            <div className="flex h-[70vh] items-center justify-center text-muted-foreground">
                请选择一个会话
            </div>
        );
    }

    return (
        <div className="flex h-[70vh] flex-col">
            {/* 顶部栏 */}
            <div className="flex items-center gap-3 border-b px-6 py-4">
                <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full" />
                <div>
                    <div className="font-bold">{chat.name}</div>
                    <div className="text-xs text-muted-foreground">在线</div>
                </div>
            </div>
            {/* 聊天内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-background">
                {chat.messages.map((msg, idx) => {
                    const isMe = msg.from === currentUser.id;
                    return (
                        <div
                            key={idx}
                            className={cn(
                                "flex items-end gap-2",
                                isMe ? "justify-end" : "justify-start"
                            )}
                        >
                            {!isMe && (
                                <img
                                    src={chat.avatar}
                                    alt={chat.name}
                                    className="w-8 h-8 rounded-full"
                                />
                            )}
                            <div
                                className={cn(
                                    "max-w-xs px-4 py-2 rounded-lg text-sm shadow",
                                    isMe
                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                        : "bg-muted text-foreground rounded-bl-none"
                                )}
                            >
                                {msg.text}
                                <div className="text-[10px] text-muted-foreground mt-1 text-right">
                                    {msg.time}
                                </div>
                            </div>
                            {isMe && (
                                <img
                                    src={currentUser.avatar}
                                    alt={currentUser.name}
                                    className="w-8 h-8 rounded-full"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {/* 输入框 */}
            <form
                className="flex items-center gap-2 border-t px-6 py-4 bg-background"
                onSubmit={(e) => {
                    e.preventDefault();
                    // 这里只做演示，不实际发送
                    setInput("");
                }}
            >
                <Input
                    className="flex-1"
                    placeholder="输入消息…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button type="submit" disabled={!input.trim()}>
                    发送
                </Button>
            </form>
        </div>
    );
}