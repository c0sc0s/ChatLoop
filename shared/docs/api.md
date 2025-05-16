# ChatLoop API 文档

本文档详细描述了 ChatLoop 应用的 API 接口。API 按业务模块进行划分，每个模块包含相关的接口描述、请求参数、响应格式以及 TypeScript 类型定义。

## 基础信息

- **基础 URL**: `/api/v1`
- **认证方式**: 大部分 API 需要 JWT 令牌认证，在请求头中添加 `Authorization: Bearer <token>`
- **响应格式**: 所有 API 返回统一的 JSON 格式，包含 `success`、`message`、`timestamp`、`code` 等字段

### 统一响应格式

```typescript
// 基础响应格式
interface BaseResponse {
  success: boolean;
  message: string;
  timestamp: string;
  code: number;
}

// 成功响应
interface SuccessResponse<T = any> extends BaseResponse {
  success: true;
  data?: T;
}

// 错误响应
interface ErrorResponse extends BaseResponse {
  success: false;
  error: string;
}

// API 响应类型
type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;
```

## 1. 认证模块 (Authentication)

认证模块提供用户注册、登录、登出等功能。

### 1.1 用户注册

创建新用户账号。

- **URL**: `/auth/register`
- **方法**: `POST`
- **权限**: 无需认证
- **请求体**:

```typescript
interface RegisterInput {
  username: string; // 用户名，至少3个字符
  email: string; // 电子邮件，需要有效格式
  password: string; // 密码，至少6个字符
  phone?: string; // 可选，手机号码
  firstName?: string; // 可选，名
  lastName?: string; // 可选，姓
  avatar?: string; // 可选，头像URL
}
```

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "注册成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "user": {
      "id": 1,
      "username": "xiaoming",
      "email": "xiaoming@example.com",
      "avatar": "https://api.dicebear.com/6.x/avataaars/svg?seed=xiaoming",
      "status": "online"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

失败 (400 Bad Request)
```json
{
  "success": false,
  "message": "邮箱已被注册",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 400,
  "error": "参数错误"
}
```

**响应类型**:
```typescript
interface AuthDataSchema {
  user: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    status?: string;
  };
  token: string;
}

type AuthSuccessResponse = SuccessResponse<AuthDataSchema>;
```

### 1.2 用户登录

验证用户凭据并返回JWT令牌。

- **URL**: `/auth/login`
- **方法**: `POST`
- **权限**: 无需认证
- **请求体**:

```typescript
interface LoginInput {
  email: string; // 电子邮件
  password: string; // 密码，至少6个字符
}
```

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "登录成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "user": {
      "id": 1,
      "username": "xiaoming",
      "email": "xiaoming@example.com",
      "avatar": "https://api.dicebear.com/6.x/avataaars/svg?seed=xiaoming",
      "status": "online"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

失败 (401 Unauthorized)
```json
{
  "success": false,
  "message": "不存在该用户",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 401,
  "error": "认证失败"
}
```

**响应类型**:
```typescript
// 与注册接口相同
type AuthSuccessResponse = SuccessResponse<AuthDataSchema>;
```

### 1.3 用户登出

注销当前登录的用户会话。

- **URL**: `/auth/logout`
- **方法**: `POST`
- **权限**: 需要认证
- **请求体**: 无

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "已成功退出登录",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": null
}
```

失败 (401 Unauthorized)
```json
{
  "success": false,
  "message": "未授权",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 401,
  "error": "需要登录"
}
```

**响应类型**:
```typescript
type LogoutSuccessResponse = SuccessResponse<null>;
```

### 1.4 获取当前用户信息

获取当前登录用户的详细信息。

- **URL**: `/auth/me`
- **方法**: `GET`
- **权限**: 需要认证

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "获取用户信息成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "user": {
      "id": 1,
      "username": "xiaoming",
      "email": "xiaoming@example.com",
      "avatar": "https://api.dicebear.com/6.x/avataaars/svg?seed=xiaoming",
      "status": "online"
    }
  }
}
```

失败 (401 Unauthorized)
```json
{
  "success": false,
  "message": "未授权",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 401,
  "error": "需要登录"
}
```

**响应类型**:
```typescript
interface UserDataSchema {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  status?: string;
}

type GetMeSuccessResponse = SuccessResponse<{ user: UserDataSchema }>;
```

## 2. 用户模块 (Users)

用户模块提供用户资料管理和搜索功能。

### 2.1 获取当前用户信息

获取当前登录用户的详细信息。

- **URL**: `/users/me`
- **方法**: `GET`
- **权限**: 需要认证

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "获取用户信息成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "id": 1,
    "username": "xiaoming",
    "email": "xiaoming@example.com",
    "phone": "13800138000",
    "avatar": "https://example.com/avatars/xiaoming.jpg",
    "bio": "这是我的个人简介",
    "status": "online",
    "lastActiveAt": "2023-08-15T12:34:56.789Z",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-08-15T12:34:56.789Z"
  }
}
```

**响应类型**:
```typescript
interface UserDetailSchema {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  status: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

type GetCurrentUserResponse = SuccessResponse<UserDetailSchema>;
```

### 2.2 获取所有用户

获取系统中的所有用户列表，通常用于管理员功能。

- **URL**: `/users/all`
- **方法**: `GET`
- **权限**: 需要认证

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "获取用户列表成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "xiaoming",
        "email": "xiaoming@example.com",
        "avatar": "https://example.com/avatars/xiaoming.jpg",
        "status": "online",
        "createdAt": "2023-01-01T00:00:00.000Z"
      },
      // 更多用户...
    ],
    "total": 50
  }
}
```

**响应类型**:
```typescript
interface UserBasicSchema {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  status: string;
  createdAt: string;
}

interface UsersListResponse {
  users: UserBasicSchema[];
  total: number;
}

type GetAllUsersResponse = SuccessResponse<UsersListResponse>;
```

### 2.3 搜索用户

通过关键字搜索系统中的用户，可基于用户名或邮箱搜索。这是添加好友的前置步骤。

- **URL**: `/users/search`
- **方法**: `GET`
- **权限**: 需要认证
- **查询参数**:
  - `keyword`: 必填，搜索关键词
  - `page`: 可选，页码，默认值为1
  - `limit`: 可选，每页数量，默认值为10

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "搜索用户成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "users": [
      {
        "id": 2,
        "username": "xiaohong",
        "avatar": "https://example.com/avatars/xiaohong.jpg",
        "status": "away"
      },
      // 更多用户...
    ],
    "total": 5,
    "page": 1,
    "limit": 10,
    "hasMore": false
  }
}
```

**响应类型**:
```typescript
interface SearchUserItem {
  id: number;
  username: string;
  avatar?: string;
  status: string;
}

interface SearchUsersResponse {
  users: SearchUserItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

type SearchUsersSuccessResponse = SuccessResponse<SearchUsersResponse>;
```

### 2.4 获取指定用户信息

通过用户ID获取指定用户的详细信息。

- **URL**: `/users/:id`
- **方法**: `GET`
- **参数**: 
  - `id`: 用户ID
- **权限**: 需要认证

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "获取用户信息成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "id": 2,
    "username": "xiaohong",
    "email": "xiaohong@example.com",
    "avatar": "https://example.com/avatars/xiaohong.jpg",
    "bio": "我是小红",
    "status": "away",
    "lastActiveAt": "2023-08-15T10:30:00.000Z",
    "createdAt": "2023-01-02T00:00:00.000Z"
  }
}
```

**响应类型**:
```typescript
// 与获取当前用户信息类似
type GetUserByIdResponse = SuccessResponse<UserDetailSchema>;
```

## 3. 好友模块 (Friends)

好友模块提供好友关系管理功能，包括获取好友列表、发送好友请求、接受或拒绝好友请求和删除好友等。

### 3.1 获取好友列表

获取当前用户的所有好友。

- **URL**: `/friends`
- **方法**: `GET`
- **权限**: 需要认证

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "获取好友列表成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "friends": [
      {
        "id": 2,
        "username": "用户名",
        "avatar": "头像URL",
        "status": "online",
        "lastActiveAt": "2023-08-15T12:34:56.789Z"
      },
      // 更多好友...
    ],
    "total": 1
  }
}
```

**响应类型**:
```typescript
interface FriendItem {
  id: number;
  username: string;
  avatar: string | null;
  status: string;
  lastActiveAt: string | null;
}

interface FriendsListResponse {
  friends: FriendItem[];
  total: number;
}

type GetFriendsResponse = SuccessResponse<FriendsListResponse>;
```

### 3.2 获取好友请求列表

获取发送给当前用户的待处理好友请求。

- **URL**: `/friends/requests`
- **方法**: `GET`
- **权限**: 需要认证

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "获取好友请求列表成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "requests": [
      {
        "id": 1,
        "initiatorId": 3,
        "receiverId": 1,
        "status": "pending",
        "createdAt": "2023-08-10T14:20:00.000Z",
        "updatedAt": "2023-08-10T14:20:00.000Z",
        "user": {
          "id": 3,
          "username": "请求发送者",
          "avatar": "头像URL",
          "status": "offline"
        }
      },
      // 更多请求...
    ],
    "total": 3
  }
}
```

**响应类型**:
```typescript
interface FriendRequestUser {
  id: number;
  username: string;
  avatar: string | null;
  status: string;
}

interface FriendRequestItem {
  id: number;
  initiatorId: number;
  receiverId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: FriendRequestUser;
}

interface FriendRequestsResponse {
  requests: FriendRequestItem[];
  total: number;
}

type GetFriendRequestsResponse = SuccessResponse<FriendRequestsResponse>;
```

### 3.3 发送好友请求

向指定用户发送好友请求。

- **URL**: `/friends/request`
- **方法**: `POST`
- **权限**: 需要认证
- **请求体**:
  
```typescript
interface FriendRequestInput {
  targetUserId: number; // 目标用户ID
}
```

**响应示例**:

成功 (201 Created)
```json
{
  "success": true,
  "message": "好友请求已发送",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 201,
  "data": {
    "requestId": 5
  }
}
```

**响应类型**:
```typescript
interface FriendRequestCreateResponse {
  requestId: number;
}

type SendFriendRequestResponse = SuccessResponse<FriendRequestCreateResponse>;
```

### 3.4 接受好友请求

接受一个好友请求。

- **URL**: `/friends/accept`
- **方法**: `POST`
- **权限**: 需要认证
- **请求体**:

```typescript
interface FriendActionInput {
  requestId: number; // 请求ID
}
```

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "已接受好友请求",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": null
}
```

**响应类型**:
```typescript
type FriendActionResponse = SuccessResponse<null>;
```

### 3.5 拒绝好友请求

拒绝一个好友请求。

- **URL**: `/friends/reject`
- **方法**: `POST`
- **权限**: 需要认证
- **请求体**:

```typescript
// 与接受好友请求相同
interface FriendActionInput {
  requestId: number; // 请求ID
}
```

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "已拒绝好友请求",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": null
}
```

**响应类型**:
```typescript
// 与接受好友请求相同
type FriendActionResponse = SuccessResponse<null>;
```

### 3.6 删除好友

删除一个现有的好友关系。

- **URL**: `/friends/:friendId`
- **方法**: `DELETE`
- **参数**: 
  - `friendId`: 要删除的好友的用户ID
- **权限**: 需要认证

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "好友已删除",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": null
}
```

**响应类型**:
```typescript
// 与好友请求操作相同
type DeleteFriendResponse = SuccessResponse<null>;
```

## 4. 健康检查模块 (Health Check)

健康检查模块用于监控系统运行状态。

### 4.1 健康检查

检查API服务的运行状态。

- **URL**: `/health`
- **方法**: `GET`
- **权限**: 无需认证

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "success",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "status": "ok",
    "timestamp": "2023-08-15T12:34:56.789Z"
  }
}
```

**响应类型**:
```typescript
interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

type HealthCheckSuccessResponse = SuccessResponse<HealthCheckResponse>;
```

## 5. 聊天模块 (Chat)

聊天模块提供会话和消息相关的API，用于管理用户之间的实时通讯。

### 5.1 获取会话列表

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

### 5.2 获取会话详情

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

### 5.3 获取会话消息

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

### 5.4 创建新会话

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

### 5.5 标记消息为已读

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

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 400    | 请求参数错误，如参数格式不正确、参数缺失等 |
| 401    | 未认证或认证失败，需要有效的JWT令牌 |
| 403    | 权限不足，当前用户无权执行请求的操作 |
| 404    | 资源不存在，如用户ID、好友请求ID等无效 |
| 500    | 服务器内部错误，请稍后再试 |
