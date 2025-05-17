# 聊天模块 API (Chat)

聊天模块提供会话和消息相关的API，用于管理用户之间的实时通讯。

## 5.1 获取会话列表

获取当前用户参与的所有会话。

- **URL**: `/chat/conversations`
- **方法**: `GET`
- **权限**: 需要认证
- **查询参数**:
  - `page`: 可选，页码，默认值为1
  - `limit`: 可选，每页数量，默认值为20
  - `type`: 可选，会话类型，如"direct"或"group"

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "获取会话列表成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "conversations": [
      {
        "id": 1,
        "type": "direct",
        "lastMessageAt": "2023-08-15T12:34:56.789Z",
        "createdAt": "2023-08-15T12:00:00.000Z",
        "participants": [
          {
            "userId": 1,
            "user": {
              "id": 1,
              "username": "xiaoming",
              "avatar": "https://example.com/avatar1.jpg",
              "status": "online"
            },
            "lastReadAt": "2023-08-15T12:34:56.789Z"
          },
          {
            "userId": 2,
            "user": {
              "id": 2,
              "username": "xiaohong",
              "avatar": "https://example.com/avatar2.jpg",
              "status": "offline"
            },
            "lastReadAt": "2023-08-15T12:30:00.000Z"
          }
        ],
        "latestMessage": {
          "id": 10,
          "conversationId": 1,
          "senderId": 1,
          "content": "你好！",
          "type": "text",
          "status": "delivered",
          "createdAt": "2023-08-15T12:34:56.789Z",
          "sender": {
            "id": 1,
            "username": "xiaoming",
            "avatar": "https://example.com/avatar1.jpg"
          }
        }
      },
      // 更多会话...
    ],
    "totalCount": 5
  }
}
```

**响应类型**:
```typescript
interface ParticipantSchema {
  userId: number;
  user: {
    id: number;
    username: string;
    avatar?: string | null;
    status?: string;
  };
  lastReadAt: string;
}

interface MessageSchema {
  id: number;
  conversationId: number;
  senderId: number;
  content: string | null;
  type: string;
  mediaUrl?: string | null;
  status: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
    avatar?: string | null;
  };
}

interface ConversationSchema {
  id: number;
  type: string;
  lastMessageAt: string | null;
  createdAt: string;
  participants: ParticipantSchema[];
  latestMessage: MessageSchema | null;
}

interface ConversationsResponse {
  conversations: ConversationSchema[];
  totalCount: number;
}

type GetConversationsSuccessResponse = SuccessResponse<ConversationsResponse>;
```

## 5.2 获取会话详情

获取特定会话的详细信息。

- **URL**: `/chat/conversations/:id`
- **方法**: `GET`
- **参数**: 
  - `id`: 会话ID
- **权限**: 需要认证

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "获取会话详情成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "conversation": {
      "id": 1,
      "type": "direct",
      "lastMessageAt": "2023-08-15T12:34:56.789Z",
      "createdAt": "2023-08-15T12:00:00.000Z",
      "participants": [
        {
          "userId": 1,
          "user": {
            "id": 1,
            "username": "xiaoming",
            "avatar": "https://example.com/avatar1.jpg",
            "status": "online"
          },
          "lastReadAt": "2023-08-15T12:34:56.789Z"
        },
        {
          "userId": 2,
          "user": {
            "id": 2,
            "username": "xiaohong",
            "avatar": "https://example.com/avatar2.jpg",
            "status": "offline"
          },
          "lastReadAt": "2023-08-15T12:30:00.000Z"
        }
      ],
      "latestMessage": {
        "id": 10,
        "conversationId": 1,
        "senderId": 1,
        "content": "你好！",
        "type": "text",
        "status": "delivered",
        "createdAt": "2023-08-15T12:34:56.789Z",
        "sender": {
          "id": 1,
          "username": "xiaoming",
          "avatar": "https://example.com/avatar1.jpg"
        }
      }
    }
  }
}
```

**响应类型**:
```typescript
interface ConversationResponse {
  conversation: ConversationSchema;
}

type GetConversationSuccessResponse = SuccessResponse<ConversationResponse>;
```

## 5.3 获取会话消息

获取特定会话的消息历史记录。

- **URL**: `/chat/conversations/:id/messages`
- **方法**: `GET`
- **参数**: 
  - `id`: 会话ID
- **查询参数**:
  - `page`: 可选，页码，默认值为1
  - `limit`: 可选，每页数量，默认值为20
  - `before`: 可选，时间戳，获取此时间戳之前的消息

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "获取消息记录成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "messages": [
      {
        "id": 8,
        "conversationId": 1,
        "senderId": 2,
        "content": "你好，最近怎么样？",
        "type": "text",
        "status": "read",
        "createdAt": "2023-08-15T12:30:00.000Z",
        "sender": {
          "id": 2,
          "username": "xiaohong",
          "avatar": "https://example.com/avatar2.jpg"
        }
      },
      {
        "id": 9,
        "conversationId": 1,
        "senderId": 1,
        "content": "我很好，谢谢！",
        "type": "text",
        "status": "delivered",
        "createdAt": "2023-08-15T12:32:00.000Z",
        "sender": {
          "id": 1,
          "username": "xiaoming",
          "avatar": "https://example.com/avatar1.jpg"
        }
      },
      {
        "id": 10,
        "conversationId": 1,
        "senderId": 1,
        "content": "你最近在忙什么？",
        "type": "text",
        "status": "delivered",
        "createdAt": "2023-08-15T12:34:56.789Z",
        "sender": {
          "id": 1,
          "username": "xiaoming",
          "avatar": "https://example.com/avatar1.jpg"
        }
      }
    ],
    "totalCount": 10
  }
}
```

**响应类型**:
```typescript
interface MessagesResponse {
  messages: MessageSchema[];
  totalCount: number;
}

type GetMessagesSuccessResponse = SuccessResponse<MessagesResponse>;
```

## 5.4 创建新会话

创建一个新的聊天会话。

- **URL**: `/chat/conversations`
- **方法**: `POST`
- **权限**: 需要认证
- **请求体**:

```typescript
interface CreateConversationInput {
  participantIds: number[]; // 参与者用户ID列表，至少需要一个用户ID
  type: "direct" | "group"; // 会话类型，默认为"direct"
  initialMessage?: string; // 可选，创建会话时发送的第一条消息
}
```

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "创建会话成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "conversation": {
      "id": 2,
      "type": "direct",
      "lastMessageAt": "2023-08-15T12:34:56.789Z",
      "createdAt": "2023-08-15T12:34:56.789Z",
      "participants": [
        {
          "userId": 1,
          "user": {
            "id": 1,
            "username": "xiaoming",
            "avatar": "https://example.com/avatar1.jpg",
            "status": "online"
          },
          "lastReadAt": "2023-08-15T12:34:56.789Z"
        },
        {
          "userId": 3,
          "user": {
            "id": 3,
            "username": "xiaolan",
            "avatar": "https://example.com/avatar3.jpg",
            "status": "online"
          },
          "lastReadAt": "2023-08-15T12:34:56.789Z"
        }
      ],
      "latestMessage": {
        "id": 11,
        "conversationId": 2,
        "senderId": 1,
        "content": "你好，很高兴认识你！",
        "type": "text",
        "status": "sent",
        "createdAt": "2023-08-15T12:34:56.789Z",
        "sender": {
          "id": 1,
          "username": "xiaoming",
          "avatar": "https://example.com/avatar1.jpg"
        }
      }
    }
  }
}
```

**响应类型**:
```typescript
// 与获取会话详情相同
type CreateConversationSuccessResponse = GetConversationSuccessResponse;
```

## 5.5 标记消息为已读

标记会话中的消息为已读状态。

- **URL**: `/chat/messages/read`
- **方法**: `POST`
- **权限**: 需要认证
- **请求体**:

```typescript
interface MarkMessagesAsReadInput {
  conversationId: number; // 会话ID
  messageIds?: number[]; // 可选，需要标记为已读的消息ID列表，如果不提供则更新整个会话的阅读状态
}
```

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "消息已标记为已读",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "updatedAt": "2023-08-15T12:34:56.789Z"
  }
}
```

**响应类型**:
```typescript
interface MarkAsReadResponse {
  updatedAt: string;
}

type MarkMessagesAsReadSuccessResponse = SuccessResponse<MarkAsReadResponse>;
``` 