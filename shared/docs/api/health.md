# 健康检查模块 API (Health Check)

健康检查模块用于监控系统运行状态。

## 4.1 健康检查

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