import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendItem } from "./FriendItem";
import { useCurrentFriendGroup } from "@/core/store/friends/nav/hooks";

export function FriendList() {
  const currentGroup = useCurrentFriendGroup();

  return (
    <main className="flex-1 overflow-y-auto h-full flex flex-col">
      {currentGroup?.friends.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-muted-foreground flex-1">
          <div className="text-6xl mb-4">🙁</div>
          <p>没有找到好友</p>
          <Button variant="link" className="mt-2">
            <UserPlus className="w-4 h-4 mr-1" />
            添加新好友
          </Button>
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {currentGroup?.friends.map((friend) => (
            <li key={friend.id} className="p-3">
              <FriendItem friend={friend} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
