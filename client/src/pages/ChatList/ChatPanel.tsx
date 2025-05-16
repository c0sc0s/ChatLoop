// src/pages/ChatList/ChatPanel.tsx
import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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
      <div className="max-w-xs px-4 py-2 rounded-lg text-sm shadow bg-primary text-primary-foreground rounded-br-none">
        {content}
        <div className="text-[10px] text-muted-foreground mt-1 text-right">
          {time}
        </div>
      </div>
      <Avatar className="size-10">
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
      <Avatar className="size-10">
        <AvatarImage src={sender.avatar || undefined} />
        <AvatarFallback>{sender.username[0]}</AvatarFallback>
      </Avatar>
      <div className="max-w-xs px-4 py-2 rounded-lg text-sm shadow bg-muted text-foreground rounded-bl-none">
        {content}
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

  // 使用chat store获取会话和消息状态 - 拆分选择器
  const currentConversation = useChatStore(
    (state) => state.currentConversation
  );
  const messages = useChatStore((state) =>
    conversationId ? state.messages[conversationId] || [] : []
  );
  const isLoadingCurrentConversation = useChatStore(
    (state) => state.isLoadingCurrentConversation
  );
  const isLoadingMessages = useChatStore((state) =>
    conversationId ? state.isLoadingMessages[conversationId] || false : false
  );
  const isSendingMessage = useChatStore((state) => state.isSendingMessage);
  const fetchConversation = useChatStore((state) => state.fetchConversation);
  const sendMessage = useChatStore((state) => state.sendMessage);

  // 获取会话详情和消息
  useEffect(() => {
    if (!conversationId) return;

    // 获取会话信息和消息列表
    fetchConversation(conversationId);
  }, [conversationId, fetchConversation]);

  // 处理发送消息
  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [input, conversationId, currentUser, sendMessage]
  );

  // 获取会话对方的用户信息
  const getOtherParticipant = useCallback(() => {
    if (!currentConversation || !currentUser) return null;
    return (
      currentConversation.participants.find((p) => p.userId !== currentUser.id)
        ?.user || null
    );
  }, [currentConversation, currentUser]);

  const otherUser = useMemo(() => getOtherParticipant(), [getOtherParticipant]);
  const isLoading = isLoadingCurrentConversation || isLoadingMessages;

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
    <div className="flex flex-col h-full rounded-lg bg-background">
      {/* 顶部栏 */}
      <div className="flex items-center gap-3 border-b px-6 py-4 justify-between">
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
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-background rounded-md">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>没有消息记录</p>
            <p className="text-xs mt-1">开始发送消息吧！</p>
          </div>
        ) : (
          messages.map((message: MessageSchema) =>
            message.senderId === currentUser?.id ? (
              <ChatMessageMe key={message.id} message={message} />
            ) : (
              <ChatMessageOther key={message.id} message={message} />
            )
          )
        )}
      </div>
      {/* 输入框 */}
      <form
        className="flex items-center gap-2 border-t px-6 py-4 bg-background"
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
        <Input
          className="flex-1"
          placeholder="输入消息…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSendingMessage}
        />
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
