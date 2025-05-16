import { Loader2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FriendItem } from "./FriendItem";
import { type FriendListProps } from "./types";

/**
 * 好友列表组件
 */
export function FriendList({
  group,
  isLoading,
  onAddFriend,
  onDeleteFriend,
  onSendMessage,
  isDeletingFriend,
  isCreatingChat = {},
}: FriendListProps) {
  return (
    <main className="flex-1 overflow-y-auto h-full flex flex-col">
      <div className="p-4 border-b flex items-center h-14">
        <h2 className="text-lg font-semibold">{group?.name || "好友列表"}</h2>
        <Badge variant="outline" className="ml-2">
          {group?.friends.length || 0}
        </Badge>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">加载中...</span>
        </div>
      ) : group?.friends.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-muted-foreground flex-1">
          <div className="text-6xl mb-4">🙁</div>
          <p>没有找到好友</p>
          <Button variant="link" className="mt-2" onClick={onAddFriend}>
            <UserPlus className="w-4 h-4 mr-1" />
            添加新好友
          </Button>
        </div>
      ) : (
        <ul className="divide-y flex-1 overflow-y-auto">
          {group?.friends.map((friend) => (
            <li key={friend.id} className="p-3">
              <FriendItem
                friend={friend}
                onDelete={onDeleteFriend}
                onSendMessage={onSendMessage}
                isDeleting={isDeletingFriend[friend.id] || false}
                isCreatingChat={isCreatingChat[friend.id] || false}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
