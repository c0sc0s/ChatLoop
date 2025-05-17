# 群组模块 API (Groups)

群组模块提供创建和管理群组的功能，包括群组的创建、更新、解散和成员管理等操作。

## 6.1 创建群组

创建一个新的群组，同时自动创建对应的群聊会话。

- **URL**: `/groups`
- **方法**: `POST`
- **权限**: 需要认证
- **请求体**:

```typescript
interface CreateGroupInput {
  name: string; // 群组名称，1-50个字符
  description?: string; // 可选，群组描述，最多200个字符
  avatar?: string; // 可选，群组头像URL
  initialMemberIds?: number[]; // 可选，初始成员ID列表
}
```

**响应示例**:

成功 (201 Created)
```json
{
  "success": true,
  "message": "创建群组成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 201,
  "data": {
    "id": 1,
    "name": "技术交流群",
    "avatar": "https://example.com/group-avatar.jpg",
    "description": "这是一个技术交流群",
    "creatorId": 1,
    "createdAt": "2023-08-15T12:34:56.789Z",
    "conversationId": 5
  }
}
```

**响应类型**:
```typescript
interface CreateGroupResponse {
  id: number;
  name: string;
  avatar: string | null;
  description: string | null;
  creatorId: number;
  createdAt: string;
  conversationId: number;
}

type CreateGroupSuccessResponse = SuccessResponse<CreateGroupResponse>;
```

## 6.2 获取用户加入的群组列表

获取当前用户加入的所有群组。

- **URL**: `/groups`
- **方法**: `GET`
- **权限**: 需要认证
- **查询参数**:
  - `page`: 可选，页码，默认值为1
  - `limit`: 可选，每页数量，默认值为20

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "获取群组列表成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "groups": [
      {
        "id": 1,
        "name": "技术交流群",
        "avatar": "https://example.com/group-avatar.jpg",
        "description": "这是一个技术交流群",
        "memberCount": 8,
        "role": "owner",
        "lastMessageAt": "2023-08-15T12:34:56.789Z",
        "conversationId": 5
      },
      // 更多群组...
    ],
    "totalCount": 3
  }
}
```

**响应类型**:
```typescript
interface GroupListItem {
  id: number;
  name: string;
  avatar: string | null;
  description: string | null;
  memberCount: number;
  role: string; // "owner", "admin", or "member"
  lastMessageAt: string | null;
  conversationId: number;
}

interface GroupsListResponse {
  groups: GroupListItem[];
  totalCount: number;
}

type GetGroupsSuccessResponse = SuccessResponse<GroupsListResponse>;
```

## 6.3 获取群组详情

获取指定群组的详细信息。

- **URL**: `/groups/:groupId`
- **方法**: `GET`
- **参数**: 
  - `groupId`: 群组ID
- **权限**: 需要认证，且用户必须是群组成员

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "获取群组详情成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "id": 1,
    "name": "技术交流群",
    "avatar": "https://example.com/group-avatar.jpg",
    "description": "这是一个技术交流群",
    "creatorId": 1,
    "memberCount": 8,
    "createdAt": "2023-08-15T12:00:00.000Z",
    "conversationId": 5,
    "userRole": "owner"
  }
}
```

**响应类型**:
```typescript
interface GroupDetailResponse {
  id: number;
  name: string;
  avatar: string | null;
  description: string | null;
  creatorId: number;
  memberCount: number;
  createdAt: string;
  conversationId: number | null;
  userRole: string; // 当前用户在群组中的角色
}

type GetGroupDetailSuccessResponse = SuccessResponse<GroupDetailResponse>;
```

## 6.4 更新群组信息

更新指定群组的基本信息。

- **URL**: `/groups/:groupId`
- **方法**: `PATCH`
- **参数**: 
  - `groupId`: 群组ID
- **权限**: 需要认证，且用户必须是群组的所有者(owner)或管理员(admin)
- **请求体**:

```typescript
interface UpdateGroupInput {
  name?: string; // 可选，群组名称，1-50个字符
  description?: string; // 可选，群组描述，最多200个字符
  avatar?: string; // 可选，群组头像URL
}
```

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "更新群组信息成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "id": 1,
    "name": "技术交流群2.0",
    "avatar": "https://example.com/group-avatar-new.jpg",
    "description": "这是一个更新后的技术交流群",
    "updatedAt": "2023-08-15T12:34:56.789Z"
  }
}
```

**响应类型**:
```typescript
interface UpdateGroupResponse {
  id: number;
  name: string;
  avatar: string | null;
  description: string | null;
  updatedAt: string;
}

type UpdateGroupSuccessResponse = SuccessResponse<UpdateGroupResponse>;
```

## 6.5 解散群组

解散（删除）指定的群组。

- **URL**: `/groups/:groupId`
- **方法**: `DELETE`
- **参数**: 
  - `groupId`: 群组ID
- **权限**: 需要认证，且用户必须是群组的所有者(owner)

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "群组已成功解散",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "success": true,
    "message": "群组已成功解散"
  }
}
```

**响应类型**:
```typescript
interface DeleteGroupResponse {
  success: boolean;
  message: string;
}

type DeleteGroupSuccessResponse = SuccessResponse<DeleteGroupResponse>;
```

## 6.6 退出群组

当前用户退出指定群组。

- **URL**: `/groups/:groupId/leave`
- **方法**: `POST`
- **参数**: 
  - `groupId`: 群组ID
- **权限**: 需要认证，且用户必须是群组成员，但不能是群主

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "您已成功退出群组",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "success": true,
    "message": "您已成功退出群组"
  }
}
```

**响应类型**:
```typescript
interface LeaveGroupResponse {
  success: boolean;
  message: string;
}

type LeaveGroupSuccessResponse = SuccessResponse<LeaveGroupResponse>;
```

## 6.7 获取群组成员列表

获取指定群组的所有成员。

- **URL**: `/groups/:groupId/members`
- **方法**: `GET`
- **参数**: 
  - `groupId`: 群组ID
- **查询参数**:
  - `page`: 可选，页码，默认值为1
  - `limit`: 可选，每页数量，默认值为20
- **权限**: 需要认证，且用户必须是群组成员

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "获取群组成员列表成功",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "members": [
      {
        "id": 1,
        "username": "xiaoming",
        "avatar": "https://example.com/avatar1.jpg",
        "role": "owner",
        "joinedAt": "2023-08-15T12:00:00.000Z"
      },
      {
        "id": 2,
        "username": "xiaohong",
        "avatar": "https://example.com/avatar2.jpg",
        "role": "admin",
        "joinedAt": "2023-08-15T12:05:00.000Z"
      },
      // 更多成员...
    ],
    "totalCount": 8
  }
}
```

**响应类型**:
```typescript
interface GroupMemberItem {
  id: number;
  username: string;
  avatar: string | null;
  role: string; // "owner", "admin", or "member"
  joinedAt: string;
}

interface GroupMembersResponse {
  members: GroupMemberItem[];
  totalCount: number;
}

type GetGroupMembersSuccessResponse = SuccessResponse<GroupMembersResponse>;
```

## 6.8 添加群组成员

向指定群组添加新成员。

- **URL**: `/groups/:groupId/members`
- **方法**: `POST`
- **参数**: 
  - `groupId`: 群组ID
- **权限**: 需要认证，且用户必须是群组的所有者(owner)或管理员(admin)
- **请求体**:

```typescript
interface AddMembersInput {
  memberIds: number[]; // 要添加的成员ID列表
}
```

**响应示例**:

成功 (201 Created)
```json
{
  "success": true,
  "message": "成功添加3名成员到群组",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 201,
  "data": {
    "success": true,
    "message": "成功添加3名成员到群组",
    "addedMemberIds": [3, 4, 5]
  }
}
```

**响应类型**:
```typescript
interface AddMembersResponse {
  success: boolean;
  message: string;
  addedMemberIds: number[];
}

type AddMembersSuccessResponse = SuccessResponse<AddMembersResponse>;
```

## 6.9 移除群组成员

从指定群组中移除成员。

- **URL**: `/groups/:groupId/members/:memberId`
- **方法**: `DELETE`
- **参数**: 
  - `groupId`: 群组ID
  - `memberId`: 要移除的成员ID
- **权限**: 需要认证，且满足以下条件之一：
  - 用户是群组所有者(owner)
  - 用户是管理员(admin)且要移除的成员是普通成员(member)
  - 用户移除自己（退出群组）

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "已成功移除群组成员",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "success": true,
    "message": "已成功移除群组成员"
  }
}
```

**响应类型**:
```typescript
interface RemoveMemberResponse {
  success: boolean;
  message: string;
}

type RemoveMemberSuccessResponse = SuccessResponse<RemoveMemberResponse>;
```

## 6.10 更新群组成员角色

更新指定群组成员的角色。

- **URL**: `/groups/:groupId/members/:memberId/role`
- **方法**: `PATCH`
- **参数**: 
  - `groupId`: 群组ID
  - `memberId`: 成员ID
- **权限**: 需要认证，且用户必须是群组的所有者(owner)
- **请求体**:

```typescript
interface UpdateMemberRoleInput {
  role: "admin" | "member"; // 新角色，不能设置为"owner"
}
```

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "已将用户 xiaohong 的角色更新为 admin",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "success": true,
    "message": "已将用户 xiaohong 的角色更新为 admin",
    "member": {
      "id": 2,
      "role": "admin",
      "username": "xiaohong"
    }
  }
}
```

**响应类型**:
```typescript
interface UpdateMemberRoleResponse {
  success: boolean;
  message: string;
  member: {
    id: number;
    role: string;
    username: string;
  };
}

type UpdateMemberRoleSuccessResponse = SuccessResponse<UpdateMemberRoleResponse>;
```

## 6.11 转让群主

将群组所有权转让给另一个成员。

- **URL**: `/groups/:groupId/transfer-ownership/:memberId`
- **方法**: `PATCH`
- **参数**: 
  - `groupId`: 群组ID
  - `memberId`: 新群主的用户ID
- **权限**: 需要认证，且用户必须是群组的所有者(owner)

**响应示例**:

成功 (200 OK)
```json
{
  "success": true,
  "message": "已成功将群主转让给 xiaolan",
  "timestamp": "2023-08-15T12:34:56.789Z",
  "code": 200,
  "data": {
    "success": true,
    "message": "已成功将群主转让给 xiaolan",
    "newOwner": {
      "id": 3,
      "username": "xiaolan"
    }
  }
}
```

**响应类型**:
```typescript
interface TransferOwnershipResponse {
  success: boolean;
  message: string;
  newOwner: {
    id: number;
    username: string;
  };
}

type TransferOwnershipSuccessResponse = SuccessResponse<TransferOwnershipResponse>;
``` 