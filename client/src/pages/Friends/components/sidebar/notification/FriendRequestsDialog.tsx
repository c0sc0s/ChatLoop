import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bell } from "lucide-react";
import { ReceivedRequestList } from "./recevied/ReceivedRequestList";

interface FriendRequestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 好友请求对话框组件
 */
export function FriendRequestsDialog({
  open,
  onOpenChange,
}: FriendRequestsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            请求通知
          </DialogTitle>
        </DialogHeader>
        <ReceivedRequestList />
        <DialogFooter>
          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
