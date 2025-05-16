// src/pages/Friends.tsx
import { useEffect, useState } from "react";
import { getFriends, deleteFriend } from "@/api/friends";
import { toast } from "sonner";
import {
  AddFriendDialog,
  FriendGroupNav,
  FriendList,
  type FriendGroup,
} from "@/components/friends";

/**
 * 好友页面
 */
export default function Friends() {
  const [friendGroups, setFriendGroups] = useState<FriendGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  const handleSendMessage = (friendId: number) => {
    // TODO: 实现发送消息功能
    toast.info(`即将开始与 ID 为 ${friendId} 的好友聊天`);
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
        <FriendList
          group={currentGroup}
          isLoading={isLoading}
          onAddFriend={() => setAddDialogOpen(true)}
          onDeleteFriend={handleDeleteFriend}
          onSendMessage={handleSendMessage}
          isDeletingFriend={isDeletingFriend}
        />
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
