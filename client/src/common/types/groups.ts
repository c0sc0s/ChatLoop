// 创建群组的输入参数
export interface CreateGroupInput {
  name: string;
  description?: string;
  avatar?: string;
  initialMemberIds?: number[];
}

// 更新群组的输入参数
export interface UpdateGroupInput {
  name?: string;
  description?: string;
  avatar?: string;
}

// 添加成员的输入参数
export interface AddMembersInput {
  memberIds: number[];
}

// 更新成员角色的输入参数
export interface UpdateMemberRoleInput {
  role: "admin" | "member";
}

// 群组列表项
export interface GroupListItem {
  id: number;
  name: string;
  avatar: string | null;
  description: string | null;
  memberCount: number;
  role: string; // "owner", "admin", or "member"
  lastMessageAt: string | null;
  conversationId: number;
}

// 群组列表响应
export interface GroupsListResponse {
  groups: GroupListItem[];
  totalCount: number;
}

// 群组详情响应
export interface GroupDetailResponse {
  id: number;
  name: string;
  avatar: string | null;
  description: string | null;
  creatorId: number;
  memberCount: number;
  createdAt: string;
  conversationId: number | null;
  userRole: string;
}

// 群组成员项
export interface GroupMemberItem {
  id: number;
  username: string;
  avatar: string | null;
  role: string;
  joinedAt: string;
}

// 群组成员列表响应
export interface GroupMembersResponse {
  members: GroupMemberItem[];
  totalCount: number;
}

// 添加成员响应
export interface AddMembersResponse {
  success: boolean;
  message: string;
  addedMemberIds: number[];
}

// 删除成员响应
export interface RemoveMemberResponse {
  success: boolean;
  message: string;
}

// 更新成员角色响应
export interface UpdateMemberRoleResponse {
  success: boolean;
  message: string;
  member: {
    id: number;
    role: string;
    username: string;
  };
}

// 转让群主响应
export interface TransferOwnershipResponse {
  success: boolean;
  message: string;
  newOwner: {
    id: number;
    username: string;
  };
} 