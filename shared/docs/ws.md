# WebSocket 事件与业务逻辑文档

本文档详细说明了服务端 WebSocket 支持的事件类型及其对应的业务逻辑处理流程。前端开发者可以参考此文档进行 WebSocket 通信的实现。

## 连接建立

### WebSocket 连接地址

```
ws://localhost:3001/ws/connect?token=[用户身份令牌]
```

- 必须在查询参数中提供有效的 `token` 参数，用于用户身份验证
- 连接成功后，服务器会发送 `connection` 类型的消息进行确认

### 连接成功响应

```json
{
  "type": "connection",
  "data": {
    "success": true,
    "connectId": "生成的连接ID",
    "userId": "当前用户ID",
    "timestamp": 1698765432123
  }
}
```

## 消息格式

所有 WebSocket 消息都遵循以下格式：

```json
{
  "type": "事件类型",
  "data": {
    // 事件相关的数据
  }
}
```

## 系统事件

| 事件类型 | 方向 | 描述 |
|---------|------|------|
| `connection` | 服务端→客户端 | 连接成功确认 |
| `error` | 服务端→客户端 | 错误通知 |
| `ping` | 服务端→客户端 | 心跳检测 |

### 错误响应示例

```json
{
  "type": "error",
  "data": {
    "message": "错误消息",
    "code": 500
  }
}
```

## 聊天模块事件

### 1. 发送消息 (chat:send)

**客户端 → 服务端**

请求格式：
```json
{
  "type": "chat:send",
  "data": {
    "conversationId": "会话ID",
    "content": "消息内容",
    "type": "text", // 可选值: "text", "image", "file", "audio", "video"
    "mediaUrl": "媒体URL", // 可选，当type不是text时需要提供
    "replyToId": "回复的消息ID", // 可选
    "tempId": "临时ID" // 客户端生成的临时ID，用于追踪消息
  }
}
```

**业务逻辑**：
1. 验证用户是否为会话参与者
2. 创建新消息记录并存储到数据库
3. 更新会话的最后活动时间
4. 向发送者发送消息已发送确认
5. 向会话中的其他参与者发送新消息通知

### 2. 消息已发送确认 (chat:sent)

**服务端 → 客户端**

响应格式：
```json
{
  "type": "chat:sent",
  "data": {
    "id": 123, // 服务器生成的消息ID
    "conversationId": 456,
    "senderId": 789,
    "content": "消息内容",
    "type": "text",
    "mediaUrl": null,
    "status": "sent",
    "createdAt": "2023-10-31T12:34:56.789Z",
    "tempId": "客户端生成的临时ID"
  }
}
```

**业务意义**：
- 通知客户端消息已成功保存到数据库
- 客户端可以使用返回的临时ID匹配之前发送的消息，更新UI状态

### 3. 接收新消息 (chat:received)

**服务端 → 客户端**

消息格式：
```json
{
  "type": "chat:received",
  "data": {
    "id": 123,
    "conversationId": 456,
    "senderId": 789,
    "content": "消息内容",
    "type": "text",
    "mediaUrl": null,
    "status": "sent",
    "createdAt": "2023-10-31T12:34:56.789Z",
    "sender": {
      "id": 789,
      "username": "用户名",
      "avatar": "头像URL"
    }
  }
}
```

**业务意义**：
- 通知会话参与者有新消息
- 客户端应该在UI上显示新消息，并考虑发送通知

### 4. 标记消息已读 (chat:mark_read)

**客户端 → 服务端**

请求格式：
```json
{
  "type": "chat:mark_read",
  "data": {
    "conversationId": "会话ID",
    "messageIds": [123, 124, 125] // 要标记为已读的消息ID
  }
}
```

**业务逻辑**：
1. 验证用户是否为会话参与者
2. 更新用户的最后阅读时间
3. 更新指定消息的状态为"已读"
4. 向消息发送者发送已读通知
5. 向请求者发送确认

### 5. 消息已读通知 (chat:read)

**服务端 → 客户端**

消息格式：
```json
{
  "type": "chat:read",
  "data": {
    "conversationId": "会话ID",
    "messageIds": [123, 124, 125], // 已读的消息ID
    "readBy": "用户ID", // 谁已读了消息
    "readAt": "2023-10-31T12:34:56.789Z" // 阅读时间
  }
}
```

**业务意义**：
- 通知消息发送者，他们的消息已被接收方阅读
- 客户端应更新消息状态显示

### 6. 已读确认 (chat:read_confirmed)

**服务端 → 客户端**

消息格式：
```json
{
  "type": "chat:read_confirmed",
  "data": {
    "conversationId": "会话ID",
    "readAt": "2023-10-31T12:34:56.789Z"
  }
}
```

**业务意义**：
- 确认已成功处理标记已读请求
- 客户端可以更新UI显示

### 7. 正在输入状态 (chat:typing)

**客户端 → 服务端**

请求格式：
```json
{
  "type": "chat:typing",
  "data": {
    "conversationId": "会话ID",
    "isTyping": true // true表示开始输入，false表示停止输入
  }
}
```

**服务端 → 客户端**

通知格式：
```json
{
  "type": "chat:typing",
  "data": {
    "conversationId": "会话ID",
    "user": {
      "id": 789,
      "username": "用户名",
      "avatar": "头像URL"
    },
    "isTyping": true,
    "timestamp": "2023-10-31T12:34:56.789Z"
  }
}
```

**业务逻辑**：
1. 验证用户是否为会话参与者
2. 获取用户信息
3. 向会话中的其他参与者广播输入状态

**业务意义**：
- 提供实时反馈，增强用户体验
- 客户端可以显示"对方正在输入..."提示

### 8. 请求消息历史 (chat:history)

**客户端 → 服务端**

请求格式：
```json
{
  "type": "chat:history",
  "data": {
    "conversationId": "会话ID",
    "before": "2023-10-31T12:34:56.789Z", // 可选，获取此时间之前的消息
    "limit": 20 // 可选，默认20条
  }
}
```

**服务端 → 客户端**

响应格式：
```json
{
  "type": "chat:history",
  "data": {
    "conversationId": "会话ID",
    "messages": [
      // 消息列表，按时间正序排列
    ],
    "hasMore": true // 是否还有更多历史消息
  }
}
```

**业务逻辑**：
1. 验证用户是否为会话参与者
2. 根据提供的参数查询历史消息
3. 返回消息列表，并指示是否还有更多历史消息可加载

## 好友关系事件

### 1. 发送好友请求 (friend:request)

**客户端 → 服务端**

请求格式：
```json
{
  "type": "friend:request",
  "data": {
    "receiverId": "接收方用户ID",
    "message": "请求附言" // 可选
  }
}
```

### 2. 收到好友请求 (friend:request_received)

**服务端 → 客户端**

通知格式：
```json
{
  "type": "friend:request_received",
  "data": {
    "requestId": "请求ID",
    "initiator": {
      "id": "发起人ID",
      "username": "发起人用户名",
      "avatar": "发起人头像"
    },
    "message": "请求附言",
    "createdAt": "2023-10-31T12:34:56.789Z"
  }
}
```

### 3. 接受好友请求 (friend:accept)

**客户端 → 服务端**

请求格式：
```json
{
  "type": "friend:accept",
  "data": {
    "requestId": "请求ID"
  }
}
```

### 4. 好友请求被接受 (friend:accept_received)

**服务端 → 客户端**

通知格式：
```json
{
  "type": "friend:accept_received",
  "data": {
    "friendshipId": "好友关系ID",
    "user": {
      "id": "用户ID",
      "username": "用户名",
      "avatar": "头像URL"
    },
    "timestamp": "2023-10-31T12:34:56.789Z"
  }
}
```

### 5. 好友在线状态变更 (friend:online_status)

**服务端 → 客户端**

通知格式：
```json
{
  "type": "friend:online_status",
  "data": {
    "user": {
      "id": "用户ID",
      "username": "用户名",
      "avatar": "头像URL"
    },
    "status": "online", // "online", "offline", "away", "busy"
    "timestamp": "2023-10-31T12:34:56.789Z"
  }
}
```

## 错误处理

WebSocket 连接中的错误会通过 `error` 类型的消息发送：

```json
{
  "type": "error",
  "data": {
    "message": "错误描述",
    "code": 403, // HTTP 风格的错误码
    "tempId": "相关的临时ID" // 可选，适用于发送消息错误
  }
}
```

## 心跳机制

服务器每30秒发送一次 `ping` 消息：

```json
{
  "type": "ping",
  "data": {
    "timestamp": 1698765432123
  }
}
```

客户端应实现逻辑，在长时间未收到心跳时主动重连。

## 示例流程

### 发送和接收消息的流程

1. 客户端发送 `chat:send` 事件
2. 服务器处理并保存消息
3. 服务器向发送者返回 `chat:sent` 事件
4. 服务器向会话中的其他用户发送 `chat:received` 事件
5. 接收方可能发送 `chat:mark_read` 事件
6. 服务器处理并向原消息发送者发送 `chat:read` 事件
7. 服务器向标记已读的用户发送 `chat:read_confirmed` 事件
