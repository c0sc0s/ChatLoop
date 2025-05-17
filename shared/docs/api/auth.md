# 认证模块 API (Authentication)

认证模块提供用户注册、登录、登出等功能。

## 1.1 用户注册

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

## 1.2 用户登录

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

## 1.3 用户登出

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

## 1.4 获取当前用户信息

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