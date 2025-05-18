import { sendFriendRequest } from "@/api/friends";
import type { UserBasic } from "@/common/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ISearchResProps {
  searchResults: UserBasic[];
  isSearching: boolean;
}

const SearchRes = ({ searchResults, isSearching }: ISearchResProps) => {
  const [isAdding, setIsAdding] = useState<Record<number, boolean>>({});

  if (isSearching) {
    return (
      <div className="py-4 flex justify-center items-center h-42">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">正在搜索...</span>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="py-4 flex justify-center items-center h-42">
        <span className="text-muted-foreground">未找到匹配的用户</span>
      </div>
    );
  }

  const handleAddFriend = (userId: number) => {
    setIsAdding((prev) => ({ ...prev, [userId]: true }));

    sendFriendRequest(userId)
      .then(() => {
        toast.success("好友请求已发送", { description: "等待对方接受" });
      })
      .catch((error) => {
        toast.error("发送好友请求失败", { description: String(error) });
      })
      .finally(() => {
        setIsAdding((prev) => ({ ...prev, [userId]: false }));
      });
  };

  return (
    <div className="grid grid-cols-2 gap-4 overflow-y-auto h-42">
      {searchResults.map((user) => (
        <div
          key={user.id}
          className="flex items-center max-h-20 bg-muted/40 rounded-md gap-3 p-3 hover:shadow-md transition"
        >
          <Avatar className="w-10 h-10 border">
            <AvatarImage src={user.avatar || undefined} />
            <AvatarFallback>
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{user.username}</div>
          </div>
          <Button
            size="icon"
            onClick={() => handleAddFriend(user.id)}
            variant="secondary"
            disabled={isAdding[user.id]}
          >
            {isAdding[user.id] ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
};
export default SearchRes;
