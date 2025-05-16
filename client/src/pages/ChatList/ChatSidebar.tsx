// src/pages/ChatList/ChatSidebar.tsx
import { NavLink, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import useUserStore from "@/core/store/user";
import useChatStore from "@/core/store/chat";
import type {
  ConversationSchema,
  ParticipantUserSchema,
} from "@/common/types/chat";

export default function ChatSidebar() {
  const currentUser = useUserStore((state) => state.user);

  // 使用chat store - 通过选择具体的状态来避免不必要的重渲染
  const conversations = useChatStore((state) => state.conversations);
  const isLoadingConversations = useChatStore(
    (state) => state.isLoadingConversations
  );
  const fetchConversations = useChatStore((state) => state.fetchConversations);

  // 获取会话列表
  useEffect(() => {
    fetchConversations();
    // 可以考虑添加定时刷新或WebSocket连接
    // 例如: const intervalId = setInterval(fetchConversations, 30000);
    // return () => clearInterval(intervalId);
  }, [fetchConversations]);

  // 获取会话中的另一个参与者（对于私聊）
  const getOtherParticipant = useCallback(
    (conversation: ConversationSchema): ParticipantUserSchema | null => {
      if (!currentUser) return null;
      return (
        conversation.participants.find((p) => p.userId !== currentUser.id)
          ?.user || null
      );
    },
    [currentUser]
  );

  // 获取会话的显示名称
  const getConversationName = useCallback(
    (conversation: ConversationSchema): string => {
      if (conversation.type === "group") {
        return "群聊"; // 在真实场景中可能需要显示群组名称
      }
      const otherUser = getOtherParticipant(conversation);
      return otherUser?.username || "未知用户";
    },
    [getOtherParticipant]
  );

  // 获取会话的显示头像
  const getConversationAvatar = useCallback(
    (conversation: ConversationSchema): string | null => {
      if (conversation.type === "group") {
        return null; // 群组头像
      }
      const otherUser = getOtherParticipant(conversation);
      return otherUser?.avatar || null;
    },
    [getOtherParticipant]
  );

  // 获取会话的最后一条消息预览
  const getLastMessagePreview = useCallback(
    (conversation: ConversationSchema): string => {
      if (!conversation.latestMessage) return "无消息";

      const isSelf = conversation.latestMessage.senderId === currentUser?.id;
      const senderName = isSelf
        ? "我"
        : getOtherParticipant(conversation)?.username || "未知用户";
      const content =
        conversation.latestMessage.content || "[不支持的消息类型]";

      return `${senderName}: ${content}`;
    },
    [currentUser, getOtherParticipant]
  );

  return (
    <aside className="w-64 flex flex-col rounded-lg bg-background mr-1">
      <div className="p-4 font-bold text-lg">会话列表</div>

      {isLoadingConversations ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-muted-foreground p-4 text-center">
          <p>没有会话</p>
          <p className="text-xs mt-1">前往好友列表开始聊天</p>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => {
            const conversationName = getConversationName(conversation);
            const conversationAvatar = getConversationAvatar(conversation);
            const lastMessagePreview = getLastMessagePreview(conversation);

            return (
              <li key={conversation.id} className="p-2">
                <NavLink
                  to={`/chatlist/${conversation.id}`}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/60 transition rounded-md",
                      isActive ? "bg-accent text-primary rounded-md" : ""
                    )
                  }
                >
                  <Avatar className="size-10">
                    <AvatarImage src={conversationAvatar || undefined} />
                    <AvatarFallback>{conversationName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {conversationName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {lastMessagePreview}
                    </div>
                  </div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
