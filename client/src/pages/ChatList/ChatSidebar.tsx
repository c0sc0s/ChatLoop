// src/pages/ChatList/ChatSidebar.tsx
import { useEffect, useCallback, useState } from "react";
import useChatStore from "@/core/store/chat";
import CreateGroupDialog from "@/components/groups/CreateGroupDialog";
import { ConversationList, SidebarHeader } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ChatSidebar() {
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);

  const { conversations, isLoadingConversations, fetchConversations } =
    useChatStore();

  // 初始加载会话列表
  useEffect(() => {
    fetchConversations();
  }, []);

  // 创建群组对话框打开处理
  const handleCreateGroup = useCallback(() => {
    setCreateGroupDialogOpen(true);
  }, []);

  return (
    <aside className="w-64 flex flex-col rounded-l-2xl bg-background/70 border border-r-0">
      <div className="flex gap-2 w-full items-center justify-between px-4 my-4">
        <Input
          className="border-0"
          prefix={<Search className="text-muted-foreground" size={12} />}
          type="email"
          placeholder="搜索"
        />
        <Button
          size="icon"
          className="w-8 h-8"
          variant="secondary"
          type="submit"
        >
          <Plus />
        </Button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1">
        <ConversationList
          conversations={conversations}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* 创建群组对话框 */}
      <CreateGroupDialog
        open={createGroupDialogOpen}
        onOpenChange={setCreateGroupDialogOpen}
        onGroupCreated={fetchConversations}
      />
    </aside>
  );
}
