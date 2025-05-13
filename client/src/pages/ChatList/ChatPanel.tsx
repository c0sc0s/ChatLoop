// src/pages/ChatList/ChatPanel.tsx
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Send, Phone, Video, Paperclip, Image as ImageIcon } from "lucide-react";

const mockChats = [
    {
        id: "1",
        name: "林然",
        avatar: "https://api.dicebear.com/7.x/personas/svg?seed=linran",
        messages: [
            { from: "linran", text: "苏瑾，今晚有空吗？一起吃个饭？", time: "18:20" },
            { from: "sujin", text: "有空啊，想吃什么？", time: "18:21" },
            { from: "linran", text: "火锅怎么样？最近新开了一家店。", time: "18:22" },
            { from: "sujin", text: "可以啊，我正好也想吃火锅！", time: "18:23" },
            { from: "linran", text: "那我订个位置，7点在老地方见？", time: "18:24" },
            { from: "sujin", text: "OK，等你！", time: "18:25" },
        ],
    },
    {
        id: "2",
        name: "苏瑾",
        avatar: "https://api.dicebear.com/7.x/personas/svg?seed=sujin",
        messages: [
            { from: "sujin", text: "林然，明天的报告你准备好了吗？", time: "21:10" },
            { from: "linran", text: "还差一点，今晚加班赶出来。", time: "21:11" },
            { from: "sujin", text: "辛苦啦，需要我帮忙吗？", time: "21:12" },
            { from: "linran", text: "不用啦，主要是整理数据，明天见面聊。", time: "21:13" },
            { from: "sujin", text: "好，那明天见，早点休息~", time: "21:14" },
            { from: "linran", text: "晚安！", time: "21:15" },
        ],
    },
];

const currentUser = {
    id: "linran",
    name: "林然",
    avatar: "https://api.dicebear.com/7.x/personas/svg?seed=xiaohong",
};

function ChatMessageMe({ text, time, avatar, name }: { text: string; time: string; avatar: string; name: string }) {
    return (
        <div className="flex items-end gap-2 justify-end">
            <div className="max-w-xs px-4 py-2 rounded-lg text-sm shadow bg-primary text-primary-foreground rounded-br-none">
                {text}
                <div className="text-[10px] text-muted-foreground mt-1 text-right">
                    {time}
                </div>
            </div>
            <Avatar className="size-10">
                <AvatarImage src={avatar} />
                <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>
        </div>
    );
}

function ChatMessageOther({ text, time, avatar, name }: { text: string; time: string; avatar: string; name: string }) {
    return (
        <div className="flex items-end gap-2 justify-start">
            <Avatar className="size-10">
                <AvatarImage src={avatar} />
                <AvatarFallback>{name[0]}</AvatarFallback>
            </Avatar>
            <div className="max-w-xs px-4 py-2 rounded-lg text-sm shadow bg-muted text-foreground rounded-bl-none">
                {text}
                <div className="text-[10px] text-muted-foreground mt-1 text-right">
                    {time}
                </div>
            </div>
        </div>
    );
}

export default function ChatPanel() {
    const { id } = useParams();
    const [input, setInput] = useState("");
    const chat = mockChats.find((c) => c.id === id);

    if (!chat) return null;

    return (
        <div className="flex flex-col h-full rounded-lg bg-background">
            {/* 顶部栏 */}
            <div className="flex items-center gap-3 border-b px-6 py-4 justify-between">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={chat.avatar} />
                        <AvatarFallback>{chat.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-bold">{chat.name}</div>
                        <div className="text-xs text-muted-foreground">在线</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button size="icon" variant="ghost" className="rounded" title="语音通话">
                        <Phone className="size-5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded" title="视频通话">
                        <Video className="size-5" />
                    </Button>
                </div>
            </div>
            {/* 聊天内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-background rounded-md">
                {chat.messages.map((msg, idx) =>
                    msg.from === currentUser.id ? (
                        <ChatMessageMe
                            key={idx}
                            text={msg.text}
                            time={msg.time}
                            avatar={currentUser.avatar}
                            name={currentUser.name}
                        />
                    ) : (
                        <ChatMessageOther
                            key={idx}
                            text={msg.text}
                            time={msg.time}
                            avatar={chat.avatar}
                            name={chat.name}
                        />
                    )
                )}
            </div>
            {/* 输入框 */}
            <form
                className="flex items-center gap-2 border-t px-6 py-4 bg-background"
                onSubmit={(e) => {
                    e.preventDefault();
                    setInput("");
                }}
            >
                <div className="flex items-center gap-1 mr-2">
                    <Button type="button" size="icon" variant="ghost" className="rounded" title="发送图片">
                        <ImageIcon className="size-5" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="rounded" title="发送文件">
                        <Paperclip className="size-5" />
                    </Button>
                </div>
                <Input
                    className="flex-1"
                    placeholder="输入消息…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <Button type="submit" disabled={!input.trim()} className="flex gap-1 items-center">
                    <Send className="size-4" /> 发送
                </Button>
            </form>
        </div>
    );
}