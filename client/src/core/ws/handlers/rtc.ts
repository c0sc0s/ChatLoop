import { VideoCallMessageType } from "../type";
import wsEventBus from "../wsEventBus";
import rtcService from "@/core/store/rtc/service";
import useRtcStore from "@/core/store/rtc";
import { CallStatus } from "@/core/store/rtc/state";

// 这里先创建基础处理函数，后续我们会根据状态管理逻辑来完善
const offerHandler = (data: any) => {
  console.log("收到通话请求", data);
  rtcService.handleIncomingCall(data);
};

const answerHandler = (data: any) => {
  console.log("收到通话应答", data);
  rtcService.handleCallAnswer(data);
};

const iceCandidateHandler = (data: any) => {
  console.log("收到ICE候选", data);
  rtcService.handleIceCandidate(data);
};

const hangUpHandler = (data: any) => {
  console.log("对方挂断通话", data);
  rtcService.handleRemoteHangUp(data);
};

const rejectHandler = (data: any) => {
  console.log("对方拒绝通话", data);
  // 设置状态为已结束，显示拒绝信息
  const store = useRtcStore.getState();
  store.setCallStatus(CallStatus.ENDED);
  store.setError(`通话被拒绝: ${data.reason || '对方拒绝了通话'}`);
  store.setShowIncomingCall(false);
  store.setShowOutgoingCall(false);

  // 延迟重置状态
  setTimeout(() => rtcService.resetCall(), 3000);
};

const busyHandler = (data: any) => {
  console.log("对方忙线", data);
  // 设置状态为已结束，显示忙线信息
  const store = useRtcStore.getState();
  store.setCallStatus(CallStatus.ENDED);
  store.setError("对方正在通话中");
  store.setShowIncomingCall(false);
  store.setShowOutgoingCall(false);

  // 延迟重置状态
  setTimeout(() => rtcService.resetCall(), 3000);
};

const notAvailableHandler = (data: any) => {
  console.log("对方不可用", data);
  // 设置状态为已结束，显示不可用信息
  const store = useRtcStore.getState();
  store.setCallStatus(CallStatus.ENDED);
  store.setError("对方不在线");
  store.setShowIncomingCall(false);
  store.setShowOutgoingCall(false);

  // 延迟重置状态
  setTimeout(() => rtcService.resetCall(), 3000);
};

// 注册所有处理函数
wsEventBus.on(VideoCallMessageType.offer, offerHandler);
wsEventBus.on(VideoCallMessageType.answer, answerHandler);
wsEventBus.on(VideoCallMessageType.ice_candidate, iceCandidateHandler);
wsEventBus.on(VideoCallMessageType.hang_up, hangUpHandler);
wsEventBus.on(VideoCallMessageType.reject, rejectHandler);
wsEventBus.on(VideoCallMessageType.busy, busyHandler);
wsEventBus.on(VideoCallMessageType.not_available, notAvailableHandler);