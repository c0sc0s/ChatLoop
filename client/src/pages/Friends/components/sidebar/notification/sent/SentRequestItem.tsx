import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { SentFriendRequest } from "@/common/types";

interface SentRequestItemProps {
  request: SentFriendRequest;
}

/**
 * 发送的好友请求项组件
 */
export function SentRequestItem({ request }: SentRequestItemProps) {
  // 请求状态徽章
  const getStatusBadge = () => {
    switch (request.status) {
      case "accepted":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-200">
            已接受
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-200">
            已拒绝
          </Badge>
        );
      default:
        return (
          <Badge className="bg-lime-500/10 text-lime-600 border-lime-200">
            等待接受
          </Badge>
        );
    }
  };

  return (
    <Card className="flex items-center gap-3 p-3 hover:shadow-sm transition">
      <Avatar className="w-10 h-10 border">
        <AvatarImage src={request.receiver.avatar} />
        <AvatarFallback>
          {request.receiver.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium flex items-center gap-2">
          <span className="truncate">{request.receiver.username}</span>
          {getStatusBadge()}
        </div>
        <div className="text-xs text-muted-foreground">
          {new Date(request.createdAt).toLocaleString()}
        </div>
      </div>
      {request.status === "pending" && (
        <Button
          size="sm"
          variant="outline"
          className="bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-200"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          取消
        </Button>
      )}
    </Card>
  );
}
