import { ReceivedRequestItem } from "./ReceivedRequestItem";
import { useReceviedFriendRequest } from "@/core/store/friends/notification/hooks";
interface ReceivedRequestListProps {}

/**
 * 收到的好友请求列表组件
 */
export function ReceivedRequestList() {
  const requests = useReceviedFriendRequest();
  console.log("r", requests);

  if (requests.length <= 0) {
    return (
      <div className="text-center h-40 flex items-center justify-center text-sm text-muted-foreground">
        暂无好友请求
      </div>
    );
  }

  return (
    <div className="space-y-3 h-40 overflow-y-scroll">
      {requests?.map((item) => (
        <ReceivedRequestItem key={item.id} item={item} />
      ))}
    </div>
  );
}
