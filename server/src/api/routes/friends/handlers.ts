import { FastifyRequest, FastifyReply } from "fastify";
import { FriendRequestInput, FriendActionInput } from "./schema";
import response from "@/api/utils/response";
import getWebSocketManager from "@/api/websocket/wsManger";
import { FriendMessageType } from "@/api/websocket/schema";

// 获取好友列表
export async function getFriends(request: FastifyRequest, reply: FastifyReply) {
  const { prisma } = request.server;
  const userId = request.user.id;

  try {
    // 查询已接受的好友关系
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { initiatorId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' }
        ]
      },
      include: {
        initiator: {
          select: { id: true, username: true, avatar: true, status: true, lastActiveAt: true }
        },
        receiver: {
          select: { id: true, username: true, avatar: true, status: true, lastActiveAt: true }
        }
      }
    });

    // 提取好友列表
    const friends = friendships.map(friendship => {
      const friend = friendship.initiatorId === userId ? friendship.receiver : friendship.initiator;
      return {
        id: friend.id,
        username: friend.username,
        avatar: friend.avatar,
        status: friend.status || 'offline',
        lastActiveAt: friend.lastActiveAt ? friend.lastActiveAt.toISOString() : null
      };
    });

    return response.success(reply, { friends, total: friends.length }, "获取好友列表成功");
  } catch (error) {
    request.log.error(error);
    return response.serverError(reply, "获取好友列表失败，请稍后再试");
  }
}

// 获取好友请求列表
export async function getFriendRequests(request: FastifyRequest, reply: FastifyReply) {
  const { prisma } = request.server;
  const userId = request.user.id;
  try {
    // 查询待处理的好友请求
    const friendRequests = await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'pending'
      },
      include: {
        initiator: {
          select: { id: true, username: true, avatar: true, status: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 格式化请求列表
    const requests = friendRequests.map(request => {
      return {
        id: request.id,
        initiatorId: request.initiatorId,
        receiverId: request.receiverId,
        status: request.status,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
        user: {
          id: request.initiator.id,
          username: request.initiator.username,
          avatar: request.initiator.avatar,
          status: request.initiator.status || 'offline'
        }
      };
    });

    return response.success(reply, { requests, total: requests.length }, "获取好友请求列表成功");
  } catch (error) {
    request.log.error(error);
    return response.serverError(reply, "获取好友请求列表失败，请稍后再试");
  }
}

// 发送好友请求
export async function sendFriendRequest(
  request: FastifyRequest<{ Body: FriendRequestInput }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const { targetUserId } = request.body;
  const userId = request.user.id;

  // 不能添加自己为好友
  if (userId === targetUserId) {
    return response.error(reply, "不能添加自己为好友", 400);
  }

  try {
    // 验证目标用户是否存在
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (!targetUser) {
      return response.error(reply, "目标用户不存在", 404);
    }

    // 检查是否已经是好友或已有请求
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: userId, receiverId: targetUserId },
          { initiatorId: targetUserId, receiverId: userId }
        ]
      }
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return response.error(reply, "你们已经是好友了", 400);
      } else if (existingFriendship.status === 'pending' &&
        existingFriendship.initiatorId === userId) {
        return response.error(reply, "好友请求已发送，等待对方响应", 400);
      } else if (existingFriendship.status === 'blocked') {
        return response.error(reply, "无法添加此用户为好友", 400);
      }
    }

    // 创建好友请求
    const friendship = await prisma.friendship.create({
      data: {
        initiatorId: userId,
        receiverId: targetUserId,
        status: 'pending',
      }
    });

    // 获取发送者信息
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, avatar: true }
    });

    // 创建通知数据
    const notificationData = {
      requestId: friendship.id,
      from: {
        id: sender.id,
        username: sender.username,
        avatar: sender.avatar
      },
      createdAt: friendship.createdAt.toISOString()
    };

    // 尝试通过WebSocket发送实时通知
    const wsManager = getWebSocketManager();
    const isDelivered = wsManager.sendMessageToUser(
      targetUserId.toString(),
      {
        type: FriendMessageType.request,
        data: notificationData
      }
    );

    // // 如果用户不在线，存储为离线通知
    // if (!isDelivered) {
    //   await prisma.notification.create({
    //     data: {
    //       userId: targetUserId,
    //       type: NotificationType.FRIEND_REQUEST,
    //       content: JSON.stringify(notificationData),
    //       read: false,
    //       delivered: false,
    //       createdAt: new Date()
    //     }
    //   });
    // }

    return response.success(
      reply,
      { requestId: friendship.id },
      "好友请求已发送",
      201
    );
  } catch (error) {
    request.log.error(error);
    return response.serverError(reply, "发送好友请求失败，请稍后再试");
  }
}

// 接受好友请求
export async function acceptFriendRequest(
  request: FastifyRequest<{ Body: FriendActionInput }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const { requestId } = request.body;
  const userId = request.user.id;

  try {
    // 查找并验证好友请求
    const friendRequest = await prisma.friendship.findUnique({
      where: { id: requestId },
      include: {
        initiator: {
          select: { id: true, username: true, avatar: true }
        }
      }
    });

    if (!friendRequest) {
      return response.error(reply, "好友请求不存在", 404);
    }

    if (friendRequest.receiverId !== userId) {
      return response.error(reply, "无权操作此好友请求", 403);
    }

    if (friendRequest.status !== 'pending') {
      return response.error(reply, "此请求已被处理", 400);
    }

    // 更新好友请求状态为已接受
    await prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    });

    // 获取接受者信息
    const receiver = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, avatar: true }
    });

    // 通知请求发送者请求已被接受
    const notificationData = {
      requestId: friendRequest.id,
      friend: {
        id: receiver.id,
        username: receiver.username,
        avatar: receiver.avatar
      },
      createdAt: new Date().toISOString()
    };

    // 尝试通过WebSocket发送实时通知
    const wsManager = getWebSocketManager();
    const isDelivered = wsManager.sendMessageToUser(
      String(friendRequest.initiatorId),
      {
        type: FriendMessageType.accept,
        data: notificationData
      }
    );

    // 如果用户不在线，存储为离线通知
    // if (!isDelivered) {
    // await prisma.notification.create({
    //     data: {
    //       userId: friendRequest.initiatorId,
    //       type: NotificationType.FRIEND_REQUEST_ACCEPTED,
    //       content: JSON.stringify(notificationData),
    //       read: false,
    //       delivered: false,
    //       createdAt: new Date()
    //     }
    // });
    // }

    return response.success(reply, null, "已接受好友请求");
  } catch (error) {
    request.log.error(error);
    return response.serverError(reply, "处理好友请求失败，请稍后再试");
  }
}

// 拒绝好友请求
export async function rejectFriendRequest(
  request: FastifyRequest<{ Body: FriendActionInput }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const { requestId } = request.body;
  const userId = request.user.id;

  try {
    // 查找并验证好友请求
    const friendRequest = await prisma.friendship.findUnique({
      where: { id: requestId }
    });

    if (!friendRequest) {
      return response.error(reply, "好友请求不存在", 404);
    }

    if (friendRequest.receiverId !== userId) {
      return response.error(reply, "无权操作此好友请求", 403);
    }

    if (friendRequest.status !== 'pending') {
      return response.error(reply, "此请求已被处理", 400);
    }

    // 更新好友请求状态为已拒绝
    await prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'rejected' }
    });

    // 可选：通知发送者请求被拒绝
    // 这步可以省略，以保护接收者的隐私

    return response.success(reply, null, "已拒绝好友请求");
  } catch (error) {
    request.log.error(error);
    return response.serverError(reply, "处理好友请求失败，请稍后再试");
  }
}

// 删除好友
export async function deleteFriend(
  request: FastifyRequest<{ Params: { friendId: string } }>,
  reply: FastifyReply
) {
  const { prisma } = request.server;
  const friendId = parseInt(request.params.friendId, 10);
  const userId = request.user.id;

  // 验证friendId是否为有效数字
  if (isNaN(friendId) || friendId <= 0) {
    return response.error(reply, "无效的好友ID", 400);
  }

  try {
    // 查找好友关系
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: userId, receiverId: friendId, status: 'accepted' },
          { initiatorId: friendId, receiverId: userId, status: 'accepted' }
        ]
      }
    });

    if (!friendship) {
      return response.error(reply, "好友关系不存在", 404);
    }

    // 删除好友关系
    await prisma.friendship.delete({
      where: { id: friendship.id }
    });

    // 通知对方被删除
    const wsManager = getWebSocketManager();
    wsManager.sendMessageToUser(
      String(friendId),
      {
        type: FriendMessageType.delete,
        data: {
          userId: userId,
          timestamp: new Date().toISOString()
        }
      }
    );

    return response.success(reply, null, "好友已删除");
  } catch (error) {
    request.log.error(error);
    return response.serverError(reply, "删除好友失败，请稍后再试");
  }
}