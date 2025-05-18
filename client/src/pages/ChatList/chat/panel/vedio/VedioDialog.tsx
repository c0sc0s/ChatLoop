// client/src/pages/ChatList/chat/panel/vedio/VedioDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useShowOutgoingCall,
  useShowIncomingCall,
  useShowCallInProgress,
  useCallType,
} from "@/core/store/rtc/service";
import rtcService from "@/core/store/rtc/service";
import { CallType } from "@/core/store/rtc/state";

// 导入子组件
import {
  OutgoingCallView,
  IncomingCallView,
  CallInProgressView,
} from "./components";

export function VideoCallDialog() {
  // 使用单独的状态 hooks
  const showOutgoingCall = useShowOutgoingCall();
  const showIncomingCall = useShowIncomingCall();
  const showCallInProgress = useShowCallInProgress();
  const callType = useCallType();

  // 是否显示对话框
  const isOpen = showOutgoingCall || showIncomingCall || showCallInProgress;

  // 对话框标题
  const getDialogTitle = () => {
    if (showOutgoingCall) return "正在拨打...";
    if (showIncomingCall) return "来电";
    return callType === CallType.VIDEO ? "视频通话" : "语音通话";
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && rtcService.closeAllDialogs()}
    >
      <DialogContent
        className={`${
          showCallInProgress && callType === CallType.VIDEO
            ? "sm:max-w-xl"
            : "sm:max-w-md"
        }`}
      >
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        {/* 根据状态渲染不同的视图组件 */}
        {showOutgoingCall && <OutgoingCallView />}
        {showIncomingCall && <IncomingCallView />}
        {showCallInProgress && <CallInProgressView />}
      </DialogContent>
    </Dialog>
  );
}
