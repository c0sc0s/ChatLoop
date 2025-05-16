import { Badge } from "@/components/ui/badge";
import { type FriendStatusBadgeProps } from "./types";

/**
 * 好友状态徽章组件
 */
export function FriendStatusBadge({ status }: FriendStatusBadgeProps) {
  switch (status) {
    case "online":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-500 border-green-500/20"
        >
          在线
        </Badge>
      );
    case "away":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        >
          离开
        </Badge>
      );
    case "busy":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-500 border-red-500/20"
        >
          忙碌
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-gray-500/10 text-gray-500 border-gray-500/20"
        >
          离线
        </Badge>
      );
  }
}
