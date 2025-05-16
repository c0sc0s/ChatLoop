import { ChatMessageType } from "../type";
import wsEventBus from "../wsEventBus";
import useChatStore from "@/core/store/chat";
import type { MessageSchema } from "@/common/types/chat";

// 处理发送的消息确认
const sentHandler = (data: MessageSchema) => {
  const chatStore = useChatStore.getState();
  // 添加或更新消息
  chatStore.addMessage(data);
};

// 处理接收到的新消息
const receivedHandler = (data: MessageSchema) => {
  const chatStore = useChatStore.getState();
  const { conversationId } = data;

  // 添加消息到消息列表
  chatStore.addMessage(data);

  // 检查这个会话是否已存在
  const existingConversation = chatStore.conversations.find(
    (conv) => conv.id === conversationId
  );

  if (!existingConversation) {
    // 会话不存在，需要获取会话详情
    // 这会更新conversations数组，添加新会话
    chatStore.fetchConversation(conversationId);
  }
  // 如果会话存在，addMessage已经会通过updateConversationLastMessage更新最后一条消息
};

wsEventBus.on(ChatMessageType.sent, sentHandler);
wsEventBus.on(ChatMessageType.received, receivedHandler);

