import type { ConversationSchema } from "@/common/types/chat";
import type { MessageSchema } from "@/common/types/chat";

export interface ChatState {
  // 会话列表相关
  conversations: ConversationSchema[];
  isLoadingConversations: boolean;

  // 当前会话相关
  currentConversation: ConversationSchema | null;
  isLoadingCurrentConversation: boolean;

  // 消息相关
  messages: Record<number, MessageSchema[]>; // 会话ID -> 消息列表
  isLoadingMessages: Record<number, boolean>; // 会话ID -> 是否加载中
  isSendingMessage: boolean;
  currentMessages: MessageSchema[];
}

export const initialState: ChatState = {
  conversations: [],
  isLoadingConversations: false,
  currentConversation: null,
  isLoadingCurrentConversation: false,
  messages: {},
  isLoadingMessages: {},
  isSendingMessage: false,
  currentMessages: [],
};

