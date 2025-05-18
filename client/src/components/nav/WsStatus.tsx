import useAppStore, { WsConnectionStatus } from "@/core/store/app";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const WsStatus = () => {
  const wsConnectionStatus = useAppStore((state) => state.wsConnectionStatus);

  // 根据连接状态确定颜色和提示文本
  const getStatusInfo = () => {
    switch (wsConnectionStatus) {
      case WsConnectionStatus.CONNECTED:
        return {
          color: "bg-lime-500",
          label: "已连接",
          tooltip: "WebSocket连接已建立，实时消息通道正常",
        };
      case WsConnectionStatus.CONNECTING:
        return {
          color: "bg-yellow-500",
          label: "连接中",
          tooltip: "正在尝试建立WebSocket连接，请稍候...",
        };
      case WsConnectionStatus.DISCONNECTED:
        return {
          color: "bg-red-500",
          label: "未连接",
          tooltip: "WebSocket连接已断开，无法接收实时消息",
        };
      default:
        return {
          color: "bg-gray-500",
          label: "未知状态",
          tooltip: "WebSocket连接状态未知",
        };
    }
  };

  const { color, label, tooltip } = getStatusInfo();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-default">
            <div
              className={cn("w-2.5 h-2.5 rounded-full animate-pulse", color)}
            ></div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WsStatus;
