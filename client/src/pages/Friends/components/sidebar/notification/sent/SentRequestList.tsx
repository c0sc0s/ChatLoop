import { SentRequestItem } from "./SentRequestItem";

interface SentRequestListProps {}

/**
 * 发送的好友请求列表组件
 */
export function SentRequestList({}: SentRequestListProps) {
  const requests = null;
  return (
    <div className="space-y-3 p-3 max-h-[400px] overflow-y-auto">
      {requests?.map((request) => (
        <SentRequestItem key={request.id} request={request} />
      ))}
    </div>
  );
}
