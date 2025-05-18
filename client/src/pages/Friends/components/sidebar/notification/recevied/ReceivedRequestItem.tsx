import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { FriendRequestItem } from "@/common/types";
import { useCallback } from "react";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/core/store/friends/notification/hooks";
import { toast } from "sonner";
interface ReceivedRequestItemProps {
  item: FriendRequestItem;
}

/**
 * 收到的好友请求项组件
 */
export function ReceivedRequestItem({ item }: ReceivedRequestItemProps) {
  const handleAccept = useCallback(() => {
    acceptFriendRequest(item)
      .then(() => {
        toast.success("好友请求已接受");
      })
      .catch((err) => {
        toast.error("好友请求接受失败", {
          description: err.message,
        });
      });
  }, [item.id]);

  const handleReject = useCallback(() => {
    rejectFriendRequest(item.id)
      .then(() => {
        toast.success("好友请求已拒绝");
      })
      .catch((err) => {
        toast.error("好友请求拒绝失败", {
          description: err.message,
        });
      });
  }, [item.id]);

  return (
    <div className="flex items-center gap-3 p-3 hover:shadow-sm transition bg-muted/40 rounded-md">
      <Avatar className="w-10 h-10 border">
        <AvatarImage src={item.user.avatar || ""} />
        <AvatarFallback>
          {item.user.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{item.user.username}</div>
        <div className="text-xs text-muted-foreground">
          {new Date(item.createdAt).toLocaleString()}
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          className="bg-green-500/10 hover:bg-green-500/20 text-green-600 border-green-200"
          onClick={handleAccept}
        >
          <Check className="w-3.5 h-3.5 mr-1" />
          接受
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-200"
          onClick={handleReject}
        >
          <X className="w-3.5 h-3.5 mr-1" />
          拒绝
        </Button>
      </div>
    </div>
  );
}
