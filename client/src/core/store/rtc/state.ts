export enum CallStatus {
  IDLE = "idle",             // 空闲状态
  INCOMING = "incoming",     // 来电状态
  OUTGOING = "outgoing",     // 呼出状态
  CONNECTING = "connecting", // 正在连接
  CONNECTED = "connected",   // 已连接
  ENDED = "ended"            // 已结束
}

export enum CallType {
  VIDEO = "video",
  AUDIO = "audio"
}

export interface RtcState {
  // 通话基础信息
  callId: string | null;     // 当前通话ID
  status: CallStatus;        // 当前通话状态
  callType: CallType;        // 通话类型(音频/视频)
  error: string | null;      // 错误信息

  // 对方信息
  remoteUserId: string | null;   // 对方用户ID
  remoteUser: {              // 对方用户信息
    id: number | null;
    username: string | null;
    avatar: string | null;
  };

  // 通话时间
  startTime: number | null;  // 通话开始时间
  duration: number;          // 通话持续时间(秒)

  // 媒体流
  localStream: MediaStream | null;    // 本地媒体流
  remoteStream: MediaStream | null;   // 远程媒体流

  // 设备控制
  isLocalVideoEnabled: boolean;  // 本地视频是否启用
  isLocalAudioEnabled: boolean;  // 本地音频是否启用

  // UI控制
  showIncomingCall: boolean;     // 是否显示来电弹窗
  showOutgoingCall: boolean;     // 是否显示呼出弹窗
  showCallInProgress: boolean;   // 是否显示通话中界面
}

const defaultRtcState: RtcState = {
  callId: null,
  status: CallStatus.IDLE,
  callType: CallType.VIDEO,
  error: null,

  remoteUserId: null,
  remoteUser: {
    id: null,
    username: null,
    avatar: null
  },

  startTime: null,
  duration: 0,

  localStream: null,
  remoteStream: null,

  isLocalVideoEnabled: true,
  isLocalAudioEnabled: true,

  showIncomingCall: false,
  showOutgoingCall: false,
  showCallInProgress: false
};

export default defaultRtcState;