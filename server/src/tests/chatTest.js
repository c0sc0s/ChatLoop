/**
 * WebSocket聊天功能测试客户端
 * 使用方法: node chatTest.js <用户令牌> <会话ID>
 */

const WebSocket = require("ws");

// 配置项
const WS_URL = "ws://localhost:3000/ws/connect"; // 根据您的实际地址调整
const TOKEN = process.argv[2] || "test_token"; // 从命令行参数获取令牌
const CONVERSATION_ID = process.argv[3] || "1"; // 从命令行参数获取会话ID

// 创建WebSocket连接
const ws = new WebSocket(`${WS_URL}?token=${TOKEN}`);

// 连接成功
ws.on("open", () => {
  console.log("WebSocket连接已建立");

  // 发送测试消息
  setTimeout(() => {
    const message = {
      type: "chat:send",
      data: {
        conversationId: CONVERSATION_ID,
        content: "这是一条测试消息",
        type: "text",
        tempId: "temp_" + Date.now(),
      },
    };

    console.log("发送消息:", message);
    ws.send(JSON.stringify(message));
  }, 1000);
});

// 接收消息
ws.on("message", (data) => {
  try {
    const message = JSON.parse(data);
    console.log("收到消息:", message);

    // 如果收到新消息，标记为已读
    if (message.type === "chat:received") {
      setTimeout(() => {
        const markReadMsg = {
          type: "chat:mark_read",
          data: {
            conversationId: CONVERSATION_ID,
            messageIds: [message.data.id],
          },
        };

        console.log("标记消息为已读:", markReadMsg);
        ws.send(JSON.stringify(markReadMsg));
      }, 1000);
    }

    // 如果是connection类型，请求历史消息
    if (message.type === "connection" && message.data.success) {
      setTimeout(() => {
        const historyMsg = {
          type: "chat:history",
          data: {
            conversationId: CONVERSATION_ID,
            limit: 10,
          },
        };

        console.log("请求历史消息:", historyMsg);
        ws.send(JSON.stringify(historyMsg));
      }, 500);
    }
  } catch (error) {
    console.error("解析消息出错:", error);
  }
});

// 错误处理
ws.on("error", (error) => {
  console.error("WebSocket错误:", error);
});

// 连接关闭
ws.on("close", () => {
  console.log("WebSocket连接已关闭");
});

// 处理进程终止
process.on("SIGINT", () => {
  console.log("关闭WebSocket连接...");
  ws.close();
  process.exit(0);
});
