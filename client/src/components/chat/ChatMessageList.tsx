import { Loader2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { MessageSchema } from "@/common/types/chat";
import { ChatMessage } from "./ChatMessage";
import { useMessageScroll } from "@/core/hooks/chat";

interface ChatMessageListProps {
  messages: MessageSchema[];
  currentUserId: number | undefined;
  isGroupChat: boolean;
  conversationId?: number;
}

export function ChatMessageList({
  messages,
  currentUserId,
  isGroupChat,
  conversationId,
}: ChatMessageListProps) {
  // 使用自定义 hook 处理消息滚动逻辑，传入会话ID
  const { containerRef, messagesEndRef, unreadCount, scrollToBottom } =
    useMessageScroll(messages, conversationId);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>没有消息记录</p>
        <p className="text-xs mt-1">开始发送消息吧！</p>
      </div>
    );
  }

  // 渲染单条消息
  const renderMessage = (message: MessageSchema) => {
    const isMe = message.senderId === currentUserId;
    const showSenderInfo = !isMe && isGroupChat;

    return (
      <div key={message.id} className="mb-4">
        <ChatMessage
          message={message}
          isMe={isMe}
          showSenderInfo={showSenderInfo}
        />
      </div>
    );
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* 消息列表容器 */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4 max-w-full">
          {messages.map(renderMessage)}
          <div className="h-4" ref={messagesEndRef}></div>
        </div>
      </div>

      {/* 未读消息提示和快速滚动按钮 */}
      {unreadCount > 0 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
          <Button
            size="sm"
            onClick={() => scrollToBottom(true)}
            className={cn(
              "rounded-full shadow-lg pointer-events-auto",
              "bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 px-3"
            )}
          >
            <ArrowDown size={16} />
            {unreadCount} 条新消息
          </Button>
        </div>
      )}
    </div>
  );
}

export function ChatMessageListSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="mt-2 text-muted-foreground">正在加载会话...</p>
    </div>
  );
}
