import useRtcStore from "./index";
import { CallStatus, CallType } from "./state";
import rtcWsEmitter from "@/core/ws/emitters/rtc";
import { getIceServers, type IceServersResponse } from "@/api/rtc";
// 导入 gum 服务
import gum from "@/core/gum/gum";

class RtcService {
  private peerConnection: RTCPeerConnection | null = null;
  private durationTimer: number | null = null;

  // 重置所有状态和连接
  public resetCall = () => {
    const store = useRtcStore.getState();

    // 清理定时器
    if (this.durationTimer) {
      window.clearInterval(this.durationTimer);
      this.durationTimer = null;
    }

    // 关闭媒体流 - 使用 gum 服务释放资源
    gum.stopAllStreams();

    // 关闭WebRTC连接
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // 重置状态
    store.reset();
  };

  // 发起通话
  public startCall = async (userId: string, callType = CallType.VIDEO) => {
    try {
      const store = useRtcStore.getState();

      // 如果已经在通话中，返回
      if (store.status !== CallStatus.IDLE) {
        console.warn("已经在通话中，无法发起新通话");
        return;
      }

      // 更新状态为呼出
      store.setCallStatus(CallStatus.OUTGOING);
      store.setCallType(callType);
      store.setRemoteUserId(userId);
      store.setShowOutgoingCall(true);

      // 获取本地媒体流 - 使用 gum 服务
      let localStream;
      if (callType === CallType.VIDEO) {
        // 视频通话获取音视频
        localStream = await gum.getUserMedia();
      } else {
        // 语音通话只获取音频
        localStream = await gum.getAudioStream();
      }

      store.setLocalStream(localStream);
      store.setLocalVideoEnabled(callType === CallType.VIDEO);
      store.setLocalAudioEnabled(true);

      // 获取ICE服务器配置
      const iceServersResponse = await getIceServers();

      // 创建RTCPeerConnection
      this.peerConnection = new RTCPeerConnection({
        iceServers: iceServersResponse.iceServers
      });

      // 添加本地媒体轨道到连接
      localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, localStream);
      });

      // 处理ICE候选
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && store.callId) {
          rtcWsEmitter.sendIceCandidate(
            store.callId!,
            store.remoteUserId!,
            event.candidate
          );
        }
      };

      // 处理远程媒体流
      this.peerConnection.ontrack = (event) => {
        store.setRemoteStream(event.streams[0]);
      };

      // 创建SDP提议
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      // 确保localDescription已设置
      if (this.peerConnection.localDescription) {
        // 发送提议到服务器 - 需要将RTCSessionDescriptionInit转换为RTCSessionDescription
        rtcWsEmitter.sendCallOffer(
          userId,
          new RTCSessionDescription(this.peerConnection.localDescription),
          callType
        );
      } else {
        throw new Error("创建本地描述失败");
      }

    } catch (error) {
      console.error("发起通话失败", error);
      const store = useRtcStore.getState();
      store.setCallStatus(CallStatus.ENDED);
      store.setError(`发起通话失败: ${(error as Error).message}`);
      store.setShowOutgoingCall(false);

      // 清理资源
      gum.stopAllStreams();

      // 5秒后重置状态
      setTimeout(() => this.resetCall(), 5000);
    }
  };

  // 接受来电
  public acceptCall = async () => {
    try {
      const store = useRtcStore.getState();
      const { callId, remoteUserId, callType } = store;

      if (!callId || !remoteUserId) {
        throw new Error("无效的来电信息");
      }

      // 更新状态为连接中
      store.setCallStatus(CallStatus.CONNECTING);
      store.setShowIncomingCall(false);
      store.setShowCallInProgress(true);

      // 获取本地媒体流 - 使用 gum 服务
      let localStream;
      if (callType === CallType.VIDEO) {
        // 视频通话获取音视频
        localStream = await gum.getUserMedia();
      } else {
        // 语音通话只获取音频
        localStream = await gum.getAudioStream();
      }

      store.setLocalStream(localStream);
      store.setLocalVideoEnabled(callType === CallType.VIDEO);
      store.setLocalAudioEnabled(true);

      // 确保peerConnection已创建
      if (this.peerConnection) {
        // 添加本地媒体轨道到连接
        localStream.getTracks().forEach(track => {
          this.peerConnection!.addTrack(track, localStream);
        });

        // 创建SDP应答
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // 确保localDescription已设置
        if (this.peerConnection.localDescription) {
          // 发送应答到服务器
          rtcWsEmitter.sendCallAnswer(
            callId,
            remoteUserId,
            new RTCSessionDescription(this.peerConnection.localDescription)
          );

          // 更新状态为已连接
          store.setCallStatus(CallStatus.CONNECTED);
          store.setStartTime(Date.now());

          // 启动通话计时器
          this.startDurationTimer();
        } else {
          throw new Error("创建本地描述失败");
        }
      } else {
        throw new Error("PeerConnection未初始化");
      }

    } catch (error) {
      console.error("接受通话失败", error);
      const store = useRtcStore.getState();
      store.setCallStatus(CallStatus.ENDED);
      store.setError(`接受通话失败: ${(error as Error).message}`);
      store.setShowIncomingCall(false);
      store.setShowCallInProgress(false);

      // 清理资源
      gum.stopAllStreams();

      // 5秒后重置状态
      setTimeout(() => this.resetCall(), 5000);
    }
  };

  // 拒绝来电
  public rejectCall = (reason = "rejected") => {
    const store = useRtcStore.getState();
    const { callId, remoteUserId } = store;

    if (callId && remoteUserId) {
      rtcWsEmitter.rejectCall(callId, remoteUserId, reason);
    }

    // 清理资源
    gum.stopAllStreams();

    store.setCallStatus(CallStatus.IDLE);
    store.setShowIncomingCall(false);

    // 重置状态
    setTimeout(() => this.resetCall(), 1000);
  };

  // 挂断通话
  public hangUpCall = (reason = "normal") => {
    const store = useRtcStore.getState();
    const { callId, remoteUserId } = store;

    // 清理计时器
    if (this.durationTimer) {
      window.clearInterval(this.durationTimer);
      this.durationTimer = null;
    }

    // 关闭媒体流 - 使用 gum 服务释放资源
    gum.stopAllStreams();

    // 关闭WebRTC连接
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // 发送挂断消息
    if (callId && remoteUserId) {
      rtcWsEmitter.hangUpCall(callId, remoteUserId, reason);
    }

    store.setCallStatus(CallStatus.ENDED);
    store.setShowOutgoingCall(false);
    store.setShowCallInProgress(false);

    // 重置状态
    setTimeout(() => this.resetCall(), 3000);
  };

  // 切换视频状态 - 使用 gum 服务的暂停功能
  public toggleVideo = () => {
    const store = useRtcStore.getState();
    const { isLocalVideoEnabled } = store;

    // 使用 gum 服务暂停/恢复视频
    gum.pauseVideo(isLocalVideoEnabled);
    store.setLocalVideoEnabled(!isLocalVideoEnabled);
  };

  // 切换音频状态 - 使用 gum 服务的暂停功能
  public toggleAudio = () => {
    const store = useRtcStore.getState();
    const { isLocalAudioEnabled } = store;

    // 使用 gum 服务暂停/恢复音频
    gum.pauseAudio(isLocalAudioEnabled);
    store.setLocalAudioEnabled(!isLocalAudioEnabled);
  };

  // 切换视频设备 - 新增方法
  public switchVideoDevice = async (deviceId: string) => {
    try {
      // 使用 gum 服务切换视频设备
      await gum.getVideoStream(deviceId);
      // 更新 RTCPeerConnection 的轨道
      this.updateMediaTracks();
    } catch (error) {
      console.error("切换视频设备失败", error);
    }
  };

  // 切换音频输入设备 - 新增方法
  public switchAudioDevice = async (deviceId: string) => {
    try {
      // 使用 gum 服务切换音频设备
      await gum.getAudioStream(deviceId);
      // 更新 RTCPeerConnection 的轨道
      this.updateMediaTracks();
    } catch (error) {
      console.error("切换音频设备失败", error);
    }
  };

  // 设置音频输出设备 - 新增方法
  public setAudioOutput = async (element: HTMLMediaElement, deviceId: string) => {
    try {
      await gum.setAudioOutput(element, deviceId);
    } catch (error) {
      console.error("设置音频输出设备失败", error);
    }
  };

  // 更新 PeerConnection 中的媒体轨道 - 新增方法
  private updateMediaTracks = () => {
    const store = useRtcStore.getState();

    if (!this.peerConnection) return;

    // 获取当前的发送器
    const senders = this.peerConnection.getSenders();

    // 获取 gum 中的音视频流
    const videoStream = gum.getVideoStreamInstance();
    const audioStream = gum.getAudioStreamInstance();

    if (videoStream) {
      const videoTrack = videoStream.getVideoTracks()[0];
      if (videoTrack) {
        const videoSender = senders.find(sender =>
          sender.track && sender.track.kind === 'video'
        );
        if (videoSender) {
          videoSender.replaceTrack(videoTrack);
        }
      }
    }

    if (audioStream) {
      const audioTrack = audioStream.getAudioTracks()[0];
      if (audioTrack) {
        const audioSender = senders.find(sender =>
          sender.track && sender.track.kind === 'audio'
        );
        if (audioSender) {
          audioSender.replaceTrack(audioTrack);
        }
      }
    }

    // 更新本地流
    if (videoStream && audioStream) {
      const combinedStream = new MediaStream();
      videoStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
      audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
      store.setLocalStream(combinedStream);
    } else if (videoStream) {
      store.setLocalStream(videoStream);
    } else if (audioStream) {
      store.setLocalStream(audioStream);
    }
  };

  // 关闭所有对话框
  public closeAllDialogs = () => {
    const store = useRtcStore.getState();
    store.setShowIncomingCall(false);
    store.setShowOutgoingCall(false);
    store.setShowCallInProgress(false);
  };

  // 处理来电
  public handleIncomingCall = (callData: any) => {
    const { callId, senderId, senderInfo, offer, callType } = callData;
    const store = useRtcStore.getState();

    // 如果已经在通话中，拒绝新来电
    if (store.status !== CallStatus.IDLE) {
      if (callId && senderId) {
        rtcWsEmitter.rejectCall(callId, senderId, "busy");
      }
      return;
    }

    // 更新状态为来电
    store.setCallId(callId);
    store.setCallStatus(CallStatus.INCOMING);
    store.setCallType(callType === "audio" ? CallType.AUDIO : CallType.VIDEO);
    store.setRemoteUserId(senderId);
    store.setRemoteUser({
      id: senderInfo.id,
      username: senderInfo.username,
      avatar: senderInfo.avatar
    });
    store.setShowIncomingCall(true);

    // 创建RTCPeerConnection并设置远程描述
    getIceServers().then((iceServersResponse) => {
      this.peerConnection = new RTCPeerConnection({
        iceServers: iceServersResponse.iceServers
      });

      // 处理ICE候选
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && store.callId && store.remoteUserId) {
          rtcWsEmitter.sendIceCandidate(
            store.callId,
            store.remoteUserId,
            event.candidate
          );
        }
      };

      // 处理远程媒体流
      this.peerConnection.ontrack = (event) => {
        store.setRemoteStream(event.streams[0]);
      };

      this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    });

    // 30秒自动拒接
    setTimeout(() => {
      const currentState = useRtcStore.getState();
      if (currentState.status === CallStatus.INCOMING && currentState.callId === callId) {
        this.rejectCall("timeout");
      }
    }, 30000);
  };

  // 处理通话应答
  public handleCallAnswer = (answerData: any) => {
    const { callId, senderId, answer, responderInfo } = answerData;
    const store = useRtcStore.getState();

    if (this.peerConnection && store.status === CallStatus.OUTGOING) {
      // 更新远程用户信息
      if (responderInfo) {
        store.setRemoteUser({
          id: responderInfo.id,
          username: responderInfo.username,
          avatar: responderInfo.avatar
        });
      }

      // 设置远程描述
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
        .then(() => {
          // 更新状态为已连接
          store.setCallStatus(CallStatus.CONNECTED);
          store.setShowOutgoingCall(false);
          store.setShowCallInProgress(true);
          store.setStartTime(Date.now());

          // 启动通话计时器
          this.startDurationTimer();
        })
        .catch(error => {
          console.error("设置远程描述失败", error);
          store.setCallStatus(CallStatus.ENDED);
          store.setError(`连接失败: ${error.message}`);
          store.setShowOutgoingCall(false);

          // 清理资源
          gum.stopAllStreams();

          // 重置状态
          setTimeout(() => this.resetCall(), 3000);
        });
    }
  };

  // 处理ICE候选
  public handleIceCandidate = (candidateData: any) => {
    const { candidate } = candidateData;

    if (this.peerConnection) {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
        .catch(error => {
          console.error("添加ICE候选失败", error);
        });
    }
  };

  // 处理对方挂断
  public handleRemoteHangUp = (hangUpData: any) => {
    const store = useRtcStore.getState();

    // 清理计时器
    if (this.durationTimer) {
      window.clearInterval(this.durationTimer);
      this.durationTimer = null;
    }

    // 关闭媒体流 - 使用 gum 服务释放资源
    gum.stopAllStreams();

    // 关闭WebRTC连接
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    store.setCallStatus(CallStatus.ENDED);
    store.setShowIncomingCall(false);
    store.setShowOutgoingCall(false);
    store.setShowCallInProgress(false);
    store.setError("对方已挂断通话");

    // 重置状态
    setTimeout(() => this.resetCall(), 3000);
  };

  // 启动通话时长计时器
  private startDurationTimer = () => {
    const store = useRtcStore.getState();

    // 先清除可能存在的旧计时器
    if (this.durationTimer) {
      window.clearInterval(this.durationTimer);
    }

    // 创建新计时器，每秒更新一次通话时长
    this.durationTimer = window.setInterval(() => {
      const currentStore = useRtcStore.getState();
      if (currentStore.startTime && currentStore.status === CallStatus.CONNECTED) {
        const now = Date.now();
        const duration = Math.floor((now - currentStore.startTime) / 1000);
        currentStore.setDuration(duration);
      } else {
        // 如果通话已结束，清除计时器
        if (this.durationTimer) {
          window.clearInterval(this.durationTimer);
          this.durationTimer = null;
        }
      }
    }, 1000);
  };

  // 格式化通话时长为 MM:SS 格式
  public formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
}

// 创建单例实例
const rtcService = new RtcService();

// 单独导出各个状态的 hook，这样组件可以只订阅它们需要的状态
export const useCallStatus = () => {
  return useRtcStore(state => state.status);
};

export const useLocalStream = () => {
  return useRtcStore(state => state.localStream);
};

export const useRemoteStream = () => {
  return useRtcStore(state => state.remoteStream);
};

export const useLocalVideoEnabled = () => {
  return useRtcStore(state => state.isLocalVideoEnabled);
};

export const useLocalAudioEnabled = () => {
  return useRtcStore(state => state.isLocalAudioEnabled);
};

export const useShowOutgoingCall = () => {
  return useRtcStore(state => state.showOutgoingCall);
};

export const useShowIncomingCall = () => {
  return useRtcStore(state => state.showIncomingCall);
};

export const useShowCallInProgress = () => {
  return useRtcStore(state => state.showCallInProgress);
};

export const useCallType = () => {
  return useRtcStore(state => state.callType);
};

export const useRemoteUser = () => {
  return useRtcStore(state => state.remoteUser);
};

export const useCallError = () => {
  return useRtcStore(state => state.error);
};

export const useStartTime = () => {
  return useRtcStore(state => state.startTime);
};

export const useDuration = () => {
  return useRtcStore(state => state.duration);
};

// 这些 hooks 将继续提供，但建议组件使用上面的单独状态 hooks
export const useCallStreams = () => {
  return {
    localStream: useLocalStream(),
    remoteStream: useRemoteStream(),
    isLocalVideoEnabled: useLocalVideoEnabled(),
    isLocalAudioEnabled: useLocalAudioEnabled()
  };
};

export const useCallUI = () => {
  return {
    showIncomingCall: useShowIncomingCall(),
    showOutgoingCall: useShowOutgoingCall(),
    showCallInProgress: useShowCallInProgress(),
    callType: useCallType(),
    error: useCallError(),
    remoteUser: useRemoteUser()
  };
};

export const useCallDuration = () => {
  return {
    startTime: useStartTime(),
    duration: useDuration()
  };
};

export const useMediaDevices = () => {
  return {
    videoDevices: gum.getVideoDevices(),
    audioInDevices: gum.getAudioInDevices(),
    audioOutDevices: gum.getAudioOutDevices(),
    activeVideoDeviceId: gum.getActiveVideoDeviceId(),
    activeAudioInDeviceId: gum.getActiveAudioInDeviceId(),
    activeAudioOutDeviceId: gum.getActiveAudioOutDeviceId(),
    switchVideoDevice: rtcService.switchVideoDevice,
    switchAudioDevice: rtcService.switchAudioDevice,
    setAudioOutput: rtcService.setAudioOutput
  };
};

// 导出service实例
export default rtcService;