import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateGroupDialog from "@/components/groups/CreateGroupDialog";

/**
 * 创建群聊按钮组件
 */
export function CreateGroupButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setDialogOpen(true)}
      >
        <Users className="size-4 mr-2" />
        创建群聊
      </Button>

      <CreateGroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onGroupCreated={() => {
          // 可以在这里添加创建群组后的回调
        }}
      />
    </>
  );
}
