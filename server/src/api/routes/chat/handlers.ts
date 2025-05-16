import { FastifyRequest, FastifyReply } from "fastify";
import {
  CreateConversationInput,
  GetConversationsQuery,
  GetConversationParams,
  GetMessagesParams,
  GetMessagesQuery,
  MarkMessagesAsReadInput
} from "./schema";
import response from "@/api/utils/response";

/**
 * 获取当前用户的所有会话
 */
export async function getConversations(
  request: FastifyRequest<{ Querystring: GetConversationsQuery }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const userId = request.user?.id;
  const { page = 1, limit = 20, type } = request.query || {};

  if (!userId) {
    return response.unauthorized(reply);
  }

  try {
    // 构建查询条件
    const where = {
      participants: {
        some: {
          userId
        }
      },
      ...(type ? { type } : {})
    };

    // 获取总数
    const totalCount = await prisma.conversation.count({
      where
    });

    // 获取会话列表
    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        lastMessageAt: "desc"
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // 转换响应格式
    const formattedConversations = conversations.map(conversation => ({
      ...conversation,
      latestMessage: conversation.messages[0] || null
    }));

    return response.success(
      reply,
      {
        conversations: formattedConversations,
        totalCount
      },
      "获取会话列表成功"
    );
  } catch (error) {
    request.log.error(error);
    return response.serverError(reply, "获取会话列表失败，请稍后再试");
  }
}

/**
 * 获取特定会话详情
 */
export async function getConversationById(
  request: FastifyRequest<{ Params: GetConversationParams }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const userId = request.user?.id;
  const { id } = request.params;

  if (!userId) {
    return response.unauthorized(reply);
  }

  try {
    // 检查会话是否存在且用户是否为参与者
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return response.error(reply, "会话不存在或您没有权限访问", 404);
    }

    // 转换响应格式
    const formattedConversation = {
      ...conversation,
      latestMessage: conversation.messages[0] || null
    };

    return response.success(
      reply,
      { conversation: formattedConversation },
      "获取会话详情成功"
    );
  } catch (error) {
    request.log.error(error);
    return response.serverError(reply, "获取会话详情失败，请稍后再试");
  }
}

/**
 * 获取特定会话的消息
 */
export async function getConversationMessages(
  request: FastifyRequest<{
    Params: GetMessagesParams;
    Querystring: GetMessagesQuery;
  }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const userId = request.user?.id;
  const { id } = request.params;
  const { page = 1, limit = 20, before } = request.query || {};

  if (!userId) {
    return response.unauthorized(reply);
  }

  try {
    // 检查会话是否存在且用户是否为参与者
    const conversationExists = await prisma.conversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId
          }
        }
      },
      select: { id: true }
    });

    if (!conversationExists) {
      return response.error(reply, "会话不存在或您没有权限访问", 404);
    }

    // 构建查询条件
    const whereCondition = {
      conversationId: id,
      ...(before ? {
        createdAt: {
          lt: new Date(before)
        }
      } : {})
    };

    // 获取总数
    const totalCount = await prisma.message.count({
      where: whereCondition
    });

    // 获取消息列表
    const messages = await prisma.message.findMany({
      where: whereCondition,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return response.success(
      reply,
      {
        messages: messages.reverse(), // 返回按时间升序排列的消息
        totalCount
      },
      "获取消息记录成功"
    );
  } catch (error) {
    request.log.error(error);
    return response.serverError(reply, "获取消息记录失败，请稍后再试");
  }
}

/**
 * 创建新会话
 */
export async function createConversation(
  request: FastifyRequest<{ Body: CreateConversationInput }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const userId = request.user?.id;
  const { participantIds, type = "direct", initialMessage } = request.body;

  if (!userId) {
    return response.unauthorized(reply);
  }

  // 确保当前用户不在参与者列表中（防止重复）
  const uniqueParticipantIds = [...new Set([userId, ...participantIds])];

  try {
    // 为直接对话检查现有会话
    if (type === "direct" && uniqueParticipantIds.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: "direct",
          participants: {
            every: {
              userId: { in: uniqueParticipantIds }
            }
          },
          AND: uniqueParticipantIds.map(id => ({
            participants: {
              some: { userId: id }
            }
          }))
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  status: true
                }
              }
            }
          },
          messages: {
            orderBy: {
              createdAt: "desc"
            },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  avatar: true
                }
              }
            }
          }
        }
      });

      if (existingConversation) {
        // 现有会话存在，返回它
        const formattedConversation = {
          ...existingConversation,
          latestMessage: existingConversation.messages[0] || null
        };

        return response.success(
          reply,
          { conversation: formattedConversation },
          "已存在的会话"
        );
      }
    }

    // 创建新会话
    const newConversation = await prisma.conversation.create({
      data: {
        type,
        lastMessageAt: initialMessage ? new Date() : null,
        participants: {
          create: uniqueParticipantIds.map(participantId => ({
            userId: participantId,
            lastReadAt: new Date()
          }))
        },
        ...(initialMessage ? {
          messages: {
            create: {
              senderId: userId,
              content: initialMessage,
              type: "text",
              status: "sent"
            }
          }
        } : {})
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    // 转换响应格式
    const formattedConversation = {
      ...newConversation,
      latestMessage: newConversation.messages[0] || null
    };

    return response.success(
      reply,
      { conversation: formattedConversation },
      "创建会话成功"
    );
  } catch (error) {
    request.log.error(error);
    return response.serverError(reply, "创建会话失败，请稍后再试");
  }
}

/**
 * 标记消息为已读
 */
export async function markMessagesAsRead(
  request: FastifyRequest<{ Body: MarkMessagesAsReadInput }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const userId = request.user?.id;
  const { conversationId, messageIds } = request.body;

  if (!userId) {
    return response.unauthorized(reply);
  }

  try {
    // 检查会话是否存在且用户是否为参与者
    const participantExists = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      }
    });

    if (!participantExists) {
      return response.error(reply, "会话不存在或您没有权限访问", 400);
    }

    // 更新参与者的最后阅读时间
    const now = new Date();
    const updatedParticipant = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId
        }
      },
      data: {
        lastReadAt: now
      }
    });

    // 如果提供了特定消息ID，将这些消息标记为已读
    if (messageIds && messageIds.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          conversationId,
          senderId: { not: userId } // 只更新不是当前用户发送的消息
        },
        data: {
          status: "read"
        }
      });
    }

    return response.success(
      reply,
      { updatedAt: now },
      "消息已标记为已读"
    );
  } catch (error) {
    request.log.error(error);
    return response.serverError(reply, "标记消息已读失败，请稍后再试");
  }
} 