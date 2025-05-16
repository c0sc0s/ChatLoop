import { create } from "zustand";
import { getConversations, getConversation, getMessages, sendMessage, createConversation } from "@/api/chat";
import type {
  ConversationSchema,
  MessageSchema,
  CreateConversationInput,
  SendMessageInput
} from "@/common/types/chat";
import { toast } from "sonner";
import { persist } from "zustand/middleware";

interface ChatState {
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
}

interface ChatActions {
  // 会话列表操作
  fetchConversations: () => Promise<void>;

  // 当前会话操作
  fetchConversation: (conversationId: number) => Promise<void>;
  setCurrentConversation: (conversation: ConversationSchema | null) => void;

  // 消息操作
  fetchMessages: (conversationId: number) => Promise<void>;
  sendMessage: (data: SendMessageInput) => Promise<MessageSchema | null>;

  // 创建会话
  createConversation: (data: CreateConversationInput) => Promise<ConversationSchema | null>;
}

const useChatStore = create<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      // 初始状态
      conversations: [],
      isLoadingConversations: false,
      currentConversation: null,
      isLoadingCurrentConversation: false,
      messages: {},
      isLoadingMessages: {},
      isSendingMessage: false,

      // 获取会话列表
      fetchConversations: async () => {
        const { isLoadingConversations } = get();
        if (isLoadingConversations) return;

        set({ isLoadingConversations: true });
        try {
          const response = await getConversations();
          set({ conversations: response.conversations });
        } catch (error) {
          toast.error("获取会话列表失败", { description: String(error) });
        } finally {
          set({ isLoadingConversations: false });
        }
      },

      // 获取指定会话详情
      fetchConversation: async (conversationId: number) => {
        const { isLoadingCurrentConversation } = get();
        if (isLoadingCurrentConversation) return;

        set({ isLoadingCurrentConversation: true });
        try {
          const response = await getConversation(conversationId);
          set({ currentConversation: response.conversation });
          // 同时获取该会话的消息
          get().fetchMessages(conversationId);
        } catch (error) {
          toast.error("获取会话详情失败", { description: String(error) });
        } finally {
          set({ isLoadingCurrentConversation: false });
        }
      },

      // 设置当前会话
      setCurrentConversation: (conversation) => {
        set({ currentConversation: conversation });
      },

      // 获取会话消息
      fetchMessages: async (conversationId: number) => {
        const { isLoadingMessages } = get();

        // 检查是否已经在加载该会话的消息
        if (isLoadingMessages[conversationId]) return;

        set({
          isLoadingMessages: {
            ...get().isLoadingMessages,
            [conversationId]: true
          }
        });

        try {
          const response = await getMessages({
            conversationId,
            page: 1,
            limit: 50
          });

          // 按时间排序消息
          const sortedMessages = response.messages.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          set({
            messages: {
              ...get().messages,
              [conversationId]: sortedMessages
            }
          });
        } catch (error) {
          toast.error("获取消息失败", { description: String(error) });
        } finally {
          set({
            isLoadingMessages: {
              ...get().isLoadingMessages,
              [conversationId]: false
            }
          });
        }
      },

      // 发送消息
      sendMessage: async (data: SendMessageInput) => {
        set({ isSendingMessage: true });
        try {
          const newMessage = await sendMessage(data);

          // 更新消息列表
          const conversationId = data.conversationId;
          const currentMessages = get().messages[conversationId] || [];

          set({
            messages: {
              ...get().messages,
              [conversationId]: [...currentMessages, newMessage]
            }
          });

          // 更新会话列表中的最后一条消息
          const { conversations } = get();
          const updatedConversations = conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                latestMessage: newMessage,
                lastMessageAt: newMessage.createdAt
              };
            }
            return conv;
          });

          set({ conversations: updatedConversations });

          return newMessage;
        } catch (error) {
          toast.error("发送消息失败", { description: String(error) });
          return null;
        } finally {
          set({ isSendingMessage: false });
        }
      },

      // 创建会话
      createConversation: async (data: CreateConversationInput) => {
        try {
          const response = await createConversation(data);
          const newConversation = response.conversation;

          // 更新会话列表
          set({
            conversations: [newConversation, ...get().conversations]
          });

          return newConversation;
        } catch (error) {
          toast.error("创建会话失败", { description: String(error) });
          return null;
        }
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversation: state.currentConversation,
        messages: state.messages
      })
    }
  )
);

export default useChatStore; 