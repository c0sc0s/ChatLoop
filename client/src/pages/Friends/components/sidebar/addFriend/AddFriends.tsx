import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { AddFriendDialog } from "./AddFriendDialog";
import { useCallback, useState } from "react";

const AddFriends = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleClick = useCallback(() => {
    setAddDialogOpen(true);
  }, []);

  return (
    <>
      <Button className="w-full bg-primary/80" onClick={handleClick}>
        <UserPlus className="size-4" />
        添加好友
      </Button>
      <AddFriendDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </>
  );
};

export default AddFriends;
