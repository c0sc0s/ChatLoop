import wsClient from "../client";
import { VideoCallMessageType } from "../type";

class RtcWsEmitter {
  private get sendMessage() {
    return (msgInfo: any) => {
      wsClient.sendMessage(msgInfo);
    };
  }

  /**
   * 发送视频通话请求
   * @param receiverId 接收者ID
   * @param offer SDP提议
   * @param callType 通话类型
   */
  public sendCallOffer(receiverId: string, offer: RTCSessionDescription, callType: "video" | "audio" = "video") {
    this.sendMessage({
      type: VideoCallMessageType.offer,
      data: {
        receiverId,
        offer,
        callType
      },
    });
  }

  /**
   * 发送通话应答
   * @param callId 通话ID
   * @param receiverId 接收者ID
   * @param answer SDP应答
   */
  public sendCallAnswer(callId: string, receiverId: string, answer: RTCSessionDescription) {
    this.sendMessage({
      type: VideoCallMessageType.answer,
      data: {
        callId,
        receiverId,
        answer
      },
    });
  }

  /**
   * 发送ICE候选
   * @param callId 通话ID
   * @param receiverId 接收者ID
   * @param candidate ICE候选
   */
  public sendIceCandidate(callId: string, receiverId: string, candidate: RTCIceCandidate) {
    this.sendMessage({
      type: VideoCallMessageType.ice_candidate,
      data: {
        callId,
        receiverId,
        candidate
      },
    });
  }

  /**
   * 挂断通话
   * @param callId 通话ID
   * @param receiverId 接收者ID
   * @param reason 挂断原因
   */
  public hangUpCall(callId: string, receiverId: string, reason: string = "normal") {
    this.sendMessage({
      type: VideoCallMessageType.hang_up,
      data: {
        callId,
        receiverId,
        reason
      },
    });
  }

  /**
   * 拒绝通话
   * @param callId 通话ID
   * @param receiverId 接收者ID
   * @param reason 拒绝原因
   */
  public rejectCall(callId: string, receiverId: string, reason: string = "rejected") {
    this.sendMessage({
      type: VideoCallMessageType.reject,
      data: {
        callId,
        receiverId,
        reason
      },
    });
  }
}

const rtcWsEmitter = new RtcWsEmitter();

export default rtcWsEmitter;