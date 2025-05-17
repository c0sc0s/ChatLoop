# 好友模块 API (Friends)

好友模块提供好友关系管理功能，包括获取好友列表、发送好友请求、接受或拒绝好友请求和删除好友等。

## 3.1 获取好友列表

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

## 3.2 获取好友请求列表

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

## 3.3 发送好友请求

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

## 3.4 接受好友请求

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

## 3.5 拒绝好友请求

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

## 3.6 删除好友

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