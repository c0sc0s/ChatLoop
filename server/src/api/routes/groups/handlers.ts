import { FastifyRequest, FastifyReply } from "fastify";
import {
  CreateGroupInput,
  UpdateGroupInput,
  GroupsQueryParams,
  GroupIdParam
} from "./schema";

/**
 * 创建新群组
 */
export async function createGroup(
  request: FastifyRequest<{ Body: CreateGroupInput }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const { name, description, avatar, initialMemberIds = [] } = request.body;
  const userId = request.user.id;

  try {
    // 使用事务确保创建群组、会话和成员记录的一致性
    const result = await prisma.$transaction(async (tx) => {
      // 1. 创建群组
      const group = await tx.group.create({
        data: {
          name,
          description,
          avatar,
          creatorId: userId,
        },
      });

      // 2. 创建群聊会话
      const conversation = await tx.conversation.create({
        data: {
          type: "group",
          groupId: group.id,
          lastMessageAt: new Date(),
          // 3. 添加创建者作为第一个参与者
          participants: {
            create: {
              userId,
              lastReadAt: new Date(),
            },
          },
        },
      });

      // 4. 添加创建者作为群主
      await tx.groupMember.create({
        data: {
          groupId: group.id,
          userId,
          role: "owner",
        },
      });

      // 5. 添加初始成员（如果有）
      if (initialMemberIds.length > 0) {
        // 过滤掉创建者自己（避免重复添加）
        const otherMemberIds = initialMemberIds.filter(id => id !== userId);

        if (otherMemberIds.length > 0) {
          // 添加其他成员到群组
          await tx.groupMember.createMany({
            data: otherMemberIds.map(memberId => ({
              groupId: group.id,
              userId: memberId,
              role: "member",
            })),
          });

          // 添加其他成员到会话
          await tx.conversationParticipant.createMany({
            data: otherMemberIds.map(memberId => ({
              conversationId: conversation.id,
              userId: memberId,
              lastReadAt: new Date(),
            })),
          });
        }
      }

      return { group, conversationId: conversation.id };
    });

    // 返回创建的群组信息
    reply.code(201).send({
      id: result.group.id,
      name: result.group.name,
      avatar: result.group.avatar,
      description: result.group.description,
      creatorId: result.group.creatorId,
      createdAt: result.group.createdAt.toISOString(),
      conversationId: result.conversationId,
    });

    // TODO: 发送WebSocket通知，告知相关用户已创建群组

  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "创建群组失败" });
  }
}

/**
 * 获取用户加入的群组列表
 */
export async function getMyGroups(
  request: FastifyRequest<{ Querystring: GroupsQueryParams }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const userId = request.user.id;
  const { page, limit } = request.query;
  const skip = (page - 1) * limit;

  try {
    // 获取用户加入的群组总数
    const totalCount = await prisma.groupMember.count({
      where: {
        userId,
      },
    });

    // 获取群组详情
    const memberships = await prisma.groupMember.findMany({
      where: {
        userId,
      },
      include: {
        group: {
          include: {
            _count: {
              select: { members: true },
            },
            conversations: {
              take: 1,
              select: {
                id: true,
                lastMessageAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        group: {
          name: "asc",
        },
      },
      skip,
      take: limit,
    });

    const groups = memberships.map(membership => ({
      id: membership.group.id,
      name: membership.group.name,
      avatar: membership.group.avatar,
      description: membership.group.description,
      memberCount: membership.group._count.members,
      role: membership.role,
      lastMessageAt: membership.group.conversations[0]?.lastMessageAt?.toISOString() || null,
      conversationId: membership.group.conversations[0]?.id || 0,
    }));

    reply.send({ groups, totalCount });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "获取群组列表失败" });
  }
}

/**
 * 获取群组详情
 */
export async function getGroupDetail(
  request: FastifyRequest<{ Params: GroupIdParam }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const userId = request.user.id;
  const { groupId } = request.params;

  try {
    // 获取群组信息
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: { members: true },
        },
        conversations: {
          take: 1,
          select: { id: true },
        },
      },
    });

    if (!group) {
      return reply.code(404).send({ error: "群组不存在" });
    }

    // 检查用户是否为群组成员
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      return reply.code(403).send({ error: "您不是该群组的成员" });
    }

    reply.send({
      id: group.id,
      name: group.name,
      avatar: group.avatar,
      description: group.description,
      creatorId: group.creatorId,
      memberCount: group._count.members,
      createdAt: group.createdAt.toISOString(),
      conversationId: group.conversations[0]?.id || null,
      userRole: membership.role,
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "获取群组详情失败" });
  }
}

/**
 * 更新群组信息
 */
export async function updateGroup(
  request: FastifyRequest<{ Params: GroupIdParam; Body: UpdateGroupInput }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const userId = request.user.id;
  const { groupId } = request.params;
  const updates = request.body;

  try {
    // 检查用户是否为群组管理员
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      return reply.code(403).send({ error: "您不是该群组的成员" });
    }

    if (membership.role !== "owner" && membership.role !== "admin") {
      return reply.code(403).send({ error: "只有群主或管理员可以更新群组信息" });
    }

    // 更新群组信息
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: updates,
    });

    reply.send({
      id: updatedGroup.id,
      name: updatedGroup.name,
      avatar: updatedGroup.avatar,
      description: updatedGroup.description,
      updatedAt: updatedGroup.updatedAt.toISOString(),
    });

    // TODO: 发送WebSocket通知，告知群组信息已更新

  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "更新群组信息失败" });
  }
}

/**
 * 解散/删除群组
 */
export async function deleteGroup(
  request: FastifyRequest<{ Params: GroupIdParam }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const userId = request.user.id;
  const { groupId } = request.params;

  try {
    // 检查用户是否为群主
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return reply.code(404).send({ error: "群组不存在" });
    }

    if (group.creatorId !== userId) {
      return reply.code(403).send({ error: "只有群主可以解散群组" });
    }

    // 使用事务确保一致性
    await prisma.$transaction(async (tx) => {
      // 1. 删除群组成员
      await tx.groupMember.deleteMany({
        where: { groupId },
      });

      // 2. 删除会话参与者
      await tx.conversationParticipant.deleteMany({
        where: {
          conversation: {
            groupId,
          },
        },
      });

      // 3. 标记相关消息为已删除
      await tx.message.updateMany({
        where: {
          conversation: {
            groupId,
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });

      // 4. 删除会话
      await tx.conversation.deleteMany({
        where: { groupId },
      });

      // 5. 逻辑删除群组（或选择物理删除）
      await tx.group.update({
        where: { id: groupId },
        data: { deletedAt: new Date() },
      });
    });

    reply.send({
      success: true,
      message: "群组已成功解散",
    });

    // TODO: 发送WebSocket通知，告知相关用户群组已解散

  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "解散群组失败" });
  }
}

/**
 * 退出群组
 */
export async function leaveGroup(
  request: FastifyRequest<{ Params: GroupIdParam }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const userId = request.user.id;
  const { groupId } = request.params;

  try {
    // 检查用户是否为群组成员
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      return reply.code(403).send({ error: "您不是该群组的成员" });
    }

    // 检查是否为群主
    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (group?.creatorId === userId) {
      return reply.code(400).send({ error: "群主不能退出群组，请转让群主权限或解散群组" });
    }

    // 使用事务确保一致性
    await prisma.$transaction(async (tx) => {
      // 1. 删除群成员记录
      await tx.groupMember.delete({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
      });

      // 2. 删除会话参与者记录
      const conversation = await tx.conversation.findFirst({
        where: { groupId },
        select: { id: true },
      });

      if (conversation) {
        await tx.conversationParticipant.deleteMany({
          where: {
            conversationId: conversation.id,
            userId,
          },
        });
      }
    });

    reply.send({
      success: true,
      message: "您已成功退出群组",
    });

    // TODO: 发送WebSocket通知，告知群组成员有人退出

  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "退出群组失败" });
  }
} 