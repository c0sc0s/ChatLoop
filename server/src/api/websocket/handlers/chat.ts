import { EventHandler, wsEventBus } from "../wsEventBus";
import getWebSocketManager from "../wsManger";
import { ChatMessageType, MessageType } from "../schema";

// 修改schema.ts以添加聊天消息类型
// 这里先实现处理器，后续再更新schema.ts

/**
 * 处理发送消息
 * 当用户通过WebSocket发送新消息时触发
 */
const handleSendMessage: EventHandler = async (payload, socket, senderId, fastify) => {
  if (!fastify) {
    console.error("Fastify 实例未设置");
    socket.send(JSON.stringify({
      type: MessageType.error,
      data: {
        message: "服务器内部错误",
        code: 500
      }
    }));
    return;
  }

  const { prisma } = fastify;
  const logger = fastify.log;

  try {
    const { conversationId, content, tempId, type = "text", mediaUrl = null, replyToId = null } = payload;

    // 1. 验证参数
    if (!senderId || !conversationId || !content) {
      socket.send(JSON.stringify({
        type: MessageType.error,
        data: {
          message: "消息格式不正确",
          code: 400,
          tempId // 返回tempId以便前端识别失败的消息
        }
      }));
      return;
    }

    // 2. 验证用户是否有权限在此会话中发送消息
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId: parseInt(senderId)
        }
      }
    });

    if (!participant) {
      socket.send(JSON.stringify({
        type: MessageType.error,
        data: {
          message: "您不是此会话的参与者",
          code: 403,
          tempId
        }
      }));
      return;
    }

    // 3. 过滤消息内容(可选，根据需要实现)
    // const filteredContent = filterMessageContent(content);

    // 4. 创建新消息
    const message = await prisma.message.create({
      data: {
        conversationId: parseInt(conversationId),
        senderId: parseInt(senderId),
        content,
        type,
        mediaUrl,
        replyToId: replyToId ? parseInt(replyToId) : null,
        status: "sent"
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        replyTo: replyToId ? {
          select: {
            id: true,
            content: true,
            senderId: true,
            type: true
          }
        } : false
      }
    });

    // 5. 更新会话的最后消息时间
    await prisma.conversation.update({
      where: { id: parseInt(conversationId) },
      data: { lastMessageAt: new Date() }
    });

    // 6. 获取会话中的其他参与者
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: parseInt(conversationId),
        userId: { not: parseInt(senderId) }
      },
      select: { userId: true }
    });

    // 7. 向发送者确认消息已发送
    socket.send(JSON.stringify({
      type: ChatMessageType.sent,
      data: {
        ...message,
        tempId // 返回tempId以便前端更新消息状态
      }
    }));

    // 8. 向所有其他参与者发送消息
    participants.forEach(participant => {
      getWebSocketManager().sendMessageToUser(participant.userId.toString(), {
        type: ChatMessageType.received,
        data: message
      });
    });

    // 9. 记录操作日志
    logger.info(`Message sent: id=${message.id}, conversation=${conversationId}, sender=${senderId}`);

  } catch (error) {
    logger.error("发送消息失败:", error);
    socket.send(JSON.stringify({
      type: MessageType.error,
      data: {
        message: "发送消息失败，请稍后重试",
        code: 500,
        tempId: payload?.tempId
      }
    }));
  }
};

/**
 * 处理标记消息为已读
 */
const handleMarkAsRead: EventHandler = async (payload, socket, userId, fastify) => {
  if (!fastify) {
    console.error("Fastify 实例未设置");
    return; // 静默失败
  }

  const { prisma } = fastify;
  const logger = fastify.log;

  try {
    const { conversationId, messageIds } = payload;

    // 1. 验证参数
    if (!userId || !conversationId) {
      return; // 静默失败
    }

    // 2. 验证用户权限
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId: parseInt(userId)
        }
      }
    });

    if (!participant) {
      logger.warn(`User ${userId} attempted to mark messages as read in conversation ${conversationId} they don't belong to`);
      return; // 静默失败
    }

    // 3. 更新参与者的最后阅读时间
    const now = new Date();
    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId: parseInt(userId)
        }
      },
      data: { lastReadAt: now }
    });

    // 4. 如果提供了消息ID列表，更新这些消息的状态
    if (messageIds && messageIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds.map((id: string | number) => typeof id === 'string' ? parseInt(id) : id) },
          conversationId: parseInt(conversationId),
          senderId: { not: parseInt(userId) } // 只更新不是当前用户发送的消息
        },
        data: { status: "read" }
      });

      // 5. 查找这些消息的发送者并通知他们
      const messages = await prisma.message.findMany({
        where: {
          id: { in: messageIds.map((id: string | number) => typeof id === 'string' ? parseInt(id) : id) }
        },
        select: {
          id: true,
          senderId: true
        },
        distinct: ['senderId']
      });

      // 通知消息发送者，他们的消息已被读取
      const senderIds = [...new Set(messages.map(m => m.senderId.toString()))];
      senderIds.forEach(senderId => {
        if (senderId !== userId) {
          const senderMessages = messages
            .filter(m => m.senderId.toString() === senderId)
            .map(m => m.id);

          getWebSocketManager().sendMessageToUser(senderId.toString(), {
            type: ChatMessageType.read,
            data: {
              conversationId,
              messageIds: senderMessages,
              readBy: parseInt(userId),
              readAt: now
            }
          });
        }
      });
    }

    // 6. 向请求者确认已处理
    socket.send(JSON.stringify({
      type: ChatMessageType.read_confirmed,
      data: {
        conversationId,
        readAt: now
      }
    }));

    logger.info(`Messages marked as read: conversation=${conversationId}, user=${userId}, count=${messageIds?.length || 0}`);

  } catch (error) {
    logger.error("标记消息已读失败:", error);
    // 不返回错误给客户端，因为这不是关键操作
  }
};

/**
 * 处理正在输入状态
 */
const handleTyping: EventHandler = async (payload, socket, userId, fastify) => {
  if (!fastify) {
    console.error("Fastify 实例未设置");
    return; // 静默失败
  }

  const { prisma } = fastify;
  const logger = fastify.log;

  try {
    const { conversationId, isTyping } = payload;

    // 1. 验证参数
    if (!userId || !conversationId) {
      return; // 静默失败
    }

    // 2. 验证用户权限
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId: parseInt(userId)
        }
      }
    });

    if (!participant) {
      return; // 静默失败
    }

    // 3. 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        username: true,
        avatar: true
      }
    });

    if (!user) {
      return; // 静默失败
    }

    // 4. 获取会话中的其他参与者
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: parseInt(conversationId),
        userId: { not: parseInt(userId) }
      },
      select: { userId: true }
    });

    // 5. 向其他参与者发送输入状态
    participants.forEach(p => {
      getWebSocketManager().sendMessageToUser(p.userId.toString(), {
        type: ChatMessageType.typing,
        data: {
          conversationId,
          user,
          isTyping,
          timestamp: new Date().toISOString()
        }
      });
    });

  } catch (error) {
    logger.error("发送输入状态失败:", error);
    // 不返回错误给客户端，因为这不是关键操作
  }
};

/**
 * 请求消息历史记录
 */
const handleRequestHistory: EventHandler = async (payload, socket, userId, fastify) => {
  if (!fastify) {
    console.error("Fastify 实例未设置");
    socket.send(JSON.stringify({
      type: MessageType.error,
      data: {
        message: "服务器内部错误",
        code: 500
      }
    }));
    return;
  }

  const { prisma } = fastify;
  const logger = fastify.log;

  try {
    const { conversationId, before, limit = 20 } = payload;

    // 1. 验证参数
    if (!userId || !conversationId) {
      socket.send(JSON.stringify({
        type: MessageType.error,
        data: {
          message: "参数不正确",
          code: 400
        }
      }));
      return;
    }

    // 2. 验证用户权限
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: parseInt(conversationId),
          userId: parseInt(userId)
        }
      }
    });

    if (!participant) {
      socket.send(JSON.stringify({
        type: MessageType.error,
        data: {
          message: "您不是此会话的参与者",
          code: 403
        }
      }));
      return;
    }

    // 3. 构建查询条件
    const whereCondition: any = { conversationId: parseInt(conversationId) };

    // 如果指定了时间，则获取该时间之前的消息
    if (before) {
      whereCondition.createdAt = { lt: new Date(before) };
    }

    // 4. 查询消息
    const messages = await prisma.message.findMany({
      where: whereCondition,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            senderId: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // 5. 返回消息历史
    socket.send(JSON.stringify({
      type: ChatMessageType.history,
      data: {
        conversationId,
        messages: messages.reverse(), // 按时间正序排列
        hasMore: messages.length === limit
      }
    }));

  } catch (error) {
    logger.error("获取消息历史失败:", error);
    socket.send(JSON.stringify({
      type: MessageType.error,
      data: {
        message: "获取消息历史失败",
        code: 500
      }
    }));
  }
};

// 注册事件处理器
wsEventBus.on(ChatMessageType.send, handleSendMessage);
wsEventBus.on(ChatMessageType.mark_read, handleMarkAsRead);
wsEventBus.on(ChatMessageType.typing, handleTyping);
wsEventBus.on(ChatMessageType.history, handleRequestHistory);

export default {
  handleSendMessage,
  handleMarkAsRead,
  handleTyping,
  handleRequestHistory
}; 