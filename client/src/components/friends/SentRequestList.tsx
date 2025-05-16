import { Loader2 } from "lucide-react";
import { SentRequestItem } from "./SentRequestItem";
import { type SentRequestListProps } from "./types";

/**
 * 发送的好友请求列表组件
 */
export function SentRequestList({
  requests,
  isLoading,
  onCancel,
  isCancellingRequest,
  emptyMessage,
}: SentRequestListProps) {
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">加载中...</span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 max-h-[400px] overflow-y-auto">
      {requests.map((request) => (
        <SentRequestItem
          key={request.id}
          request={request}
          onCancel={onCancel}
          isCancelling={isCancellingRequest[request.id] || false}
        />
      ))}
    </div>
  );
}
