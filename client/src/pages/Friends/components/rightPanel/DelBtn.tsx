import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { deleteFriend } from "@/core/store/friends/list/hooks";
import type { FriendItem } from "@/common/types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AlertDialogAction,
  AlertDialogCancel,
} from "@radix-ui/react-alert-dialog";

const DelBtn = ({ friend }: { friend: FriendItem }) => {
  const handleDelete = () => {
    deleteFriend(friend);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash className="size-3.5 mr-1" />
          删除
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确定删除好友吗？</AlertDialogTitle>
          <AlertDialogDescription>
            确定删除好友{friend.username}吗？此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Button size="sm" variant="outline">
              取消
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction>
            <Button size="sm" onClick={handleDelete} variant="destructive">
              确认
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DelBtn;
