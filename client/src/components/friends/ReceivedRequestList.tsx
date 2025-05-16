import { Loader2 } from "lucide-react";
import { ReceivedRequestItem } from "./ReceivedRequestItem";
import { type ReceivedRequestListProps } from "./types";

/**
 * 收到的好友请求列表组件
 */
export function ReceivedRequestList({
  requests,
  isLoading,
  onAccept,
  onReject,
  isProcessingRequest,
  emptyMessage,
}: ReceivedRequestListProps) {
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
        <ReceivedRequestItem
          key={request.id}
          request={request}
          onAccept={onAccept}
          onReject={onReject}
          isAccepting={isProcessingRequest[request.id]?.accepting || false}
          isRejecting={isProcessingRequest[request.id]?.rejecting || false}
        />
      ))}
    </div>
  );
}
