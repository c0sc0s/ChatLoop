import AddFriends from "./addFriend/AddFriends";
import Navs from "./Navs";
import { FriendsNotification } from "./notification";

export default function FriendGroupNav() {
  return (
    <aside className="w-56 border-r bg-background/80 flex flex-col py-4">
      <div className="flex justify-between px-4 items-center mb-2">
        <div className="text-md">好友列表</div>
        <FriendsNotification />
      </div>
      <nav className="flex-1 overflow-y-auto">
        <Navs />
      </nav>
      <div className="px-4">
        <AddFriends />
      </div>
    </aside>
  );
}
