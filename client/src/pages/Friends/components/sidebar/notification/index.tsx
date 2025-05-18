import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendRequestsDialog } from "./FriendRequestsDialog";
import { hasFriendRequestNotification } from "@/core/store/friends/notification/hooks";

export function FriendsNotification() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const hasNotification = hasFriendRequestNotification();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full"
        onClick={() => setDialogOpen(true)}
        title="好友请求"
      >
        <div className="relative">
          <Bell className="h-5 w-5" />
          {hasNotification && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-2 h-2"></span>
          )}
        </div>
      </Button>

      <FriendRequestsDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
