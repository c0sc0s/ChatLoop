import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { type FriendGroup } from "./types";
import { CreateGroupButton } from "./CreateGroupButton";

interface FriendGroupNavProps {
  groups: FriendGroup[];
  selectedGroup: string | null;
  onSelectGroup: (groupId: string) => void;
  onAddFriend: () => void;
}

/**
 * 好友分组导航组件
 */
export function FriendGroupNav({
  groups,
  selectedGroup,
  onSelectGroup,
  onAddFriend,
}: FriendGroupNavProps) {
  return (
    <aside className="w-56 border-r bg-background/80 flex flex-col py-4">
      <div className="px-6 pb-4 text-lg font-bold">好友列表</div>

      <nav className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <button
            key={group.id}
            className="w-full text-left"
            onClick={() => onSelectGroup(group.id)}
          >
            <div
              className={cn(
                "mx-3 my-1 px-3 py-2 flex items-center rounded-md transition",
                selectedGroup === group.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              {group.icon}
              <span>{group.name}</span>
              <Badge variant="outline" className="ml-auto">
                {group.friends.length}
              </Badge>
            </div>
          </button>
        ))}
      </nav>
      <div className="px-4 pt-4 mt-auto flex flex-col gap-3">
        <CreateGroupButton />
        <Button className="w-full" onClick={onAddFriend}>
          <UserPlus className="size-4 mr-2" />
          添加好友
        </Button>
      </div>
    </aside>
  );
}
