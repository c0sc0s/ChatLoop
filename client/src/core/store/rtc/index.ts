import { create } from "zustand";
import defaultRtcState, { type RtcState, CallStatus, CallType } from "./state";

interface RtcActions {
  // 基本状态更新方法
  setCallId: (callId: string | null) => void;
  setCallStatus: (status: CallStatus) => void;
  setCallType: (type: CallType) => void;
  setError: (error: string | null) => void;
  setRemoteUserId: (userId: string | null) => void;
  setRemoteUser: (user: { id: number | null, username: string | null, avatar: string | null }) => void;
  setStartTime: (time: number | null) => void;
  setDuration: (duration: number) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setLocalVideoEnabled: (enabled: boolean) => void;
  setLocalAudioEnabled: (enabled: boolean) => void;
  setShowIncomingCall: (show: boolean) => void;
  setShowOutgoingCall: (show: boolean) => void;
  setShowCallInProgress: (show: boolean) => void;

  // 整体状态重置
  reset: () => void;
}

type RtcStore = RtcState & RtcActions;

const useRtcStore = create<RtcStore>((set) => ({
  ...defaultRtcState,

  // 基本状态更新方法
  setCallId: (callId) => set({ callId }),
  setCallStatus: (status) => set({ status }),
  setCallType: (callType) => set({ callType }),
  setError: (error) => set({ error }),
  setRemoteUserId: (remoteUserId) => set({ remoteUserId }),
  setRemoteUser: (remoteUser) => set({ remoteUser }),
  setStartTime: (startTime) => set({ startTime }),
  setDuration: (duration) => set({ duration }),
  setLocalStream: (localStream) => set({ localStream }),
  setRemoteStream: (remoteStream) => set({ remoteStream }),
  setLocalVideoEnabled: (isLocalVideoEnabled) => set({ isLocalVideoEnabled }),
  setLocalAudioEnabled: (isLocalAudioEnabled) => set({ isLocalAudioEnabled }),
  setShowIncomingCall: (showIncomingCall) => set({ showIncomingCall }),
  setShowOutgoingCall: (showOutgoingCall) => set({ showOutgoingCall }),
  setShowCallInProgress: (showCallInProgress) => set({ showCallInProgress }),

  // 整体状态重置
  reset: () => set(defaultRtcState)
}));

export default useRtcStore;
