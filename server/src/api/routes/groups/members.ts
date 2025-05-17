import { FastifyInstance } from "fastify";
import {
  AddMembersInput,
  GroupIdParam,
  GroupMemberIdParam,
  UpdateMemberRoleInput,
  GroupMembersQueryParams,
} from "./schema";

/**
 * 群组成员管理相关路由
 */
export default async function (fastify: FastifyInstance) {
  // 为所有路由添加认证中间件
  fastify.addHook("onRequest", fastify.authenticate);

  // 获取群组成员列表
  fastify.get<{ Params: GroupIdParam; Querystring: GroupMembersQueryParams }>(
    "/:groupId/members",
    {
      schema: {
        params: GroupIdParam,
        querystring: GroupMembersQueryParams,
      },
    },
    async (request, reply) => {
      const { prisma } = fastify;
      const { groupId } = request.params;
      const { page, limit } = request.query;
      const userId = request.user.id;
      const skip = (page - 1) * limit;

      try {
        // 检查用户是否为群组成员
        const isMember = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId,
            },
          },
        });

        if (!isMember) {
          return reply.code(403).send({ error: "您不是该群组的成员" });
        }

        // 获取成员总数
        const totalCount = await prisma.groupMember.count({
          where: { groupId },
        });

        // 获取成员列表
        const members = await prisma.groupMember.findMany({
          where: { groupId },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            role: "desc",
          },
          skip,
          take: limit,
        });

        const formattedMembers = members.map((member) => ({
          id: member.user.id,
          username: member.user.username,
          avatar: member.user.avatar,
          role: member.role,
          joinedAt: member.joinedAt.toISOString(),
        }));

        reply.send({ members: formattedMembers, totalCount });
      } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: "获取群组成员列表失败" });
      }
    }
  );

  // 添加群组成员
  fastify.post<{ Params: GroupIdParam; Body: AddMembersInput }>(
    "/:groupId/members",
    {
      schema: {
        params: GroupIdParam,
        body: AddMembersInput,
      },
    },
    async (request, reply) => {
      const { prisma } = fastify;
      const { groupId } = request.params;
      const { memberIds } = request.body;
      const userId = request.user.id;

      try {
        // 检查用户是否有权限添加成员（群主或管理员）
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
          return reply.code(403).send({ error: "只有群主或管理员可以添加群组成员" });
        }

        // 获取群组关联的会话ID
        const conversation = await prisma.conversation.findFirst({
          where: { groupId },
          select: { id: true },
        });

        if (!conversation) {
          return reply.code(404).send({ error: "群组会话不存在" });
        }

        // 检查成员是否已在群组中
        const existingMembers = await prisma.groupMember.findMany({
          where: {
            groupId,
            userId: { in: memberIds },
          },
          select: { userId: true },
        });

        const existingMemberIds = existingMembers.map((m) => m.userId);
        const newMemberIds = memberIds.filter((id) => !existingMemberIds.includes(id));

        if (newMemberIds.length === 0) {
          return reply.code(400).send({ error: "所有用户已经是群组成员" });
        }

        // 使用事务添加新成员
        await prisma.$transaction(async (tx) => {
          // 添加群组成员
          await tx.groupMember.createMany({
            data: newMemberIds.map((memberId) => ({
              groupId,
              userId: memberId,
              role: "member",
            })),
          });

          // 添加会话参与者
          await tx.conversationParticipant.createMany({
            data: newMemberIds.map((memberId) => ({
              conversationId: conversation.id,
              userId: memberId,
              lastReadAt: new Date(),
            })),
          });
        });

        reply.code(201).send({
          success: true,
          message: `成功添加${newMemberIds.length}名成员到群组`,
          addedMemberIds: newMemberIds,
        });

        // TODO: 发送WebSocket通知，告知群组有新成员加入
      } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: "添加群组成员失败" });
      }
    }
  );

  // 移除群组成员
  fastify.delete<{ Params: GroupMemberIdParam }>(
    "/:groupId/members/:memberId",
    {
      schema: {
        params: GroupMemberIdParam,
      },
    },
    async (request, reply) => {
      const { prisma } = fastify;
      const { groupId, memberId } = request.params;
      const userId = request.user.id;

      try {
        // 检查要移除的用户是否为群主
        const targetMember = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId: memberId,
            },
          },
          include: {
            group: true,
          },
        });

        if (!targetMember) {
          return reply.code(404).send({ error: "该用户不是群组成员" });
        }

        // 群主不能被移除
        if (targetMember.group.creatorId === memberId) {
          return reply.code(403).send({ error: "群主不能被移除" });
        }

        // 检查操作用户权限
        const operatorMember = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId,
            },
          },
        });

        if (!operatorMember) {
          return reply.code(403).send({ error: "您不是该群组的成员" });
        }

        // 权限检查：
        // 1. 群主可以移除任何人
        // 2. 管理员可以移除普通成员
        // 3. 自己可以移除自己（退出群组）
        const canRemove =
          operatorMember.role === "owner" ||
          (operatorMember.role === "admin" && targetMember.role === "member") ||
          userId === memberId;

        if (!canRemove) {
          return reply.code(403).send({ error: "您没有权限移除该成员" });
        }

        // 获取群组关联的会话ID
        const conversation = await prisma.conversation.findFirst({
          where: { groupId },
          select: { id: true },
        });

        // 使用事务移除成员
        await prisma.$transaction(async (tx) => {
          // 删除群组成员
          await tx.groupMember.delete({
            where: {
              groupId_userId: {
                groupId,
                userId: memberId,
              },
            },
          });

          // 删除会话参与者
          if (conversation) {
            await tx.conversationParticipant.deleteMany({
              where: {
                conversationId: conversation.id,
                userId: memberId,
              },
            });
          }
        });

        reply.send({
          success: true,
          message: userId === memberId ? "您已退出群组" : "已成功移除群组成员",
        });

        // TODO: 发送WebSocket通知，告知群组成员被移除
      } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: "移除群组成员失败" });
      }
    }
  );

  // 更新群组成员角色
  fastify.patch<{ Params: GroupMemberIdParam; Body: UpdateMemberRoleInput }>(
    "/:groupId/members/:memberId/role",
    {
      schema: {
        params: GroupMemberIdParam,
        body: UpdateMemberRoleInput,
      },
    },
    async (request, reply) => {
      const { prisma } = fastify;
      const { groupId, memberId } = request.params;
      const { role } = request.body;
      const userId = request.user.id;

      try {
        // 检查群组存在
        const group = await prisma.group.findUnique({
          where: { id: groupId },
        });

        if (!group) {
          return reply.code(404).send({ error: "群组不存在" });
        }

        // 检查目标成员存在
        const targetMember = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId: memberId,
            },
          },
        });

        if (!targetMember) {
          return reply.code(404).send({ error: "该用户不是群组成员" });
        }

        // 检查操作用户权限
        const operatorMember = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId,
            },
          },
        });

        if (!operatorMember) {
          return reply.code(403).send({ error: "您不是该群组的成员" });
        }

        // 只有群主可以管理角色
        if (group.creatorId !== userId) {
          return reply.code(403).send({ error: "只有群主可以管理成员角色" });
        }

        // 无法更改群主角色
        if (memberId === group.creatorId) {
          return reply.code(400).send({ error: "无法更改群主角色" });
        }

        // 更新成员角色
        const updatedMember = await prisma.groupMember.update({
          where: {
            groupId_userId: {
              groupId,
              userId: memberId,
            },
          },
          data: { role },
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        });

        reply.send({
          success: true,
          message: `已将用户 ${updatedMember.user.username} 的角色更新为 ${role}`,
        });

        // TODO: 发送WebSocket通知，告知群组成员角色变更
      } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: "更新群组成员角色失败" });
      }
    }
  );

  // 转让群主
  fastify.patch<{ Params: GroupMemberIdParam }>(
    "/:groupId/transfer-ownership/:memberId",
    {
      schema: {
        params: GroupMemberIdParam,
      },
    },
    async (request, reply) => {
      const { prisma } = fastify;
      const { groupId, memberId } = request.params;
      const userId = request.user.id;

      try {
        // 检查群组存在
        const group = await prisma.group.findUnique({
          where: { id: groupId },
        });

        if (!group) {
          return reply.code(404).send({ error: "群组不存在" });
        }

        // 检查是否为群主
        if (group.creatorId !== userId) {
          return reply.code(403).send({ error: "只有群主可以转让群组" });
        }

        // 检查目标成员是否存在
        const targetMember = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId: memberId,
            },
          },
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        });

        if (!targetMember) {
          return reply.code(404).send({ error: "目标用户不是群组成员" });
        }

        // 使用事务转让群主
        await prisma.$transaction(async (tx) => {
          // 1. 更新群组创建者
          await tx.group.update({
            where: { id: groupId },
            data: { creatorId: memberId },
          });

          // 2. 将原群主角色降为管理员
          await tx.groupMember.update({
            where: {
              groupId_userId: {
                groupId,
                userId,
              },
            },
            data: { role: "admin" },
          });

          // 3. 将新群主角色设为owner
          await tx.groupMember.update({
            where: {
              groupId_userId: {
                groupId,
                userId: memberId,
              },
            },
            data: { role: "owner" },
          });
        });

        reply.send({
          success: true,
          message: `已成功将群主转让给 ${targetMember.user.username}`,
        });

        // TODO: 发送WebSocket通知，告知群组成员群主已变更
      } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: "转让群主失败" });
      }
    }
  );
} 