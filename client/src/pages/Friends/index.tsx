// src/pages/Friends.tsx
import { useEffect, useState } from "react";
import { getFriends, deleteFriend } from "@/api/friends";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createConversation } from "@/api/chat";
import {
  AddFriendDialog,
  FriendGroupNav,
  FriendList,
  type FriendGroup,
} from "@/components/friends";
import { FriendRequestsButton } from "@/components/friends/FriendRequestsButton";

/**
 * 好友页面
 */
export default function Friends() {
  const navigate = useNavigate();
  const [friendGroups, setFriendGroups] = useState<FriendGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState<Record<number, boolean>>(
    {}
  );
  const [isDeletingFriend, setIsDeletingFriend] = useState<
    Record<number, boolean>
  >({});

  // 当前选中的好友分组
  const currentGroup = selectedGroup
    ? friendGroups.find((g) => g.id === selectedGroup)
    : friendGroups[0];

  // 获取好友列表
  const fetchFriendList = async () => {
    setIsLoading(true);
    try {
      const { friends } = await getFriends();

      // 按照状态分组
      const onlineFriends = friends.filter((f) => f.status === "online");
      const offlineFriends = friends.filter((f) => f.status !== "online");

      const groups: FriendGroup[] = [
        {
          id: "all",
          name: "全部好友",
          friends: friends,
        },
        {
          id: "online",
          name: "在线好友",
          friends: onlineFriends,
        },
        {
          id: "offline",
          name: "离线好友",
          friends: offlineFriends,
        },
      ];

      setFriendGroups(groups);
      if (!selectedGroup && groups.length > 0) {
        setSelectedGroup(groups[0].id);
      }
    } catch (error) {
      toast.error("获取好友列表失败", { description: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  // 删除好友
  const handleDeleteFriend = async (friendId: number) => {
    if (confirm("确定要删除这个好友吗？")) {
      setIsDeletingFriend((prev) => ({ ...prev, [friendId]: true }));
      try {
        await deleteFriend(friendId);
        toast.success("好友已删除");
        fetchFriendList(); // 重新获取好友列表
      } catch (error) {
        toast.error("删除好友失败", { description: String(error) });
      } finally {
        setIsDeletingFriend((prev) => ({ ...prev, [friendId]: false }));
      }
    }
  };

  // 发送消息
  const handleSendMessage = async (friendId: number) => {
    setIsCreatingChat((prev) => ({ ...prev, [friendId]: true }));
    try {
      // 创建一个与该好友的私聊会话
      const response = await createConversation({
        participantIds: [friendId],
        type: "direct",
      });

      // 导航到聊天页面
      if (response && response.conversation) {
        navigate(`/chatlist/${response.conversation.id}`);
      } else {
        toast.error("创建会话失败");
      }
    } catch (error) {
      toast.error("创建会话失败", { description: String(error) });
    } finally {
      setIsCreatingChat((prev) => ({ ...prev, [friendId]: false }));
    }
  };

  // 组件加载时获取好友列表
  useEffect(() => {
    fetchFriendList();
  }, []);

  return (
    <div className="flex h-full rounded-2xl overflow-hidden shadow-lg bg-background/30 backdrop-blur-sm border">
      {/* 左侧分组导航 */}
      <FriendGroupNav
        groups={friendGroups}
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
        onAddFriend={() => setAddDialogOpen(true)}
      />

      {/* 右侧好友列表 */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between h-14">
          <h2 className="text-lg font-semibold">
            {currentGroup?.name || "好友列表"}
            <span className="ml-2 text-sm text-muted-foreground">
              ({currentGroup?.friends.length || 0})
            </span>
          </h2>
          <FriendRequestsButton onRequestsUpdated={fetchFriendList} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <FriendList
            group={currentGroup}
            isLoading={isLoading}
            onAddFriend={() => setAddDialogOpen(true)}
            onDeleteFriend={handleDeleteFriend}
            onSendMessage={handleSendMessage}
            isDeletingFriend={isDeletingFriend}
            isCreatingChat={isCreatingChat}
          />
        </div>
      </div>

      {/* 添加好友对话框 */}
      <AddFriendDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onFriendAdded={fetchFriendList}
      />
    </div>
  );
}
