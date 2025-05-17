# ChatLoop API 基础文档

本文档描述了 ChatLoop 应用 API 的基础信息，包括基础 URL、认证方式、响应格式和错误码等。

## 基础信息

- **基础 URL**: `/api/v1`
- **认证方式**: 大部分 API 需要 JWT 令牌认证，在请求头中添加 `Authorization: Bearer <token>`
- **响应格式**: 所有 API 返回统一的 JSON 格式，包含 `success`、`message`、`timestamp`、`code` 等字段

## 统一响应格式

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

### 成功响应示例

```json
{
  "success": true,
  "message": "操作成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    // 操作返回的数据
  }
}
```

### 错误响应示例

```json
{
  "success": false,
  "message": "操作失败",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 400,
  "error": "请求参数错误"
}
```

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 400    | 请求参数错误，如参数格式不正确、参数缺失等 |
| 401    | 未认证或认证失败，需要有效的JWT令牌 |
| 403    | 权限不足，当前用户无权执行请求的操作 |
| 404    | 资源不存在，如用户ID、好友请求ID等无效 |
| 500    | 服务器内部错误，请稍后再试 |

## API文档分类

ChatLoop API 按照功能模块划分为以下几个部分：

1. [认证模块](./auth.md) - 用户注册、登录、登出等
2. [用户模块](./users.md) - 用户资料管理和搜索功能
3. [好友模块](./friends.md) - 好友关系管理
4. [健康检查模块](./health.md) - 系统运行状态检查
5. [聊天模块](./chat.md) - 会话和消息管理
6. [群组模块](./groups.md) - 群组管理和成员管理 