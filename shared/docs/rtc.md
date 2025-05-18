# WebRTC 视频通话服务接口文档

## 1. 概述

本文档描述了服务器端提供的WebRTC视频通话支持服务，包括事件类型、参数格式以及流程说明。我们的视频通话功能使用WebSocket作为信令通道，WebRTC作为P2P音视频传输技术。

## 2. REST API端点

### 2.1 获取STUN/TURN服务器配置

```
GET /api/rtc/ice-servers
```

**请求头**：
- `Authorization`: Bearer token

**响应格式**：
```typescript
interface IceServersResponse {
  success: boolean;
  data: {
    iceServers: {
      urls: string | string[];
      username?: string;
      credential?: string;
    }[];
  }
}
```

**示例响应**：
```json
{
  "success": true,
  "data": {
    "iceServers": [
      { "urls": "stun:stun.example.com:19302" },
      {
        "urls": "turn:turn.example.com:3478",
        "username": "username",
        "credential": "password"
      }
    ]
  }
}
```

## 3. WebSocket事件类型

通过WebSocket进行的视频通话信令使用以下事件类型：

```typescript
export enum VideoCallMessageType {
  offer = "call:offer",               // 发起通话请求
  answer = "call:answer",             // 接受通话请求
  ice_candidate = "call:ice_candidate", // 交换ICE候选
  hang_up = "call:hang_up",           // 挂断通话
  reject = "call:reject",             // 拒绝通话
  busy = "call:busy",                 // 忙线信号
  not_available = "call:not_available", // 不可用信号
  timeout = "call:timeout"            // 通话超时
}
```

## 4. 事件参数格式

### 4.1 发起通话请求 (call:offer)

**客户端发送数据**：
```typescript
interface CallOfferPayload {
  receiverId: string;           // 接收者ID
  offer: RTCSessionDescription; // SDP提议
  conversationId?: string;      // 可选的会话ID
  callType?: "video" | "audio"; // 通话类型，默认为视频
}
```

**服务端转发给接收方的数据**：
```typescript
interface CallOfferData {
  callId: string;               // 唯一通话ID (服务端生成)
  senderId: string;             // 发送者ID
  senderInfo: {                 // 发送者基本信息
    id: number;
    username: string;
    avatar: string;
  };
  offer: RTCSessionDescription; // SDP提议
  conversationId?: string;      // 可选的会话ID
  callType: "video" | "audio";  // 通话类型
  timestamp: string;            // 时间戳
}
```

### 4.2 接受通话 (call:answer)

**客户端发送数据**：
```typescript
interface CallAnswerPayload {
  callId: string;               // 通话ID
  receiverId: string;           // 原发起者ID
  answer: RTCSessionDescription;// SDP应答
}
```

**服务端转发给发起方的数据**：
```typescript
interface CallAnswerData {
  callId: string;               // 通话ID
  senderId: string;             // 应答者ID
  responderInfo: {              // 应答者基本信息
    id: number;
    username: string;
    avatar: string;
  };
  answer: RTCSessionDescription;// SDP应答
  timestamp: string;            // 时间戳
}
```

### 4.3 ICE候选交换 (call:ice_candidate)

**客户端发送数据**：
```typescript
interface IceCandidatePayload {
  callId: string;               // 通话ID
  receiverId: string;           // 接收者ID
  candidate: RTCIceCandidate;   // ICE候选
}
```

**服务端转发给对方的数据**：
```typescript
interface IceCandidateData {
  callId: string;               // 通话ID
  senderId: string;             // 发送者ID
  candidate: RTCIceCandidate;   // ICE候选
  timestamp: string;            // 时间戳
}
```

### 4.4 挂断通话 (call:hang_up)

**客户端发送数据**：
```typescript
interface HangUpPayload {
  callId: string;               // 通话ID
  receiverId: string;           // 接收者ID
  reason?: string;              // 挂断原因: "normal", "error", "timeout" 等
  metrics?: {                   // 可选的通话质量指标
    quality?: number;           // 质量评分(1-5)
    packetLoss?: number;        // 丢包率百分比
    latency?: number;           // 延迟(ms)
  };
}
```

**服务端转发给对方的数据**：
```typescript
interface HangUpData {
  callId: string;               // 通话ID
  senderId: string;             // 挂断方ID
  reason?: string;              // 挂断原因
  timestamp: string;            // 时间戳
}
```

### 4.5 拒绝通话 (call:reject)

**客户端发送数据**：
```typescript
interface RejectCallPayload {
  callId: string;               // 通话ID
  receiverId: string;           // 原发起者ID
  reason?: string;              // 拒绝原因: "rejected", "busy", "media_error" 等
}
```

**服务端转发给发起方的数据**：
```typescript
interface RejectCallData {
  callId: string;               // 通话ID
  senderId: string;             // 拒绝方ID
  reason?: string;              // 拒绝原因
  timestamp: string;            // 时间戳
}
```

### 4.6 不可用通知 (call:not_available)

**服务端发送给发起方的数据**：
```typescript
interface NotAvailableData {
  message: string;              // 提示消息
  receiverId: string;           // 不可用的接收者ID
}
```

### 4.7 忙线信号 (call:busy)

**客户端发送数据**：
```typescript
interface BusySignalPayload {
  callId: string;               // 通话ID
  receiverId: string;           // 原发起者ID
}
```

**服务端转发给发起方的数据**：
```typescript
interface BusySignalData {
  callId: string;               // 通话ID
  senderId: string;             // 忙线方ID
  message: string;              // 提示消息
  timestamp: string;            // 时间戳
}
```

## 5. 服务端校验规则

服务端对视频通话相关消息进行以下校验：

1. **用户身份验证**：确保WebSocket连接已完成身份验证
2. **权限验证**：
   - 检查发起者和接收者是否存在
   - 验证发起者是否有权限联系接收者（好友关系或同群组成员）
3. **状态校验**：
   - 检查接收者是否在线
   - 对无效的通话ID进行筛选

## 6. 错误处理

服务器会在以下情况下返回错误消息：

```typescript
interface ErrorResponse {
  type: "error";
  data: {
    message: string;
    code: number;   // 404: 接收者不存在, 403: 无权限, 500: 服务器错误
  }
}
```

## 7. 使用流程

1. **发起通话**：
   - 客户端发送 `call:offer` 事件
   - 服务端验证权限并转发请求给接收方
   - 如接收方不在线，服务端返回 `call:not_available` 事件

2. **接收通话**：
   - 接收方发送 `call:answer` 事件
   - 服务端转发给发起方

3. **ICE候选交换**：
   - 双方通过 `call:ice_candidate` 事件交换ICE候选

4. **结束通话**：
   - 任一方可发送 `call:hang_up` 事件
   - 接收方可通过 `call:reject` 拒绝通话

## 8. 注意事项

1. 所有通过WebSocket发送的消息格式均为JSON
2. 客户端应妥善处理各种错误情况，包括网络断连、媒体设备访问失败等
3. 建议使用adapter.js适配不同浏览器的WebRTC实现差异
4. 视频通话的实际媒体数据通过P2P传输，服务器仅作为信令中转
