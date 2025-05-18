import Request from "./client";

// 定义接口类型
export interface IceServersResponse {
  iceServers: {
    urls: string | string[];
    username?: string;
    credential?: string;
  }[];
}

/**
 * 获取STUN/TURN服务器配置
 * @returns STUN/TURN服务器配置信息
 */
export const getIceServers = async (): Promise<IceServersResponse> => {
  return await Request.get(`/rtc/ice-servers`);
};
