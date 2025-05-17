import { MessageCircleDashed } from "lucide-react";

// 空聊天提示组件
export default function EmptyChatHint() {
  return (
    <div className="rounded-2xl rounded-l-none border border-l-0 bg-background flex h-full items-center justify-center text-muted-foreground flex-col gap-2">
      <MessageCircleDashed size={52} />
      <div className="text-sm">请选择一个会话 👻</div>
    </div>
  );
}
