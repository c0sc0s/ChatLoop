import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FriendRequestsDialog } from "./FriendRequestsDialog";
import { getFriendRequests } from "@/api/friends";
import { toast } from "sonner";

interface FriendRequestsButtonProps {
  onRequestsUpdated: () => void;
}

/**
 * 好友请求通知按钮组件
 */
export function FriendRequestsButton({
  onRequestsUpdated,
}: FriendRequestsButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  // 获取好友请求数量
  const fetchRequestCount = async () => {
    try {
      const response = await getFriendRequests();
      setRequestCount(response.requests.length);
    } catch (error) {
      console.error("Failed to fetch friend requests:", error);
    }
  };

  // 组件挂载和定期刷新时获取请求数量
  useEffect(() => {
    fetchRequestCount();

    // 每分钟刷新一次
    const interval = setInterval(fetchRequestCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full"
        onClick={() => setDialogOpen(true)}
        title="好友请求"
      >
        <Bell className="h-5 w-5" />
        {requestCount > 0 && (
          <Badge className="absolute -top-1 -right-1 min-w-[1.2rem] h-[1.2rem] flex items-center justify-center text-[0.65rem] p-0 bg-red-500">
            {requestCount > 99 ? "99+" : requestCount}
          </Badge>
        )}
      </Button>

      <FriendRequestsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onRequestsUpdated={() => {
          fetchRequestCount();
          onRequestsUpdated();
        }}
      />
    </>
  );
}
