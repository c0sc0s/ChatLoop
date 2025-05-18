import { useCallback } from "react";
import useUserStore from "@/core/store/user";
import type {
  ConversationSchema,
  ParticipantUserSchema,
} from "@/common/types/chat";

export function useConversation() {
  const { user: currentUser } = useUserStore();

  // 获取会话中的另一个参与者（对于私聊）
  const getOtherParticipant = useCallback(
    (conversation: ConversationSchema): ParticipantUserSchema | null => {
      if (!currentUser) return null;

      const otherParticipant = conversation.participants.find(
        (p) => p.userId !== currentUser.id
      );

      return otherParticipant?.user || null;
    },
    [currentUser]
  );

  // 获取会话的显示名称
  const getConversationName = useCallback(
    (conversation: ConversationSchema): string => {
      if (conversation.type === "group") {
        return conversation.name || "群聊"; // 使用群组名称
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
        return conversation.avatar || null; // 使用群组头像
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
      let senderName = isSelf ? "我" : "";

      if (!isSelf && conversation.type === "group") {
        // 在群组中，显示发送者名称
        const sender = conversation.participants.find(
          (p) => p.userId === conversation.latestMessage?.senderId
        )?.user;
        senderName = sender?.username || "未知用户";
      }

      const content =
        conversation.latestMessage.content || "[不支持的消息类型]";

      return senderName ? `${senderName}: ${content}` : content;
    },
    [currentUser]
  );

  return {
    getOtherParticipant,
    getConversationName,
    getConversationAvatar,
    getLastMessagePreview,
  };
} 