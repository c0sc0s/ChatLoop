import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Group, Users } from "lucide-react";
import type { ConversationSchema } from "@/common/types/chat";
import { Badge } from "@/components/ui/badge";
import { StatusAvatar } from "@/components/ui/status-avatar";
import { useConversation } from "@/core/hooks/useConversation";
interface ConversationItemProps {
  conversation: ConversationSchema;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const { getConversationName, getConversationAvatar, getLastMessagePreview } =
    useConversation();

  const isGroup = conversation.type === "group";
  const conversationName = getConversationName(conversation);
  const conversationAvatar = getConversationAvatar(conversation);
  const lastMessagePreview = getLastMessagePreview(conversation);

  // 渲染头像的回退显示
  const renderAvatarFallback = () => {
    if (isGroup) {
      return <Users className="h-5 w-5" />;
    }
    return conversationName[0] || "?";
  };

  return (
    <li className="">
      <NavLink
        to={`/chatlist/${conversation.id}`}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/60 transition",
            isActive ? "bg-accent text-primary border-r-2 border-lime-500" : ""
          )
        }
      >
        <StatusAvatar
          src={conversationAvatar || ""}
          fallback={renderAvatarFallback()}
          className="w-10 h-10 border"
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate flex items-center gap-1">
            {conversationName}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {lastMessagePreview}
          </div>
        </div>
      </NavLink>
    </li>
  );
}
