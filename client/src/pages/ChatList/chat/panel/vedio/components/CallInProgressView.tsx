import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import {
  useRemoteUser,
  useCallType,
  useLocalStream,
  useRemoteStream,
  useLocalVideoEnabled,
  useLocalAudioEnabled,
  useDuration,
} from "@/core/store/rtc/service";
import rtcService from "@/core/store/rtc/service";
import { CallType } from "@/core/store/rtc/state";

export function CallInProgressView() {
  const remoteUser = useRemoteUser();
  const callType = useCallType();
  const localStream = useLocalStream();
  const remoteStream = useRemoteStream();
  const isLocalVideoEnabled = useLocalVideoEnabled();
  const isLocalAudioEnabled = useLocalAudioEnabled();
  const duration = useDuration();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // 当本地流变化时，设置给视频元素
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // 当远程流变化时，设置给视频元素
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // 格式化通话时间
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 处理挂断通话
  const handleHangUp = () => {
    rtcService.hangUpCall();
  };

  // 切换麦克风
  const handleToggleAudio = () => {
    rtcService.toggleAudio();
  };

  // 切换摄像头
  const handleToggleVideo = () => {
    rtcService.toggleVideo();
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-4">
      {/* 通话时间 */}
      <div className="text-sm text-muted-foreground mb-2">
        {formatDuration(duration)}
      </div>

      {/* 远程视频 */}
      {callType === CallType.VIDEO && (
        <div className="w-full h-64 bg-black rounded-lg overflow-hidden relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* 本地视频（小窗口） */}
          <div className="absolute bottom-2 right-2 w-24 h-20 rounded-md overflow-hidden bg-gray-800 border border-gray-600">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* 如果是语音通话，显示头像 */}
      {callType === CallType.AUDIO && (
        <Avatar className="w-24 h-24">
          <AvatarImage src={remoteUser?.avatar || undefined} />
          <AvatarFallback>{remoteUser?.username?.[0] || "?"}</AvatarFallback>
        </Avatar>
      )}

      <div className="text-center my-2">
        <h3 className="text-lg font-medium">
          {remoteUser?.username || "对方"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {callType === CallType.VIDEO ? "视频通话中" : "语音通话中"}
        </p>
      </div>

      {/* 控制按钮 */}
      <div className="flex gap-4 justify-center mt-2">
        {/* 麦克风控制 */}
        <Button
          variant={isLocalAudioEnabled ? "outline" : "secondary"}
          size="icon"
          className="rounded-full h-12 w-12"
          onClick={handleToggleAudio}
        >
          {isLocalAudioEnabled ? (
            <Mic className="h-6 w-6" />
          ) : (
            <MicOff className="h-6 w-6" />
          )}
        </Button>

        {/* 视频控制，仅在视频通话时显示 */}
        {callType === CallType.VIDEO && (
          <Button
            variant={isLocalVideoEnabled ? "outline" : "secondary"}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={handleToggleVideo}
          >
            {isLocalVideoEnabled ? (
              <Video className="h-6 w-6" />
            ) : (
              <VideoOff className="h-6 w-6" />
            )}
          </Button>
        )}

        {/* 挂断按钮 */}
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
