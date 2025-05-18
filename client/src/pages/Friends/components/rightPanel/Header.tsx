import { useCurrentFriendGroup } from "@/core/store/friends/nav/hooks";

const Header = () => {
  const currentGroup = useCurrentFriendGroup();

  return (
    <h2 className="text-lg font-semibold">
      {currentGroup?.name || "好友列表"}
      <span className="ml-2 text-sm text-muted-foreground">
        ({currentGroup?.friends.length || 0})
      </span>
    </h2>
  );
};

export default Header;
