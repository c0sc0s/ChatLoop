import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mic, Video, PhoneOff } from "lucide-react";
import { useRemoteUser, useCallType } from "@/core/store/rtc/service";
import rtcService from "@/core/store/rtc/service";
import { CallType } from "@/core/store/rtc/state";

export function IncomingCallView() {
  const remoteUser = useRemoteUser();
  const callType = useCallType();

  // 处理拒绝来电
  const handleReject = () => {
    rtcService.rejectCall();
  };

  // 处理接受来电
  const handleAccept = () => {
    rtcService.acceptCall();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">
      <Avatar className="w-20 h-20">
        <AvatarImage src={remoteUser?.avatar || undefined} />
        <AvatarFallback>{remoteUser?.username?.[0] || "?"}</AvatarFallback>
      </Avatar>

      <div className="text-center">
        <h3 className="text-lg font-medium">
          {remoteUser?.username || "对方"}
        </h3>
        <p className="text-muted-foreground mt-1">
          {callType === CallType.VIDEO ? "视频通话邀请" : "语音通话邀请"}
        </p>
      </div>

      <div className="flex gap-4 mt-4">
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full h-12 w-12"
          onClick={handleReject}
        >
          <PhoneOff className="h-6 w-6" />
        </Button>

        <Button
          variant="default"
          size="icon"
          className="rounded-full h-12 w-12 bg-lime-500 hover:bg-lime-600"
          onClick={handleAccept}
        >
          {callType === CallType.VIDEO ? (
            <Video className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
}
