import { Badge } from "@/components/ui/badge";
import { useCurrentFriendGroupId } from "@/core/store/friends/nav/hooks";
import { useFriendsNav } from "@/core/store/friends/nav/hooks";
import {
  setCurrentFriendGroupId,
  setCurrentFriendGroup,
} from "@/core/store/friends/nav/hooks";
import { cn } from "@/lib/utils";

const Navs = () => {
  const navs = useFriendsNav();
  const currentGroupId = useCurrentFriendGroupId();

  return navs.map((group) => (
    <button
      key={group.id}
      className="w-full text-left"
      onClick={() => {
        setCurrentFriendGroupId(group.id);
        setCurrentFriendGroup(group);
      }}
    >
      <div
        className={cn(
          "mx-3 my-1 cursor-pointer px-3 py-2 flex items-center rounded-md transition",
          currentGroupId === group.id
            ? "bg-primary/10 text-primary font-medium"
            : "hover:bg-muted text-muted-foreground"
        )}
      >
        <span>{group.name}</span>
        <Badge variant="outline" className="ml-auto">
          {group.friends.length}
        </Badge>
      </div>
    </button>
  ));
};

export default Navs;
