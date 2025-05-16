# 点击"发送消息"按钮创建聊天窗口流程

## 流程概述

当用户在好友列表页面点击"发送消息"按钮后，前端需要执行以下步骤：
1. 创建/获取会话
2. 跳转到聊天界面
3. 加载聊天界面所需数据

## 详细流程

### 1. 创建/获取会话

**接口调用**:
- **接口**: `POST /chat/conversations`
- **参数**:
  ```json
  {
    "participantIds": [好友ID],
    "type": "direct"
  }
  ```
- **返回**:
  ```json
  {
    "success": true,
    "data": {
      "conversation": {
        "id": "会话ID",
        "type": "direct",
        "participants": [...],
        "latestMessage": {...}
      }
    }
  }
  ```

**说明**:
- 后端会检查是否已存在这两个用户之间的会话
- 如果存在，返回已有会话
- 如果不存在，创建新会话并返回
- 这个接口是幂等的，多次请求相同参数会返回相同结果

### 2. 前端路由跳转

根据返回的会话ID进行路由跳转:
```javascript
// 示例代码
navigate(`/chat/${conversationId}`);
```

这会将用户从好友列表页面带到聊天界面。根据项目架构的不同，可以使用:
- React Router的navigate
- Vue Router的router.push
- 原生的window.location.href

### 3. 加载聊天界面数据

聊天界面初始化时需要执行以下操作:

**a. 获取会话详情**
- **接口**: `GET /chat/conversations/{conversationId}`
- **参数**: 路径参数 conversationId
- **返回**:
  ```json
  {
    "success": true,
    "data": {
      "conversation": {
        "id": "会话ID",
        "participants": [
          {
            "userId": 1,
            "user": {
              "id": 1,
              "username": "当前用户",
              "avatar": "头像URL"
            }
          },
          {
            "userId": 2,
            "user": {
              "id": 2,
              "username": "对方用户",
              "avatar": "头像URL" 
            }
          }
        ],
        "type": "direct",
        "createdAt": "2023-01-01T00:00:00Z",
        "lastMessageAt": "2023-01-01T00:00:00Z"
      }
    }
  }
  ```

**b. 获取历史消息**
- **接口**: `GET /chat/conversations/{conversationId}/messages`
- **参数**: 
  - 路径参数: conversationId
  - 查询参数: ?page=1&limit=20
- **返回**:
  ```json
  {
    "success": true,
    "data": {
      "messages": [
        {
          "id": 1,
          "conversationId": "会话ID",
          "senderId": 1,
          "content": "消息内容",
          "type": "text",
          "status": "sent",
          "createdAt": "2023-01-01T00:00:00Z",
          "sender": {
            "id": 1,
            "username": "发送者名称",
            "avatar": "头像URL"
          }
        }
        // 更多消息...
      ],
      "totalCount": 10
    }
  }
  ```

### 4. 渲染聊天界面

收到数据后，前端应该:

1. 使用会话详情渲染聊天窗口标题栏(显示对方用户名和头像)
2. 渲染历史消息列表
3. 显示消息输入区域
4. 设置页面标题或通知图标
5. 根据需要更新未读消息状态

## 前端优化建议

### 1. 懒加载和骨架屏

- 在API请求过程中显示骨架屏或加载动画
- 可以先跳转到聊天界面，然后异步加载数据

### 2. 缓存策略

- 缓存会话数据，减少重复请求
- 可能的实现:
  ```javascript
  // 示例代码
  const cachedConversation = localStorage.getItem(`conversation_${conversationId}`);
  if (cachedConversation) {
    // 先使用缓存数据渲染
    renderConversation(JSON.parse(cachedConversation));
  }
  // 然后异步请求最新数据
  fetchConversation(conversationId).then(data => {
    // 更新缓存和UI
    localStorage.setItem(`conversation_${conversationId}`, JSON.stringify(data));
    renderConversation(data);
  });
  ```

### 3. 错误处理

- 处理会话创建失败的情况
- 可能的错误:
  - 网络错误
  - 没有权限添加该用户为好友
  - 用户不存在
  - 服务器内部错误
