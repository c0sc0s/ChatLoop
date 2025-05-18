import { Button } from "@/components/ui/button";
import { Forward } from "lucide-react";
import { StatusAvatar } from "@/components/ui/status-avatar";
import type { FriendData } from "@/common/types";
import { useCallback } from "react";
import { chatToSomeone } from "@/core/store/chat/hooks";
import { useNavigate } from "react-router-dom";
import DelBtn from "./DelBtn";
interface FriendItemProps {
  friend: FriendData;
}

export function FriendItem({ friend }: FriendItemProps) {
  const navigate = useNavigate();

  const navToChat = useCallback(() => {
    chatToSomeone(friend.id).then((conversation) => {
      navigate(`/chatlist/${conversation.id}`);
    });
  }, [friend.id]);

  return (
    <div className="flex items-center gap-4 px-3 py-2 hover:bg-muted/50 transition rounded-md">
      <StatusAvatar
        src={friend.avatar || ""}
        fallback={friend.username.slice(0, 2).toUpperCase()}
        status={friend.status}
        className="w-10 h-10 border"
      />
      <div className="flex-1 min-w-0">
        <div className="font-medium">
          <span className="truncate">{friend.username}</span>
        </div>
      </div>
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={navToChat}>
          <Forward className="size-3.5 mr-1" />
          发消息
        </Button>
        <DelBtn friend={friend} />
      </div>
    </div>
  );
}
