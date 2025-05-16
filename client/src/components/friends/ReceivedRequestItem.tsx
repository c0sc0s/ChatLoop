import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";
import { type ReceivedRequestItemProps } from "./types";

/**
 * 收到的好友请求项组件
 */
export function ReceivedRequestItem({
  request,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: ReceivedRequestItemProps) {
  return (
    <Card className="flex items-center gap-3 p-3 hover:shadow-sm transition">
      <Avatar className="w-10 h-10 border">
        <AvatarImage src={request.sender.avatar} />
        <AvatarFallback>
          {request.sender.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{request.sender.username}</div>
        <div className="text-xs text-muted-foreground">
          {new Date(request.createdAt).toLocaleString()}
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          className="bg-green-500/10 hover:bg-green-500/20 text-green-600 border-green-200"
          onClick={() => onAccept(request.id)}
          disabled={isAccepting || isRejecting}
        >
          {isAccepting ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5 mr-1" />
          )}
          接受
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-red-500/10 hover:bg-red-500/20 text-red-600 border-red-200"
          onClick={() => onReject(request.id)}
          disabled={isAccepting || isRejecting}
        >
          {isRejecting ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5 mr-1" />
          )}
          拒绝
        </Button>
      </div>
    </Card>
  );
}
