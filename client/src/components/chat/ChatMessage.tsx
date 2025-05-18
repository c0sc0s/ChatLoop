import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { MessageSchema } from "@/common/types/chat";

interface ChatMessageProps {
  message: MessageSchema;
  isMe: boolean;
  showSenderInfo?: boolean;
}

export function ChatMessage({
  message,
  isMe,
  showSenderInfo = false,
}: ChatMessageProps) {
  const { content, createdAt, sender } = message;

  // 格式化时间显示
  const time = new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <div
        className={cn(
          "flex items-start gap-2",
          isMe ? "justify-end" : "justify-start"
        )}
      >
        {/* 非自己发送的消息，左侧显示头像 */}
        {!isMe && (
          <Avatar className="size-10 flex-shrink-0">
            <AvatarImage src={sender.avatar || undefined} />
            <AvatarFallback>{sender.username[0]}</AvatarFallback>
          </Avatar>
        )}

        {/* 消息气泡内容 */}
        <div>
          {showSenderInfo && (
            <div className="text-xs text-muted-foreground mb-1">
              {sender.username}
            </div>
          )}
          <div
            className={cn(
              "max-w-xs px-4 py-2 rounded-lg text-sm shadow break-words overflow-hidden",
              isMe
                ? "bg-lime-800 rounded-tr-none text-white"
                : "bg-muted text-foreground rounded-tl-none"
            )}
          >
            <p className="whitespace-pre-wrap break-words">{content}</p>
            <div
              className={cn(
                "text-[10px] mt-1 text-right",
                isMe ? "text-muted" : "text-muted-foreground"
              )}
            >
              {time}
            </div>
          </div>
        </div>

        {/* 自己发送的消息，右侧显示头像 */}
        {isMe && (
          <Avatar className="size-10 flex-shrink-0">
            <AvatarImage src={sender.avatar || undefined} />
            <AvatarFallback>{sender.username[0]}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
