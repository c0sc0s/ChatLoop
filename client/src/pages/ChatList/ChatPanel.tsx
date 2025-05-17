// src/pages/ChatList/ChatPanel.tsx
import { useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import useUserStore from "@/core/store/user";
import useChatStore from "@/core/store/chat";
import {
  ChatHeader,
  ChatInput,
  ChatMessageList,
  ChatMessageListSkeleton,
} from "@/components/chat";

export default function ChatPanel() {
  const { id } = useParams();
  const conversationId = id ? parseInt(id) : undefined;
  const currentUser = useUserStore((state) => state.user);

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

  // 判断是否为群聊
  const isGroupChat = useMemo(() => {
    return currentConversation?.type === "group";
  }, [currentConversation]);

  // 获取群聊信息
  const groupInfo = useMemo(() => {
    if (!isGroupChat || !currentConversation) return null;
    return {
      name: currentConversation.name || "群聊",
      avatar: currentConversation.avatar,
      memberCount: currentConversation.participants?.length || 0,
    };
  }, [isGroupChat, currentConversation]);

  // 获取私聊对象
  const otherUser = useMemo(() => {
    if (isGroupChat || !currentConversation || !currentUser) return null;

    const participant = currentConversation.participants.find(
      (p) => p.userId !== currentUser.id
    );

    if (!participant || !participant.user) return null;

    // 确保状态字段始终有值
    return {
      ...participant.user,
      status: participant.user.status || "offline",
    };
  }, [currentConversation, currentUser, isGroupChat]);

  // 处理发送消息
  const handleSendMessage = async (content: string) => {
    if (!conversationId || !currentUser) return;

    try {
      await sendMessage({
        conversationId: conversationId,
        content: content,
        type: "text",
      });
    } catch (error) {
      // 错误处理在store中已实现
    }
  };

  // 加载状态显示
  if (isLoadingCurrentConversation) {
    return <ChatMessageListSkeleton />;
  }

  // 会话不存在的显示
  if (!currentConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">会话不存在或已被删除</p>
      </div>
    );
  }

  // 渲染聊天面板
  return (
    <div className="flex flex-col h-full bg-background rounded-r-lg overflow-hidden border border-l-0">
      {/* 顶部栏 */}
      <ChatHeader
        currentConversation={currentConversation}
        isGroupChat={isGroupChat}
        groupInfo={groupInfo}
        otherUser={otherUser}
      />

      {/* 聊天内容 - 占据所有可用空间 */}
      <div className="flex-1 overflow-hidden">
        <ChatMessageList
          messages={currentMessages}
          currentUserId={currentUser?.id}
          isGroupChat={isGroupChat}
          conversationId={conversationId}
        />
      </div>

      {/* 输入框 */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isSendingMessage={isSendingMessage}
      />
    </div>
  );
}
