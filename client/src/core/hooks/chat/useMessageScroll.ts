import { useState, useRef, useEffect, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import type { MessageSchema } from '@/common/types/chat';

interface UseMessageScrollResult {
  containerRef: MutableRefObject<HTMLDivElement | null>;
  messagesEndRef: MutableRefObject<HTMLDivElement | null>;
  unreadCount: number;
  scrollToBottom: (smooth?: boolean) => void;
}

/**
 * 处理消息列表的滚动行为和未读消息计数
 * 
 * 功能:
 * 1. 智能滚动 - 仅在适当时机自动滚动到底部
 * 2. 跟踪未读消息数量
 * 3. 提供手动滚动到底部的方法
 */
export function useMessageScroll(
  messages: MessageSchema[],
  conversationId?: number
): UseMessageScrollResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 追踪未读消息数量
  const [unreadCount, setUnreadCount] = useState(0);

  // 追踪用户是否正在查看历史消息
  const [isViewingHistory, setIsViewingHistory] = useState(false);

  // 上一次消息数量，用于检测新消息
  const prevMessagesLengthRef = useRef<number>(0);

  // 上一次的会话ID，用于检测会话切换
  const prevConversationIdRef = useRef<number | undefined>(conversationId);

  // 是否是首次加载的标志
  const isFirstLoadRef = useRef<boolean>(true);

  // 滚动到底部
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
      setUnreadCount(0);
    }
  }, []);

  // 当会话ID变化时重置状态
  useEffect(() => {
    // 如果会话ID变化了，重置状态
    if (conversationId !== prevConversationIdRef.current) {
      isFirstLoadRef.current = true;
      setUnreadCount(0);
      setIsViewingHistory(false);
      prevMessagesLengthRef.current = 0;
      prevConversationIdRef.current = conversationId;
    }
  }, [conversationId]);

  // 监听滚动事件，判断用户是否在查看历史消息
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // 如果滚动条距离底部小于一定范围，认为用户在查看最新消息
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      setIsViewingHistory(!isAtBottom);

      // 如果用户滚动到底部，重置未读消息计数
      if (isAtBottom) {
        setUnreadCount(0);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // 处理消息列表变化
  useEffect(() => {
    // 防止空消息列表的处理
    if (messages.length === 0) {
      return;
    }

    const previousLength = prevMessagesLengthRef.current;

    // 首次加载消息或切换会话 (不使用动画效果)
    if (isFirstLoadRef.current) {
      // 设置一个短暂的延时确保DOM已更新
      setTimeout(() => {
        scrollToBottom(false); // 直接滚动，不使用动画
      }, 50);
      isFirstLoadRef.current = false;
    }
    // 检测新消息（同一会话中）
    else if (messages.length > previousLength) {
      const newMessageCount = messages.length - previousLength;

      if (isViewingHistory) {
        // 用户正在查看历史消息，只增加未读计数
        setUnreadCount(prev => prev + newMessageCount);
      } else {
        // 用户在查看最新消息，滚动到底部（带动画）
        scrollToBottom(true);
      }
    }

    // 更新消息数量引用
    prevMessagesLengthRef.current = messages.length;

  }, [messages, isViewingHistory, scrollToBottom]);

  return {
    containerRef,
    messagesEndRef,
    unreadCount,
    scrollToBottom
  };
} 