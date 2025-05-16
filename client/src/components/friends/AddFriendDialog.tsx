import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Search, UserPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { sendFriendRequest } from "@/api/friends";
import { searchUsers } from "@/api/user";
import type { UserBasic } from "@/common/types/user";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AddFriendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFriendAdded: () => void;
}

/**
 * 添加好友对话框组件
 */
export function AddFriendDialog({
  open,
  onOpenChange,
  onFriendAdded,
}: AddFriendDialogProps) {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserBasic[]>([]);
  const [isAdding, setIsAdding] = useState<Record<number, boolean>>({});

  // 处理搜索
  const handleSearch = async () => {
    if (!search.trim()) {
      toast.error("请输入搜索关键词");
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchUsers({ keyword: search });
      setSearchResults(result.users);
    } catch (error) {
      toast.error("搜索失败", { description: String(error) });
    } finally {
      setIsSearching(false);
    }
  };

  // 处理添加好友
  const handleAddFriend = async (userId: number) => {
    setIsAdding((prev) => ({ ...prev, [userId]: true }));
    try {
      await sendFriendRequest(userId);
      toast.success("好友请求已发送", { description: "等待对方接受" });
      // 从结果中移除该用户
      setSearchResults((prev) => prev.filter((user) => user.id !== userId));
      onFriendAdded();
    } catch (error) {
      toast.error("发送好友请求失败", { description: String(error) });
    } finally {
      setIsAdding((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            添加好友
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="输入用户名搜索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="min-w-24"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            搜索
          </Button>
        </div>

        {isSearching ? (
          <div className="py-8 flex justify-center items-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">正在搜索...</span>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto py-2">
            {searchResults.map((user) => (
              <Card
                key={user.id}
                className="flex items-center gap-3 p-3 hover:shadow-md transition"
              >
                <Avatar className="w-10 h-10 border">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback>
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{user.username}</div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs px-1 py-0 h-4",
                        user.status === "online"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                      )}
                    >
                      {user.status === "online" ? "在线" : "离线"}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleAddFriend(user.id)}
                  disabled={isAdding[user.id]}
                >
                  {isAdding[user.id] ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <UserPlus className="w-3 h-3 mr-1" />
                  )}
                  添加
                </Button>
              </Card>
            ))}
          </div>
        ) : search && !isSearching ? (
          <div className="py-8 text-center text-muted-foreground">
            未找到匹配的用户
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            输入用户名并点击搜索按钮
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
