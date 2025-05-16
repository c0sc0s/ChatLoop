import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, RefreshCw } from "lucide-react";
import { ReceivedRequestList } from "./ReceivedRequestList";
import { SentRequestList } from "./SentRequestList";
import {
  getFriendRequests,
  getSentFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
} from "@/api/friends";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { type FriendRequestsDialogProps } from "./types";
import type { FriendRequest, SentFriendRequest } from "@/common/types/friends";
import type { FriendRequestItem } from "@/common/types/friends";

/**
 * 好友请求对话框组件
 */
export function FriendRequestsDialog({
  open,
  onOpenChange,
  onRequestsUpdated,
}: FriendRequestsDialogProps) {
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [isLoading, setIsLoading] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SentFriendRequest[]>([]);
  const [isProcessingRequest, setIsProcessingRequest] = useState<
    Record<number, { accepting: boolean; rejecting: boolean }>
  >({});
  const [isCancellingRequest, setIsCancellingRequest] = useState<
    Record<number, boolean>
  >({});

  // 将API返回的FriendRequestItem转换为组件需要的FriendRequest类型
  const convertToFriendRequest = (item: FriendRequestItem): FriendRequest => ({
    id: item.id,
    sender: {
      id: item.user.id,
      username: item.user.username,
      avatar: item.user.avatar || "",
    },
    createdAt: item.createdAt,
  });

  // 加载请求列表
  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const receivedRes = await getFriendRequests();
      // 转换API返回的数据格式为组件需要的格式
      const convertedRequests = receivedRes.requests.map(
        convertToFriendRequest
      );
      setReceivedRequests(convertedRequests);

      // 暂时注释掉发送请求的部分，等接收请求处理好之后再处理
      // const sentRes = await getSentFriendRequests();
      // setSentRequests(sentRes.requests);
    } catch (error) {
      toast.error("获取好友请求失败", { description: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  // 接受好友请求
  const handleAcceptRequest = async (requestId: number) => {
    setIsProcessingRequest((prev) => ({
      ...prev,
      [requestId]: { accepting: true, rejecting: false },
    }));

    try {
      await acceptFriendRequest(requestId);
      toast.success("已接受好友请求");
      // 从列表中移除已处理的请求
      setReceivedRequests((prev) => prev.filter((req) => req.id !== requestId));
      onRequestsUpdated();
    } catch (error) {
      toast.error("接受好友请求失败", { description: String(error) });
    } finally {
      setIsProcessingRequest((prev) => ({
        ...prev,
        [requestId]: { accepting: false, rejecting: false },
      }));
    }
  };

  // 拒绝好友请求
  const handleRejectRequest = async (requestId: number) => {
    setIsProcessingRequest((prev) => ({
      ...prev,
      [requestId]: { accepting: false, rejecting: true },
    }));

    try {
      await rejectFriendRequest(requestId);
      toast.success("已拒绝好友请求");
      // 从列表中移除已处理的请求
      setReceivedRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      toast.error("拒绝好友请求失败", { description: String(error) });
    } finally {
      setIsProcessingRequest((prev) => ({
        ...prev,
        [requestId]: { accepting: false, rejecting: false },
      }));
    }
  };

  // 取消已发送的好友请求
  const handleCancelRequest = async (requestId: number) => {
    setIsCancellingRequest((prev) => ({
      ...prev,
      [requestId]: true,
    }));

    try {
      await cancelFriendRequest(requestId);
      toast.success("已取消好友请求");
      // 从列表中移除已取消的请求
      setSentRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      toast.error("取消好友请求失败", { description: String(error) });
    } finally {
      setIsCancellingRequest((prev) => ({
        ...prev,
        [requestId]: false,
      }));
    }
  };

  // 刷新请求列表
  const handleRefresh = () => {
    loadRequests();
  };

  // 当对话框打开时加载数据
  useEffect(() => {
    if (open) {
      loadRequests();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            好友请求
          </DialogTitle>
          <Tabs
            value={activeTab}
            onValueChange={(value: string) =>
              setActiveTab(value as "received" | "sent")
            }
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="received" className="flex items-center gap-2">
                收到的请求
                {receivedRequests.length > 0 && (
                  <Badge className="bg-primary/90">
                    {receivedRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                发送的请求
                {sentRequests.length > 0 && (
                  <Badge className="bg-primary/90">{sentRequests.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="mt-4">
              <ReceivedRequestList
                requests={receivedRequests}
                isLoading={isLoading}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                isProcessingRequest={isProcessingRequest}
                emptyMessage="没有收到的好友请求"
              />
            </TabsContent>

            <TabsContent value="sent" className="mt-4">
              <SentRequestList
                requests={sentRequests}
                isLoading={isLoading}
                onCancel={handleCancelRequest}
                isCancellingRequest={isCancellingRequest}
                emptyMessage="没有发送的好友请求"
              />
            </TabsContent>
          </Tabs>
        </DialogHeader>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            刷新
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
