import { create } from "zustand";
import { getConversations, getConversation, getMessages, createConversation } from "@/api/chat";
import type {
  CreateConversationInput,
  SendMessageInput,
  ConversationSchema,
  MessageSchema
} from "@/common/types/chat";
import { toast } from "sonner";
import { initialState, type ChatState } from "./states";
import chatWs from "@/core/ws/emitters/chat";

// 定义 actions 接口
export interface ChatActions {
  // 会话列表操作
  fetchConversations: () => Promise<void>;

  // 当前会话操作
  fetchConversation: (conversationId: number) => Promise<void>;
  setCurrentConversation: (conversation: ConversationSchema | null) => void;
  clearCurrentConversation: () => void;

  // 消息操作
  fetchMessages: (conversationId: number, checkCache?: boolean) => Promise<void>;
  sendMessage: (data: SendMessageInput) => Promise<void>;
  addMessage: (message: MessageSchema) => void;
  updateConversationLastMessage: (conversationId: number, message: MessageSchema) => void;

  // 创建会话
  createConversation: (data: CreateConversationInput) => Promise<ConversationSchema | null>;
}

// 创建 store
const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  // 初始状态
  ...initialState,

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
    const { isLoadingCurrentConversation, conversations } = get();
    if (isLoadingCurrentConversation) return;

    // 查找是否已经在会话列表中存在
    const existingConversation = conversations.find(conv => conv.id === conversationId);

    // 设置当前会话状态，避免页面闪烁
    if (existingConversation) {
      set({ currentConversation: existingConversation });
    } else {
      // 如果不存在，设置加载状态，但不清空当前会话
      set({ isLoadingCurrentConversation: true });
    }

    try {
      const response = await getConversation(conversationId);
      set({
        currentConversation: response.conversation,
        isLoadingCurrentConversation: false
      });

      // 调用获取消息，但传入检查缓存参数
      get().fetchMessages(conversationId, true);
    } catch (error) {
      toast.error("获取会话详情失败", { description: String(error) });
      set({ isLoadingCurrentConversation: false });
    }
  },

  // 设置当前会话
  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation });
  },

  // 清除当前会话数据
  clearCurrentConversation: () => {
    set({
      currentConversation: null,
      currentMessages: []
    });
  },

  // 获取会话消息
  fetchMessages: async (conversationId: number, checkCache?: boolean) => {
    const { isLoadingMessages, messages } = get();

    // 检查是否已经在加载该会话的消息
    if (isLoadingMessages[conversationId]) return;

    // 检查是否已经有该会话的消息缓存
    if (checkCache && messages[conversationId]?.length > 0) {
      // 如果已经有消息缓存，直接使用
      set({ currentMessages: messages[conversationId] || [] });
      return;
    }

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
        },
        currentMessages: sortedMessages,
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
      const { conversationId, content } = data;
      // 调用WebSocket发送消息
      chatWs.chatToUser(
        conversationId.toString(),
        content
      );

      // 这里不再在本地创建消息，而是等待WebSocket消息回调处理
      // WebSocket连接应该在收到服务器确认后更新消息状态
    } catch (error) {
      toast.error("发送消息失败", { description: String(error) });
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
  },

  // 添加消息
  addMessage: (message: MessageSchema) => {
    const { conversationId } = message;
    const currentMessages = get().messages[conversationId] || [];

    // 检查消息是否已存在（防止重复添加）
    const messageExists = currentMessages.some((msg) => msg.id === message.id);

    if (!messageExists) {
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [...currentMessages, message]
        },
        // 如果当前正在查看的就是这个会话，更新currentMessages
        ...(state.currentConversation?.id === conversationId
          ? { currentMessages: [...currentMessages, message] }
          : {})
      }));

      // 更新会话的最后一条消息
      get().updateConversationLastMessage(conversationId, message);
    }
  },

  // 更新会话的最后一条消息
  updateConversationLastMessage: (conversationId: number, message: MessageSchema) => {
    const { conversations } = get();

    // 查找会话是否存在
    const conversationIndex = conversations.findIndex((conv) => conv.id === conversationId);

    if (conversationIndex !== -1) {
      // 会话存在，更新最后一条消息
      const updatedConversations = [...conversations];
      updatedConversations[conversationIndex] = {
        ...updatedConversations[conversationIndex],
        latestMessage: message,
        lastMessageAt: message.createdAt
      };

      // 重新排序会话列表，最新消息的会话在前面
      updatedConversations.sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });

      set({ conversations: updatedConversations });
    }
  }
}));

export default useChatStore; 