import Request from "./client";

/**
 * 创建一个新的群组
 * @param data 创建群组参数，包括名称、描述、头像和初始成员
 * @returns 创建的群组详情
 */
export const createGroup = async (data: {
  name: string;
  description?: string;
  avatar?: string;
  initialMemberIds?: number[];
}) => {
  return await Request.post(`/groups`, data);
};

/**
 * 获取用户加入的所有群组
 * @param page 页码，默认为1
 * @param limit 每页数量，默认为20
 * @returns 群组列表和总数
 */
export const getUserGroups = async (page = 1, limit = 20) => {
  return await Request.get(`/groups`, { params: { page, limit } });
};

/**
 * 获取指定群组的详细信息
 * @param groupId 群组ID
 * @returns 群组详情
 */
export const getGroupDetail = async (groupId: number) => {
  return await Request.get(`/groups/${groupId}`);
};

/**
 * 更新群组信息
 * @param groupId 群组ID
 * @param data 更新数据，包括名称、描述、头像
 */
export const updateGroup = async (groupId: number, data: {
  name?: string;
  description?: string;
  avatar?: string;
}) => {
  return await Request.patch(`/groups/${groupId}`, data);
};

/**
 * 解散群组
 * @param groupId 群组ID
 */
export const deleteGroup = async (groupId: number) => {
  return await Request.delete(`/groups/${groupId}`);
};

/**
 * 退出群组
 * @param groupId 群组ID
 */
export const leaveGroup = async (groupId: number) => {
  return await Request.post(`/groups/${groupId}/leave`);
};

/**
 * 获取群组成员列表
 * @param groupId 群组ID
 * @param page 页码，默认为1
 * @param limit 每页数量，默认为20
 * @returns 成员列表和总数
 */
export const getGroupMembers = async (groupId: number, page = 1, limit = 20) => {
  return await Request.get(`/groups/${groupId}/members`, {
    params: { page, limit },
  });
};

/**
 * 添加群组成员
 * @param groupId 群组ID
 * @param memberIds 成员ID列表
 */
export const addGroupMembers = async (groupId: number, memberIds: number[]) => {
  return await Request.post(`/groups/${groupId}/members`, { memberIds });
};

/**
 * 移除群组成员
 * @param groupId 群组ID
 * @param memberId 成员ID
 */
export const removeGroupMember = async (groupId: number, memberId: number) => {
  return await Request.delete(`/groups/${groupId}/members/${memberId}`);
};

/**
 * 更新群组成员角色
 * @param groupId 群组ID
 * @param memberId 成员ID
 * @param role 新角色
 */
export const updateMemberRole = async (
  groupId: number,
  memberId: number,
  role: "admin" | "member"
) => {
  return await Request.patch(`/groups/${groupId}/members/${memberId}/role`, { role });
};

/**
 * 转让群主
 * @param groupId 群组ID
 * @param memberId 新群主ID
 */
export const transferOwnership = async (groupId: number, memberId: number) => {
  return await Request.patch(`/groups/${groupId}/transfer-ownership/${memberId}`);
}; 