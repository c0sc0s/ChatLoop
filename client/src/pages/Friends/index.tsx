import FirendsRightPanel from "./components/rightPanel";
import FriendGroupNav from "./components/sidebar";

export default function Friends() {
  return (
    <div className="flex h-full rounded-2xl overflow-hidden shadow-lg bg-background/30 backdrop-blur-sm border">
      <FriendGroupNav />
      <FirendsRightPanel />
    </div>
  );
}
