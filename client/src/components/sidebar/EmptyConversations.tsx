import { MessageSquare } from "lucide-react";

export function EmptyConversations() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center text-muted-foreground p-4 text-center">
      <MessageSquare className="h-10 w-10 mb-2 text-muted-foreground/50" />
      <p>没有会话</p>
      <p className="text-xs mt-1">前往好友列表开始聊天</p>
    </div>
  );
}
