import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Video,
  MoreVertical,
  Users,
  MoreHorizontal,
} from "lucide-react";
import type { ConversationSchema } from "@/common/types/chat";

interface ChatHeaderProps {
  currentConversation: ConversationSchema;
  isGroupChat: boolean;
  groupInfo: {
    name: string;
    avatar?: string | null;
    memberCount: number;
  } | null;
  otherUser: {
    id: number;
    username: string;
    avatar?: string | null;
    status: string;
  } | null;
}

export function ChatHeader({
  currentConversation,
  isGroupChat,
  groupInfo,
  otherUser,
}: ChatHeaderProps) {
  if (!currentConversation) return null;

  // 渲染头像部分
  const renderAvatar = () => {
    if (isGroupChat) {
      return (
        <>
          <AvatarImage src={groupInfo?.avatar || undefined} />
          <AvatarFallback>
            <Users className="h-5 w-5" />
          </AvatarFallback>
        </>
      );
    }

    return (
      <>
        <AvatarImage src={otherUser?.avatar || undefined} />
        <AvatarFallback>{otherUser?.username?.[0] || "?"}</AvatarFallback>
      </>
    );
  };

  // 渲染名称和状态部分
  const renderNameAndStatus = () => {
    // 显示名称（群聊名称或用户名称）
    const displayName = isGroupChat ? groupInfo?.name : otherUser?.username;

    return (
      <div>
        <div className="font-bold flex items-center gap-2">
          {displayName}
          {isGroupChat && groupInfo && (
            <span className="text-xs text-muted-foreground">
              ({groupInfo.memberCount}人)
            </span>
          )}
        </div>
        {!isGroupChat && otherUser && (
          <div className="text-xs text-muted-foreground">
            {otherUser.status === "online" ? "在线" : "离线"}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-3 border-b-[0.2px] px-6 py-4 justify-between flex-shrink-0 h-17">
      <div className="flex items-center gap-3">{renderNameAndStatus()}</div>
      <div className="flex items-center gap-3">
        <Button size="icon" variant="ghost" title="语音通话">
          <Phone className="size-5" />
        </Button>
        <Button size="icon" variant="ghost" title="视频通话">
          <Video className="size-6" />
        </Button>
        <Button size="icon" variant="ghost">
          <MoreHorizontal className="size-5" />
        </Button>
      </div>
    </div>
  );
}
