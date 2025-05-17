# 用户模块 API (Users)

用户模块提供用户资料管理和搜索功能。

## 2.1 获取当前用户信息

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

## 2.2 获取所有用户

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

## 2.3 搜索用户

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

## 2.4 获取指定用户信息

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