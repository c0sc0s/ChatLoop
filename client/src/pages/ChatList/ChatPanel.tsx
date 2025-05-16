// src/pages/ChatList/ChatPanel.tsx
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Phone,
  Video,
  Paperclip,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import type { MessageSchema } from "@/common/types/chat";
import useUserStore from "@/core/store/user";
import useChatStore from "@/core/store/chat";

function ChatMessageMe({ message }: { message: MessageSchema }) {
  const { content, createdAt, sender } = message;
  const time = new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-end gap-2 justify-end">
      <div className="max-w-xs px-4 py-2 rounded-lg text-sm shadow bg-primary text-primary-foreground rounded-br-none break-words overflow-hidden">
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <div className="text-[10px] text-muted-foreground mt-1 text-right">
          {time}
        </div>
      </div>
      <Avatar className="size-10 flex-shrink-0">
        <AvatarImage src={sender.avatar || undefined} />
        <AvatarFallback>{sender.username[0]}</AvatarFallback>
      </Avatar>
    </div>
  );
}

function ChatMessageOther({ message }: { message: MessageSchema }) {
  const { content, createdAt, sender } = message;
  const time = new Date(createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-end gap-2 justify-start">
      <Avatar className="size-10 flex-shrink-0">
        <AvatarImage src={sender.avatar || undefined} />
        <AvatarFallback>{sender.username[0]}</AvatarFallback>
      </Avatar>
      <div className="max-w-xs px-4 py-2 rounded-lg text-sm shadow bg-muted text-foreground rounded-bl-none break-words overflow-hidden">
        <p className="whitespace-pre-wrap break-words">{content}</p>
        <div className="text-[10px] text-muted-foreground mt-1 text-right">
          {time}
        </div>
      </div>
    </div>
  );
}

export default function ChatPanel() {
  const { id } = useParams();
  const conversationId = id ? parseInt(id) : undefined;
  const currentUser = useUserStore((state) => state.user);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    currentConversation,
    isLoadingCurrentConversation,
    isSendingMessage,
    messages,
    sendMessage,
    fetchConversation,
  } = useChatStore();

  // 当会话ID (路由参数) 变化时加载新会话
  useEffect(() => {
    // 只有在有效的会话ID时才请求
    if (conversationId) {
      fetchConversation(conversationId);
    }
  }, [id, fetchConversation, conversationId]);

  // 当前消息列表的记忆化计算
  const currentMessages = useMemo(() => {
    if (!currentConversation) return [];
    return messages[currentConversation.id] || [];
  }, [currentConversation, messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || !currentUser) return;

    try {
      await sendMessage({
        conversationId: conversationId,
        content: input,
        type: "text",
      });
      setInput("");
    } catch (error) {
      // 错误处理在store中已实现
    }
  };

  const otherUser = useMemo(() => {
    if (!currentConversation || !currentUser) return null;
    return (
      currentConversation.participants.find((p) => p.userId !== currentUser.id)
        ?.user || null
    );
  }, [currentConversation, currentUser]);

  const isLoading = isLoadingCurrentConversation;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">正在加载会话...</p>
      </div>
    );
  }

  if (!currentConversation || !otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">会话不存在或已被删除</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg bg-background h-full">
      {/* 顶部栏 */}
      <div className="flex items-center gap-3 border-b px-6 py-4 justify-between flex-shrink-0 h-16">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUser.avatar || undefined} />
            <AvatarFallback>{otherUser.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold">{otherUser.username}</div>
            <div className="text-xs text-muted-foreground">
              {otherUser.status === "online" ? "在线" : "离线"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="rounded"
            title="语音通话"
          >
            <Phone className="size-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded"
            title="视频通话"
          >
            <Video className="size-5" />
          </Button>
        </div>
      </div>
      {/* 聊天内容 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-background rounded-md">
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>没有消息记录</p>
            <p className="text-xs mt-1">开始发送消息吧！</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-full">
            {currentMessages.map((message: MessageSchema) =>
              message.senderId === currentUser?.id ? (
                <ChatMessageMe key={message.id} message={message} />
              ) : (
                <ChatMessageOther key={message.id} message={message} />
              )
            )}
            <div className="h-4" ref={messagesEndRef}></div>
          </div>
        )}
      </div>
      {/* 输入框 */}
      <form
        className="flex items-center gap-2 border-t px-4 py-3 bg-background flex-shrink-0 h-16"
        onSubmit={handleSendMessage}
      >
        <div className="flex items-center gap-1 mr-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded"
            title="发送图片"
          >
            <ImageIcon className="size-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="rounded"
            title="发送文件"
          >
            <Paperclip className="size-5" />
          </Button>
        </div>
        <div className="flex-1 relative">
          <Input
            className="flex-1 min-h-[40px]"
            placeholder="输入消息…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSendingMessage}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) {
                  handleSendMessage(e);
                }
              }
            }}
          />
        </div>
        <Button
          type="submit"
          disabled={!input.trim() || isSendingMessage}
          className="flex gap-1 items-center"
        >
          {isSendingMessage ? (
            <Loader2 className="size-4 mr-1 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          发送
        </Button>
      </form>
    </div>
  );
}
