import { EventHandler, wsEventBus } from "../wsEventBus";
import getWebSocketManager from "../wsManger";
import { VideoCallMessageType, MessageType } from "../schema";
import { v4 as uuidv4 } from 'uuid';

const handleCallOffer: EventHandler = async (payload, socket, senderId, fastify) => {
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
    const { receiverId, offer, conversationId } = payload;

    // 检查接收者是否存在
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) }
    });

    if (!receiver) {
      socket.send(JSON.stringify({
        type: MessageType.error,
        data: {
          message: "接收者不存在",
          code: 404
        }
      }));
      return;
    }

    // 检查发送者和接收者是否有关联（好友关系或同群组）
    const canContact = await canUserContact(prisma, parseInt(senderId), parseInt(receiverId));
    if (!canContact) {
      socket.send(JSON.stringify({
        type: MessageType.error,
        data: {
          message: "您没有权限联系该用户",
          code: 403
        }
      }));
      return;
    }

    // 检查接收者是否在线
    const wsManager = getWebSocketManager();
    const isReceiverOnline = wsManager.isUserOnline(receiverId);

    if (!isReceiverOnline) {
      socket.send(JSON.stringify({
        type: VideoCallMessageType.not_available,
        data: {
          message: "对方不在线",
          receiverId
        }
      }));
      return;
    }

    // 查询发送者信息，用于通知接收者
    const sender = await prisma.user.findUnique({
      where: { id: parseInt(senderId) },
      select: { id: true, username: true, avatar: true }
    });

    // 将通话请求转发给接收者
    wsManager.sendMessageToUser(receiverId, {
      type: VideoCallMessageType.offer,
      data: {
        callId: uuidv4(), // 生成唯一的通话ID
        senderId,
        senderInfo: sender,
        offer,
        conversationId,
        timestamp: new Date().toISOString()
      }
    });

    logger.info(`通话请求已发送: 从用户 ${senderId} 到用户 ${receiverId}`);

  } catch (error) {
    logger.error("处理通话请求失败:", error);
    socket.send(JSON.stringify({
      type: MessageType.error,
      data: {
        message: "处理通话请求失败",
        code: 500
      }
    }));
  }
};

// 辅助函数：检查用户是否可以联系另一用户
async function canUserContact(prisma, senderId, receiverId) {
  // 检查是否是好友
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        {
          initiatorId: senderId,
          receiverId: receiverId,
          status: 'accepted'
        },
        {
          initiatorId: receiverId,
          receiverId: senderId,
          status: 'accepted'
        }
      ]
    }
  });

  if (friendship) return true;

  // 检查是否在同一群组
  const senderGroups = await prisma.groupMember.findMany({
    where: { userId: senderId },
    select: { groupId: true }
  });

  const senderGroupIds = senderGroups.map(g => g.groupId);

  if (senderGroupIds.length === 0) return false;

  const commonGroup = await prisma.groupMember.findFirst({
    where: {
      userId: receiverId,
      groupId: { in: senderGroupIds }
    }
  });

  return !!commonGroup;
}

const handleCallAnswer: EventHandler = async (payload, socket, senderId, fastify) => {
  if (!fastify) {
    console.error("Fastify 实例未设置");
    return;
  }

  const { prisma } = fastify;
  const logger = fastify.log;

  try {
    const { callId, receiverId, answer } = payload;

    // 查询应答者信息
    const responder = await prisma.user.findUnique({
      where: { id: parseInt(senderId) },
      select: { id: true, username: true, avatar: true }
    });

    // 将通话应答转发给发起人
    getWebSocketManager().sendMessageToUser(receiverId, {
      type: VideoCallMessageType.answer,
      data: {
        callId,
        senderId,
        responderInfo: responder,
        answer,
        timestamp: new Date().toISOString()
      }
    });


    logger.info(`通话已接受: 通话ID=${callId}, 接受者=${senderId}`);
  } catch (error) {
    logger.error("处理通话应答失败:", error);
    socket.send(JSON.stringify({
      type: MessageType.error,
      data: {
        message: "处理通话应答失败",
        code: 500
      }
    }));
  }
};

const handleIceCandidate: EventHandler = async (payload, socket, senderId, fastify) => {
  if (!fastify) {
    console.error("Fastify 实例未设置");
    return;
  }

  const logger = fastify.log;

  try {
    const { callId, receiverId, candidate } = payload;

    // 将ICE候选转发给对方
    getWebSocketManager().sendMessageToUser(receiverId, {
      type: VideoCallMessageType.ice_candidate,
      data: {
        callId,
        senderId,
        candidate,
        timestamp: new Date().toISOString()
      }
    });

    logger.debug(`ICE候选已转发: 通话ID=${callId}, 发送者=${senderId}, 接收者=${receiverId}`);
  } catch (error) {
    logger.error("处理ICE候选失败:", error);
  }
};

const handleHangUp: EventHandler = async (payload, socket, senderId, fastify) => {
  if (!fastify) {
    console.error("Fastify 实例未设置");
    return;
  }

  const { prisma } = fastify;
  const logger = fastify.log;

  try {
    const { callId, receiverId, reason } = payload;

    // 通知对方挂断
    getWebSocketManager().sendMessageToUser(receiverId, {
      type: VideoCallMessageType.hang_up,
      data: {
        callId,
        senderId,
        reason,
        timestamp: new Date().toISOString()
      }
    });

    logger.info(`通话已结束: 通话ID=${callId}, 结束方=${senderId}, 原因=${reason || 'normal'}`);
  } catch (error) {
    logger.error("处理挂断通话失败:", error);
  }
};

const handleRejectCall: EventHandler = async (payload, socket, senderId, fastify) => {
  if (!fastify) {
    console.error("Fastify 实例未设置");
    return;
  }

  const { prisma } = fastify;
  const logger = fastify.log;

  try {
    const { callId, receiverId, reason } = payload;

    // 通知对方拒绝通话
    getWebSocketManager().sendMessageToUser(receiverId, {
      type: VideoCallMessageType.reject,
      data: {
        callId,
        senderId,
        reason,
        timestamp: new Date().toISOString()
      }
    });

    logger.info(`通话被拒绝: 通话ID=${callId}, 拒绝方=${senderId}, 原因=${reason || 'user rejected'}`);
  } catch (error) {
    logger.error("处理拒绝通话失败:", error);
  }
};

wsEventBus.on(VideoCallMessageType.reject, handleRejectCall);
wsEventBus.on(VideoCallMessageType.offer, handleCallOffer);
wsEventBus.on(VideoCallMessageType.answer, handleCallAnswer);
wsEventBus.on(VideoCallMessageType.ice_candidate, handleIceCandidate);
wsEventBus.on(VideoCallMessageType.hang_up, handleHangUp);

export default {
  handleCallOffer,
  handleCallAnswer,
  handleIceCandidate,
  handleHangUp,
  handleRejectCall
};