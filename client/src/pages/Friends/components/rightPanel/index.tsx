import { FriendList } from "./FriendList";
import Header from "./Header";

const FirendsRightPanel = () => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between h-14">
        <Header />
      </div>
      <div className="flex-1 overflow-y-auto">
        <FriendList />
      </div>
    </div>
  );
};

export default FirendsRightPanel;
