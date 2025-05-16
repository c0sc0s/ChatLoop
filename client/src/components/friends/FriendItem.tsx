import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Forward, Trash, Loader2 } from "lucide-react";
import { FriendStatusBadge } from "./FriendStatusBadge";
import { type FriendItemProps } from "./types";

/**
 * 好友列表项组件
 */
export function FriendItem({
  friend,
  onDelete,
  onSendMessage,
  isDeleting,
  isCreatingChat = false,
}: FriendItemProps) {
  return (
    <div className="flex items-center gap-4 px-3 py-2 hover:bg-muted/50 transition rounded-md">
      <Avatar className="w-10 h-10 border">
        <AvatarImage src={friend.avatar || ""} />
        <AvatarFallback>
          {friend.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium flex items-center gap-2">
          <span className="truncate">{friend.username}</span>
          <FriendStatusBadge status={friend.status} />
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          上次在线：{new Date(friend.lastActiveAt || "").toLocaleString()}
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onSendMessage(friend.id)}
          disabled={isCreatingChat}
        >
          {isCreatingChat ? (
            <Loader2 className="size-3.5 mr-1 animate-spin" />
          ) : (
            <Forward className="size-3.5 mr-1" />
          )}
          发消息
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(friend.id)}
          disabled={isDeleting || isCreatingChat}
        >
          {isDeleting ? (
            <Loader2 className="size-3.5 mr-1 animate-spin" />
          ) : (
            <Trash className="size-3.5 mr-1" />
          )}
          删除
        </Button>
      </div>
    </div>
  );
}
