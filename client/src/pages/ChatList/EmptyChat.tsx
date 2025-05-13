import { MessageCircleDashed } from "lucide-react";

// src/pages/ChatList/EmptyChatHint.tsx
export default function EmptyChatHint() {
    return (
        <div className="rounded-lg bg-background flex h-full items-center justify-center text-muted-foreground flex-col gap-2">
            <MessageCircleDashed size={52} />
            <div className="text-sm">请选择一个会话 👻</div>
        </div>

    );
}