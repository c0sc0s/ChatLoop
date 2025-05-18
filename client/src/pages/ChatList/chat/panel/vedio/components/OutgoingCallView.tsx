import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PhoneOff } from "lucide-react";
import {
  useRemoteUser,
  useCallType,
  useLocalStream,
} from "@/core/store/rtc/service";
import rtcService from "@/core/store/rtc/service";
import { CallType } from "@/core/store/rtc/state";

export function OutgoingCallView() {
  const remoteUser = useRemoteUser();
  const callType = useCallType();
  const localStream = useLocalStream();
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // 当本地流变化时，设置给视频元素
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // 处理挂断通话
  const handleHangUp = () => {
    rtcService.hangUpCall();
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
        <p className="text-muted-foreground mt-1">正在等待对方接听...</p>
      </div>

      {/* 本地视频预览 */}
      {callType === CallType.VIDEO && (
        <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-black mt-2">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full h-12 w-12"
          onClick={handleHangUp}
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
