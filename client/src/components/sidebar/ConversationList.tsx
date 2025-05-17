import { Loader2 } from "lucide-react";
import type { ConversationSchema } from "@/common/types/chat";
import { ConversationItem } from "./ConversationItem";
import { EmptyConversations } from "./EmptyConversations";

interface ConversationListProps {
  conversations: ConversationSchema[];
  isLoading: boolean;
}

export function ConversationList({
  conversations,
  isLoading,
}: ConversationListProps) {
  // 加载状态显示
  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // 空列表状态
  if (conversations.length === 0) {
    return <EmptyConversations />;
  }

  // 渲染会话列表
  return (
    <ul className="flex-1 overflow-y-auto flex flex-col">
      {conversations.map((conversation) => (
        <ConversationItem key={conversation.id} conversation={conversation} />
      ))}
    </ul>
  );
}
